import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // TODO: Implement actual authentication with Prisma + bcrypt
    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Login endpoint ready. Connect to database to authenticate.',
      user: { email },
    })
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
