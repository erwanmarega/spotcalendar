import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(() => {
  process.env.UNSUBSCRIBE_SECRET = 'test-secret-123';
});

const { generateUnsubscribeToken, getUserIdFromToken } = await import('../services/emailService.js');

describe('generateUnsubscribeToken / getUserIdFromToken', () => {
  it('roundtrip: le token généré est correctement décodable', () => {
    const userId = 'user-abc-123';
    const token = generateUnsubscribeToken(userId);
    expect(getUserIdFromToken(token)).toBe(userId);
  });

  it('fonctionne avec des userId contenant des caractères spéciaux', () => {
    const userId = 'user:with:colons';
    const token = generateUnsubscribeToken(userId);
    expect(getUserIdFromToken(token)).toBe(userId);
  });

  it('retourne null si la signature est falsifiée', () => {
    const token = generateUnsubscribeToken('user-xyz');
    const tampered = token.slice(0, -4) + 'xxxx';
    expect(getUserIdFromToken(tampered)).toBeNull();
  });

  it('retourne null si le token est vide', () => {
    expect(getUserIdFromToken('')).toBeNull();
  });

  it('retourne null si le token est invalide', () => {
    expect(getUserIdFromToken('not-a-valid-token-at-all')).toBeNull();
  });

  it('deux utilisateurs différents produisent des tokens différents', () => {
    const t1 = generateUnsubscribeToken('user-1');
    const t2 = generateUnsubscribeToken('user-2');
    expect(t1).not.toBe(t2);
  });
});
