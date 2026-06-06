import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';

vi.mock('../api', () => ({
  checkTokens: vi.fn(),
}));

import { checkTokens } from '../api';

function renderLogin({ locationState = null } = {}) {
  const initialEntries = locationState ? [{ pathname: '/login', state: locationState }] : ['/login'];
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/calendar" element={<div>Page Calendrier</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkTokens.mockResolvedValue({ access_token_exists: false });
  });

  it('affiche le bouton de connexion Spotify', async () => {
    renderLogin();
    expect(await screen.findByText(/se connecter avec spotify/i)).toBeInTheDocument();
  });

  it('affiche le message d\'erreur passé dans location.state', async () => {
    renderLogin({ locationState: { error: 'Accès refusé par Spotify' } });
    expect(await screen.findByText('Accès refusé par Spotify')).toBeInTheDocument();
  });

  it('redirige vers /calendar si le token est valide', async () => {
    checkTokens.mockResolvedValue({
      access_token_exists: true,
      expires_at: String(Date.now() + 3_600_000),
    });

    renderLogin();

    await waitFor(() => {
      expect(screen.getByText('Page Calendrier')).toBeInTheDocument();
    });
  });

  it('ne redirige pas si le token est expiré', async () => {
    checkTokens.mockResolvedValue({
      access_token_exists: true,
      expires_at: String(Date.now() - 1000),
    });

    renderLogin();

    await waitFor(() => {
      expect(screen.queryByText('Page Calendrier')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/se connecter avec spotify/i)).toBeInTheDocument();
  });

  it('ne redirige pas si fromLogout est true', async () => {
    checkTokens.mockResolvedValue({
      access_token_exists: true,
      expires_at: String(Date.now() + 3_600_000),
    });

    renderLogin({ locationState: { fromLogout: true } });

    await waitFor(() => {
      expect(screen.queryByText('Page Calendrier')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/se connecter avec spotify/i)).toBeInTheDocument();
  });

  it('le bouton de connexion est cliquable', async () => {
    const user = userEvent.setup();
    renderLogin();

    const button = await screen.findByRole('button', { name: /se connecter avec spotify/i });
    expect(button).not.toBeDisabled();

    const originalLocation = window.location.href;
    await user.click(button);
    expect(typeof sessionStorage.getItem('oauth_state')).toBe('string');
  });
});
