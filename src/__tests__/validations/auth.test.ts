import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@facility.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@facility.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(loginSchema.safeParse({}).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false)
    expect(loginSchema.safeParse({ password: 'password123' }).success).toBe(false)
  })
})

describe('signupSchema', () => {
  it('accepts valid signup data', () => {
    const result = signupSchema.safeParse({
      email: 'admin@facility.com',
      password: 'securepass',
      full_name: 'John Smith',
    })
    expect(result.success).toBe(true)
  })

  it('rejects name shorter than 2 characters', () => {
    const result = signupSchema.safeParse({
      email: 'admin@facility.com',
      password: 'securepass',
      full_name: 'J',
    })
    expect(result.success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@test.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false)
    expect(forgotPasswordSchema.safeParse({ email: 'not-email' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirm_password: 'newpassword123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirm_password: 'different',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'short',
      confirm_password: 'short',
    })
    expect(result.success).toBe(false)
  })
})
