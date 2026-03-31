import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { tagHubSpotContact } from '@/lib/hubspot'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const facilityId = session.metadata?.facility_id

      if (!facilityId) {
        console.error('No facility_id in checkout session metadata')
        break
      }

      const { error } = await supabase
        .from('facilities')
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active',
        })
        .eq('id', facilityId)

      if (error) {
        console.error('Failed to update facility after checkout:', error.message)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { error } = await supabase
        .from('facilities')
        .update({ subscription_status: 'cancelled' })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('Failed to update facility on subscription deletion:', error.message)
      }

      // Tag facility admin as churned in HubSpot
      if (!error) {
        const { data: facility } = await supabase
          .from('facilities')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (facility) {
          const { data: admin } = await supabase
            .from('profiles')
            .select('email')
            .eq('facility_id', facility.id)
            .eq('role', 'facility_admin')
            .eq('is_active', true)
            .single()

          if (admin?.email) {
            tagHubSpotContact(admin.email, 'Churned').catch((err: unknown) => {
              console.error('[HubSpot] Churn tag failed:', err instanceof Error ? err.message : err)
            })
          }
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Map Stripe status to our internal status
      const statusMap: Record<string, string> = {
        active: 'active',
        trialing: 'trialing',
        past_due: 'past_due',
        canceled: 'cancelled',
        unpaid: 'past_due',
        incomplete: 'pending',
        incomplete_expired: 'cancelled',
        paused: 'cancelled',
      }

      const mappedStatus = statusMap[subscription.status] ?? subscription.status

      const { error } = await supabase
        .from('facilities')
        .update({ subscription_status: mappedStatus })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('Failed to update facility on subscription update:', error.message)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { error } = await supabase
        .from('facilities')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('Failed to update facility on payment failure:', error.message)
      }
      break
    }

    default:
      // Unhandled event type — acknowledge receipt
      break
  }

  return NextResponse.json({ received: true })
}
