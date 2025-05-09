import React from 'react';
import { render } from '@testing-library/react-native';
import Badge from '../../../components/common/Badge';

describe('Badge Component', () => {
  it('renders with default props', () => {
    const { getByText } = render(<Badge text="Test Badge" />);
    expect(getByText('Test Badge')).toBeTruthy();
  });

  it('renders with primary variant', () => {
    const { getByTestId } = render(
      <Badge text="Primary" variant="primary" testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#DBEAFE'
    }));
  });

  it('renders with secondary variant', () => {
    const { getByTestId } = render(
      <Badge text="Secondary" variant="secondary" testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#F3F4F6'
    }));
  });

  it('renders with success variant', () => {
    const { getByTestId } = render(
      <Badge text="Success" variant="success" testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#D1FAE5'
    }));
  });

  it('renders with warning variant', () => {
    const { getByTestId } = render(
      <Badge text="Warning" variant="warning" testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#FEF3C7'
    }));
  });

  it('renders with danger variant', () => {
    const { getByTestId } = render(
      <Badge text="Danger" variant="danger" testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#FEE2E2'
    }));
  });

  it('renders with small size', () => {
    const { getByTestId } = render(
      <Badge text="Small" size="small" testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      fontSize: 12,
      paddingHorizontal: 8,
      paddingVertical: 2
    }));
  });

  it('renders with medium size', () => {
    const { getByTestId } = render(
      <Badge text="Medium" size="medium" testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      fontSize: 14,
      paddingHorizontal: 10,
      paddingVertical: 4
    }));
  });

  it('renders with large size', () => {
    const { getByTestId } = render(
      <Badge text="Large" size="large" testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      fontSize: 16,
      paddingHorizontal: 12,
      paddingVertical: 6
    }));
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: 10 };
    const { getByTestId } = render(
      <Badge text="Custom Style" style={customStyle} testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(customStyle);
  });

  it('handles invalid variant gracefully', () => {
    const { getByTestId } = render(
      <Badge text="Invalid" variant={'invalid' as any} testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#DBEAFE'
    }));
  });

  it('handles invalid size gracefully', () => {
    const { getByTestId } = render(
      <Badge text="Invalid" size={'invalid' as any} testID="badge" />
    );
    const badge = getByTestId('badge');
    expect(badge.props.style).toContainEqual(expect.objectContaining({
      fontSize: 12,
      paddingHorizontal: 8,
      paddingVertical: 2
    }));
  });
}); 