import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('calls onClick handler', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  it('is disabled when loading', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByText('Loading').closest('button')).toBeDisabled()
  })

  it('shows spinner when loading', () => {
    render(<Button loading>Saving</Button>)
    expect(screen.getByText('Saving').closest('button')?.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { container } = render(<Button variant="danger">Delete</Button>)
    expect(container.querySelector('.btn-danger')).toBeInTheDocument()
  })

  it('applies size classes', () => {
    const { container } = render(<Button size="lg">Large</Button>)
    expect(container.querySelector('.px-8')).toBeInTheDocument()
  })
})
