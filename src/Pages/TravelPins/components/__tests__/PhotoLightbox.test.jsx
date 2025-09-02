import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoLightbox from '../PhotoLightbox';

describe('PhotoLightbox', () => {
  const mockData = {
    url: 'https://example.com/photo.jpg',
    title: 'Test Photo Title'
  };

  const defaultProps = {
    open: true,
    data: mockData,
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render null when open is false', () => {
    const props = { ...defaultProps, open: false };
    const { container } = render(<PhotoLightbox {...props} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render lightbox content when open is true', () => {
    render(<PhotoLightbox {...defaultProps} />);

    expect(screen.getByAltText('Test Photo Title')).toBeInTheDocument();
    expect(screen.getByText('Test Photo Title')).toBeInTheDocument();
  });

  it('should display image with correct src and alt attributes', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const image = screen.getByAltText('Test Photo Title');
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(image).toHaveAttribute('alt', 'Test Photo Title');
  });

  it('should display photo title in bottom overlay', () => {
    render(<PhotoLightbox {...defaultProps} />);

    expect(screen.getByText('Test Photo Title')).toBeInTheDocument();
  });

  it('should have close button that calls onClose when clicked', async () => {
    const user = userEvent.setup();
    render(<PhotoLightbox {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should have proper styling classes for full-screen overlay', () => {
    render(<PhotoLightbox {...defaultProps} />);

    // Find the overlay container
    const overlay = screen.getByAltText('Test Photo Title').closest('.fixed');
    expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-90');
  });

  it('should have proper z-index for modal', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const overlay = screen.getByAltText('Test Photo Title').closest('.fixed');
    expect(overlay).toHaveClass('z-[9999]');
  });

  it('should have responsive image sizing', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const image = screen.getByAltText('Test Photo Title');
    expect(image).toHaveClass('max-w-full', 'max-h-full', 'object-contain');
  });

  it('should have close button with proper styling', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    expect(closeButton).toHaveClass('absolute', 'top-4', 'right-4', 'w-12', 'h-12');
  });

  it('should display X icon in close button', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('should handle missing data gracefully', () => {
    const props = { ...defaultProps, data: { url: '', title: '' } };
    
    // Should render without crashing when data has empty values
    expect(() => render(<PhotoLightbox {...props} />)).not.toThrow();
  });

  it('should handle empty title gracefully', () => {
    const dataWithEmptyTitle = { ...mockData, title: '' };
    const props = { ...defaultProps, data: dataWithEmptyTitle };
    
    render(<PhotoLightbox {...props} />);

    const image = screen.getByAltText('');
    expect(image).toBeInTheDocument();
  });


  it('should have backdrop blur effect on close button', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    expect(closeButton).toHaveClass('backdrop-blur-sm');
  });

  it('should have backdrop blur effect on title overlay', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const titleContainer = screen.getByText('Test Photo Title').closest('.bg-black');
    expect(titleContainer).toHaveClass('backdrop-blur-sm');
  });

  it('should have proper border styling on elements', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    const titleContainer = screen.getByText('Test Photo Title').closest('.bg-black');

    expect(closeButton).toHaveClass('border', 'border-white/20');
    expect(titleContainer).toHaveClass('border', 'border-white/20');
  });

  it('should have transition effects on close button', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    expect(closeButton).toHaveClass('transition-colors', 'duration-200');
  });

  it('should have rounded corners on image and elements', () => {
    render(<PhotoLightbox {...defaultProps} />);

    const image = screen.getByAltText('Test Photo Title');
    const closeButton = screen.getByRole('button');
    const titleContainer = screen.getByText('Test Photo Title').closest('.bg-black');

    expect(image).toHaveClass('rounded-lg');
    expect(closeButton).toHaveClass('rounded-full');
    expect(titleContainer).toHaveClass('rounded-xl');
  });
});