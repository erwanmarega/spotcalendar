const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

require('./jobs/weeklyEmail');

const authRoutes = require('./routes/auth');
const spotifyRoutes = require('./routes/spotify');
const emailRoutes = require('./routes/email');

const app = express();

app.use(express.static(path.join(__dirname, 'front')));

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
