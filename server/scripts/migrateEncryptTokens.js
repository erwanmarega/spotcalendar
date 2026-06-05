require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const db = require('../db');
const { encrypt, decrypt } = require('../utils/tokenCrypto');

const users = db.prepare('SELECT user_id, refresh_token FROM users').all();
let migrated = 0;

for (const user of users) {
  if (user.refresh_token.startsWith('enc:')) {
    continue; // already encrypted
  }
  db.prepare('UPDATE users SET refresh_token = ? WHERE user_id = ?')
    .run(encrypt(user.refresh_token), user.user_id);
  migrated++;
}

console.log(`Migration terminée : ${migrated} token(s) chiffré(s), ${users.length - migrated} déjà chiffré(s).`);
