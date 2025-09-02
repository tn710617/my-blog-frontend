import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import PinForm from '../PinForm';

describe('PinForm', () => {
  const mockMessages = {
    'travel_pins.form.add_title': 'Add Travel Pin',
    'travel_pins.form.edit_title': 'Edit Travel Pin',
    'travel_pins.form.title_label': 'TITLE',
    'travel_pins.form.title_placeholder': 'Enter pin title...',
    'travel_pins.form.travel_notes_label': 'TRAVEL NOTES',
    'travel_pins.form.travel_notes_placeholder': 'Share your memories...',
    'travel_pins.form.visit_date_label': 'VISIT DATE',
    'travel_pins.form.visit_date_placeholder': 'Select date',
    'travel_pins.form.photo_url_label': 'PHOTO URL',
    'travel_pins.form.photo_url_placeholder': 'https://...',
    'travel_pins.form.photo_preview': 'Preview',
    'travel_pins.form.invalid_url': 'Invalid URL',
    'travel_pins.form.cancel_button': 'CANCEL',
    'travel_pins.form.save_button': 'SAVE',
    'travel_pins.form.update_button': 'UPDATE'
  };

  const defaultProps = {
    editing: false,
    t: (key) => mockMessages[key] || key,
    formData: {
      title: '',
      note: '',
      visited_at: '',
      photo_url: '',
      coordinates: null
    },
    setField: vi.fn(),
    formatDate: vi.fn((date) => `formatted_${date}`),
    onCancel: vi.fn(),
    onSubmit: vi.fn()
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

  it('should render create form correctly', () => {
    renderWithIntl(<PinForm {...defaultProps} />);

    expect(screen.getByText('Add Travel Pin')).toBeInTheDocument();
    expect(screen.getByText('TITLE')).toBeInTheDocument();
    expect(screen.getByText('TRAVEL NOTES')).toBeInTheDocument();
    expect(screen.getByText('VISIT DATE')).toBeInTheDocument();
    expect(screen.getByText('PHOTO URL')).toBeInTheDocument();
    expect(screen.getByText('CANCEL')).toBeInTheDocument();
    expect(screen.getByText('SAVE')).toBeInTheDocument();
  });

  it('should render edit form correctly', () => {
    const editProps = { ...defaultProps, editing: true };
    renderWithIntl(<PinForm {...editProps} />);

    expect(screen.getByText('Edit Travel Pin')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
    expect(screen.queryByText('SAVE')).not.toBeInTheDocument();
  });

  it('should render form fields with correct values', () => {
    const formData = {
      title: 'Test Pin',
      note: 'Test note',
      visited_at: '2024-03-15',
      photo_url: 'https://example.com/photo.jpg',
      coordinates: [121.5, 25.0]
    };
    const props = { ...defaultProps, formData };
    renderWithIntl(<PinForm {...props} />);

    expect(screen.getByDisplayValue('Test Pin')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/photo.jpg')).toBeInTheDocument();
    expect(screen.getByDisplayValue('formatted_2024-03-15')).toBeInTheDocument();
  });

  it('should call setField when title input changes', async () => {
    const user = userEvent.setup();
    renderWithIntl(<PinForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('Enter pin title...');
    await user.type(titleInput, 'T');

    expect(defaultProps.setField).toHaveBeenCalledWith('title', 'T');
  });

  it('should call setField when note textarea changes', async () => {
    const user = userEvent.setup();
    renderWithIntl(<PinForm {...defaultProps} />);

    const noteTextarea = screen.getByPlaceholderText('Share your memories...');
    await user.type(noteTextarea, 'N');

    expect(defaultProps.setField).toHaveBeenCalledWith('note', 'N');
  });

  it('should call setField when photo URL input changes', async () => {
    const user = userEvent.setup();
    renderWithIntl(<PinForm {...defaultProps} />);

    const photoInput = screen.getByPlaceholderText('https://...');
    await user.type(photoInput, 'h');

    expect(defaultProps.setField).toHaveBeenCalledWith('photo_url', 'h');
  });

  it('should call setField when date input changes', () => {
    renderWithIntl(<PinForm {...defaultProps} />);

    const hiddenDateInput = document.getElementById('hidden-date-input');
    fireEvent.change(hiddenDateInput, { target: { value: '2024-03-20' } });

    expect(defaultProps.setField).toHaveBeenCalledWith('visited_at', '2024-03-20');
  });

  it('should show photo preview when photo_url is provided', () => {
    const formData = { ...defaultProps.formData, photo_url: 'https://example.com/photo.jpg' };
    const props = { ...defaultProps, formData };
    renderWithIntl(<PinForm {...props} />);

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByAltText('Preview')).toBeInTheDocument();
    expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('should not show photo preview when photo_url is empty', () => {
    renderWithIntl(<PinForm {...defaultProps} />);

    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  });

  it('should show coordinates section when coordinates are provided', () => {
    const formData = { ...defaultProps.formData, coordinates: [121.5, 25.0] };
    const props = { ...defaultProps, formData };
    renderWithIntl(<PinForm {...props} />);

    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('COORDINATES')).toBeInTheDocument();
    expect(screen.getByText('25.000000, 121.500000')).toBeInTheDocument();
  });

  it('should not show coordinates section when coordinates are null', () => {
    renderWithIntl(<PinForm {...defaultProps} />);

    expect(screen.queryByText('Location')).not.toBeInTheDocument();
    expect(screen.queryByText('COORDINATES')).not.toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', () => {
    renderWithIntl(<PinForm {...defaultProps} />);

    const form = document.querySelector('form');
    fireEvent.submit(form);

    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithIntl(<PinForm {...defaultProps} />);

    const cancelButton = screen.getByText('CANCEL');
    await user.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should call onCancel when close button (X) is clicked', async () => {
    const user = userEvent.setup();
    renderWithIntl(<PinForm {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: '' }); // The X button has no text
    await user.click(closeButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should have required attribute on title input', () => {
    renderWithIntl(<PinForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('Enter pin title...');
    expect(titleInput).toHaveAttribute('required');
  });

  it('should have proper font size for mobile compatibility', () => {
    renderWithIntl(<PinForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('Enter pin title...');
    const noteTextarea = screen.getByPlaceholderText('Share your memories...');
    const photoInput = screen.getByPlaceholderText('https://...');

    expect(titleInput).toHaveStyle({ fontSize: '16px' });
    expect(noteTextarea).toHaveStyle({ fontSize: '16px' });
    expect(photoInput).toHaveStyle({ fontSize: '16px' });
  });

  it('should trigger showPicker when visible date input is clicked', async () => {
    const mockShowPicker = vi.fn();
    const mockFocus = vi.fn();

    // Mock the getElementById and showPicker
    const originalGetElementById = document.getElementById;
    document.getElementById = vi.fn(() => ({
      showPicker: mockShowPicker,
      focus: mockFocus
    }));

    const user = userEvent.setup();
    renderWithIntl(<PinForm {...defaultProps} />);

    const visibleDateInput = screen.getByPlaceholderText('Select date');
    await user.click(visibleDateInput);

    expect(mockShowPicker).toHaveBeenCalled();

    // Restore original method
    document.getElementById = originalGetElementById;
  });

  it('should call formatDate for display when visited_at is present', () => {
    const formData = { ...defaultProps.formData, visited_at: '2024-03-15' };
    const props = { ...defaultProps, formData };
    renderWithIntl(<PinForm {...props} />);

    expect(defaultProps.formatDate).toHaveBeenCalledWith('2024-03-15');
  });

  it('should handle image error correctly in photo preview', () => {
    const formData = { ...defaultProps.formData, photo_url: 'https://invalid-url.jpg' };
    const props = { ...defaultProps, formData };
    renderWithIntl(<PinForm {...props} />);

    const previewImage = screen.getByAltText('Preview');
    
    // Simulate image error
    fireEvent.error(previewImage);

    // The error handler should hide the image and show fallback
    expect(previewImage.style.display).toBe('none');
  });
});