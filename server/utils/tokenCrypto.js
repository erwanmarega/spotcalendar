const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const ENC_PREFIX = 'enc:';

function getKey() {
  const hex = process.env.ENCRYPTION_SECRET;
  if (!hex || hex.length !== 64) throw new Error('ENCRYPTION_SECRET must be a 64-char hex string (32 bytes)');
  return Buffer.from(hex, 'hex');
}

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${ENC_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(stored) {
  // Tokens not yet migrated are returned as-is
  if (!stored.startsWith(ENC_PREFIX)) return stored;

  const [, ivHex, authTagHex, dataHex] = stored.split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = { encrypt, decrypt };
