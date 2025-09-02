import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  const mockMessages = {
    'travel_pins.delete_modal.title': 'Delete Travel Pin',
    'travel_pins.delete_modal.subtitle': 'This action cannot be undone',
    'travel_pins.delete_modal.pin_to_delete': 'PIN TO DELETE',
    'travel_pins.delete_modal.confirmation_title': 'Are you sure?',
    'travel_pins.delete_modal.confirmation_text': 'This will permanently delete this travel pin and all associated data.',
    'travel_pins.delete_modal.cancel_button': 'CANCEL',
    'travel_pins.delete_modal.delete_forever_button': 'DELETE FOREVER',
    'travel_pins.popup.visited': 'Visited on'
  };

  const mockPin = {
    id: 1,
    title: 'Test Pin to Delete',
    note: 'This is a test note for the pin',
    visited_at: '2024-03-15'
  };

  const defaultProps = {
    open: true,
    pin: mockPin,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    formatDate: vi.fn((date) => `formatted_${date}`),
    t: (key) => mockMessages[key] || key
  };

  const renderWithIntl = (component) => {
    return render(
      <IntlProvider locale="en" messages={mockMessages}>
        {component}
      </IntlProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render null when open is false', () => {
    const props = { ...defaultProps, open: false };
    const { container } = renderWithIntl(<DeleteConfirmationModal {...props} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render modal content when open is true', () => {
    renderWithIntl(<DeleteConfirmationModal {...defaultProps} />);

    expect(screen.getByText('Delete Travel Pin')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
    expect(screen.getByText('PIN TO DELETE')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('CANCEL')).toBeInTheDocument();
    expect(screen.getByText('DELETE FOREVER')).toBeInTheDocument();
  });

  it('should display pin title', () => {
    renderWithIntl(<DeleteConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Test Pin to Delete')).toBeInTheDocument();
  });

  it('should display pin note when present', () => {
    renderWithIntl(<DeleteConfirmationModal {...defaultProps} />);
    expect(screen.getByText('This is a test note for the pin')).toBeInTheDocument();
  });

  it('should display formatted visit date when present', () => {
    renderWithIntl(<DeleteConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Visited on formatted_2024-03-15')).toBeInTheDocument();
    expect(defaultProps.formatDate).toHaveBeenCalledWith('2024-03-15');
  });

  it('should not display note when pin has no note', () => {
    const pinWithoutNote = { ...mockPin, note: null };
    const props = { ...defaultProps, pin: pinWithoutNote };
    renderWithIntl(<DeleteConfirmationModal {...props} />);

    expect(screen.queryByText('This is a test note for the pin')).not.toBeInTheDocument();
  });

  it('should not display visit date when pin has no visited_at', () => {
    const pinWithoutDate = { ...mockPin, visited_at: null };
    const props = { ...defaultProps, pin: pinWithoutDate };
    renderWithIntl(<DeleteConfirmationModal {...props} />);

    expect(screen.queryByText(/Visited on/)).not.toBeInTheDocument();
    expect(defaultProps.formatDate).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithIntl(<DeleteConfirmationModal {...defaultProps} />);

    const cancelButton = screen.getByText('CANCEL');
    await user.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithIntl(<DeleteConfirmationModal {...defaultProps} />);

    const deleteButton = screen.getByText('DELETE FOREVER');
    await user.click(deleteButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should handle null pin gracefully', () => {
    const props = { ...defaultProps, pin: null };
    renderWithIntl(<DeleteConfirmationModal {...props} />);

    expect(screen.getByText('Delete Travel Pin')).toBeInTheDocument();
    expect(screen.getByText('CANCEL')).toBeInTheDocument();
    expect(screen.getByText('DELETE FOREVER')).toBeInTheDocument();
  });

  it('should display warning and location icons', () => {
    renderWithIntl(<DeleteConfirmationModal {...defaultProps} />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('📍')).toBeInTheDocument();
    expect(screen.getByText('💡')).toBeInTheDocument();
  });
});