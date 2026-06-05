import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

vi.mock('axios');
vi.mock('../../db', () => ({
  default: { prepare: vi.fn(() => ({ run: vi.fn() })) },
}));

process.env.SPOTIFY_CLIENT_ID = 'test-client-id';
process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret';
process.env.REDIRECT_URI = 'http://localhost:5173/callback';
process.env.NODE_ENV = 'test';

const { default: authRouter } = await import('../../routes/auth.js');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api', authRouter);
  return app;
}

describe('GET /api/check-tokens', () => {
  it('retourne false pour tous les champs si aucun cookie', async () => {
    const res = await request(createApp()).get('/api/check-tokens');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      access_token_exists: false,
      refresh_token_exists: false,
      expires_at: null,
      token_type: null,
    });
  });

  it('retourne true si les cookies sont présents', async () => {
    const res = await request(createApp())
      .get('/api/check-tokens')
      .set('Cookie', ['access_token=abc123', 'refresh_token=ref456', 'expires_at=9999999999000', 'token_type=Bearer']);

    expect(res.status).toBe(200);
    expect(res.body.access_token_exists).toBe(true);
    expect(res.body.refresh_token_exists).toBe(true);
    expect(res.body.expires_at).toBe('9999999999000');
    expect(res.body.token_type).toBe('Bearer');
  });
});

describe('POST /api/logout', () => {
  it('supprime les cookies et retourne un message de succès', async () => {
    const res = await request(createApp())
      .post('/api/logout')
      .set('Cookie', ['access_token=abc', 'refresh_token=ref']);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/déconnexion/i);

    const cookies = res.headers['set-cookie'] || [];
    const cleared = cookies.filter((c) => c.includes('Expires=Thu, 01 Jan 1970') || c.includes('Max-Age=0'));
    expect(cleared.length).toBeGreaterThan(0);
  });
});

describe('POST /api/token', () => {
  it('retourne 400 si aucun code n\'est fourni', async () => {
    const res = await request(createApp()).post('/api/token').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('retourne 400 si le body est vide', async () => {
    const res = await request(createApp()).post('/api/token');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/refresh-token', () => {
  it('retourne 400 si aucun refresh_token dans les cookies', async () => {
    const res = await request(createApp()).post('/api/refresh-token');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
