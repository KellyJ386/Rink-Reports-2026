import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders without label', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
  })

  it('sets aria-invalid when error exists', () => {
    render(<Input label="Email" error="Required" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid without error', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
  })

  it('handles value changes', () => {
    const onChange = jest.fn()
    render(<Input label="Name" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('generates id from label', () => {
    render(<Input label="Facility Name" />)
    const input = screen.getByLabelText('Facility Name')
    expect(input.id).toBe('facility-name')
  })
})
