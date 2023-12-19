import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Enter Serial Number input', () => {
  render(<App />);
  const linkElement = screen.getByPlaceholderText(/Enter Serial Number/i);
  expect(linkElement).toBeInTheDocument();
});
