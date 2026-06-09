const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

require('./jobs/weeklyEmail');

const authRoutes = require('./routes/auth');
const spotifyRoutes = require('./routes/spotify');
const emailRoutes = require('./routes/email');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://*.scdn.co', 'https://*.spotifycdn.com'],
      mediaSrc: ["'self'"],
      connectSrc: ["'self'", 'https://accounts.spotify.com'],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(express.static(path.join(__dirname, 'front')));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessaie plus tard' },
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop d'envois d'emails, réessaie plus tard" },
});

app.use('/api', globalLimiter);
app.use(['/api/token', '/api/refresh-token'], authLimiter);
app.use(['/api/test-email', '/api/unsubscribe'], emailLimiter);

const allowedOrigins = [process.env.SERVER_URL].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origine non autorisée par CORS: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (!process.env.REDIRECT_URI) {
  throw new Error('REDIRECT_URI is not defined in .env file');
}

app.use('/api', authRoutes);
app.use('/api', spotifyRoutes);
app.use('/api', emailRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

module.exports = app;
