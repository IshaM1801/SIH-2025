// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
//backend/
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/', (req, res) => res.send('server hi'));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));