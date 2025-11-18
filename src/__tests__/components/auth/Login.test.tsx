// src/components/auth/Login.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { Login } from '../../../components/auth/Login';
// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Login Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToSignup = jest.fn();
  const mockOnSwitchToForgotPassword = jest.fn();

  const defaultProps = {
    onSuccess: mockOnSuccess,
    onSwitchToSignup: mockOnSwitchToSignup,
    onSwitchToForgotPassword: mockOnSwitchToForgotPassword,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render all form fields', () => {
    render(<Login {...defaultProps} />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  it('should toggle password visibility when clicking the eye icon', async () => {
    render(<Login {...defaultProps} />);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
  it('should show loading state during submission', async () => {
    render(<Login {...defaultProps} />);
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });

    await userEvent.click(submitButton);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display error for wrong password', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Email ou mot de passe incorrect' } } });

    render(<Login {...defaultProps} />);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
    });
  });

  // Ajoutez d'autres tests similaires pour les autres fonctionnalités
});

// src/components/auth/Signup.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Signup from './Signup';
import axios from 'axios';

jest.mock('axios');

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<Signup />);
    expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /S'inscrire/i })).toBeInTheDocument();
  });

  it('should toggle password visibility for both password fields', async () => {
    render(<Signup />);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    await userEvent.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    await userEvent.click(toggleButtons[1]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    await userEvent.click(toggleButtons[0]);
    await userEvent.click(toggleButtons[1]);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

  it('should show loading state during submission', async () => {
    render(<Signup />);
    const submitButton = screen.getByRole('button', { name: /S'inscrire/i });

    await userEvent.click(submitButton);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display error for invalid email', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: "L'adresse email n'est pas valide" } } });

    render(<Signup />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /S'inscrire/i });

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/L'adresse email n'est pas valide/i)).toBeInTheDocument();
    });
  });

  // Ajoutez d'autres tests similaires pour les autres fonctionnalités
});
