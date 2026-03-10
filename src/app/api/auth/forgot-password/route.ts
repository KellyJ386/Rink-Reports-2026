import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // TODO: Implement password reset email flow
    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists for this email, a reset link has been sent.',
    })
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
