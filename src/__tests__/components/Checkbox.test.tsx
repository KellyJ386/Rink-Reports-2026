import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from '@/components/ui/Checkbox'

describe('Checkbox', () => {
  it('renders label text', () => {
    render(<Checkbox label="Check ice surface" />)
    expect(screen.getByText('Check ice surface')).toBeInTheDocument()
  })

  it('renders as unchecked by default', () => {
    render(<Checkbox label="Task" />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders as checked when checked prop is true', () => {
    render(<Checkbox label="Task" checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onChange handler', () => {
    const onChange = jest.fn()
    render(<Checkbox label="Task" onChange={onChange} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('shows timestamp and checkedBy', () => {
    render(
      <Checkbox
        label="Task"
        checked
        timestamp="2:30 PM"
        checkedBy="John Smith"
        onChange={() => {}}
      />
    )
    expect(screen.getByText('John Smith - 2:30 PM')).toBeInTheDocument()
  })

  it('shows timestamp without checkedBy', () => {
    render(
      <Checkbox label="Task" checked timestamp="3:00 PM" onChange={() => {}} />
    )
    expect(screen.getByText('3:00 PM')).toBeInTheDocument()
  })

  it('applies line-through style when checked', () => {
    render(<Checkbox label="Done task" checked onChange={() => {}} />)
    expect(screen.getByText('Done task')).toHaveClass('line-through')
  })
})
