import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from '../components/StarRating';

describe('StarRating', () => {
  it('renders 5 stars', () => {
    render(<StarRating />);
    const stars = screen.getAllByRole('radio');
    expect(stars).toHaveLength(5);
  });

  it('renders with correct initial value', () => {
    render(<StarRating value={3} readOnly />);
    const stars = screen.getAllByRole('radio');
    // First 3 should be checked
    expect(stars[0]).toHaveAttribute('aria-checked', 'true');
    expect(stars[2]).toHaveAttribute('aria-checked', 'true');
    expect(stars[3]).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when star is clicked', async () => {
    const handleChange = vi.fn();
    render(<StarRating onChange={handleChange} />);
    
    const stars = screen.getAllByRole('radio');
    await userEvent.click(stars[2]); // Click 3rd star

    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('does not call onChange when read-only', async () => {
    const handleChange = vi.fn();
    render(<StarRating value={4} readOnly onChange={handleChange} />);
    
    const stars = screen.getAllByRole('radio');
    await userEvent.click(stars[0]);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('displays value text when showValue is true', () => {
    render(<StarRating value={4.5} showValue readOnly />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('has correct aria-label on stars', () => {
    render(<StarRating />);
    expect(screen.getByLabelText('1 star')).toBeInTheDocument();
    expect(screen.getByLabelText('5 stars')).toBeInTheDocument();
  });
});
