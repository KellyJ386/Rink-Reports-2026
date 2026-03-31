import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '@/components/ui/Modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    )
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders content when open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Edit Item">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('Edit Item')).toBeInTheDocument()
  })

  it('has proper ARIA attributes', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Settings">
        <p>Content</p>
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    )
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    )
    // Click the backdrop (the element with aria-hidden="true")
    const backdrop = document.querySelector('[aria-hidden="true"]')
    if (backdrop) fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape key', () => {
    const onClose = jest.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
