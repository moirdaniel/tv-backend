// tv-backend: API completa CRUD + CORS dinámico

const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const CHANNELS_FILE = path.join(__dirname, 'channels.json');

// Middleware: permitir múltiples orígenes para CORS dinámico
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://192.168.1.92:3001',
  'http://192.168.1.92:3002',
  'https://tv-free.moir.cl',
  'https://api-tv.moir.cl',
  'https://admin-tv.moir.cl'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origen (como curl/postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));

app.use(express.json());

// GET: lista completa de canales
app.get('/api/channels', (req, res) => {
  fs.readFile(CHANNELS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer el archivo' });
    res.json(JSON.parse(data));
  });
});

// POST: sobrescribe todos los canales
app.post('/api/channels', (req, res) => {
  fs.writeFile(CHANNELS_FILE, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Error al guardar el archivo' });
    res.json({ ok: true });
  });
});

// PUT: editar canal por ID
app.put('/api/channels/:id', (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(CHANNELS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer' });
    let channels = JSON.parse(data);
    channels = channels.map(c => c.id === id ? { ...c, ...req.body } : c);
    fs.writeFile(CHANNELS_FILE, JSON.stringify(channels, null, 2), 'utf8', err => {
      if (err) return res.status(500).json({ error: 'Error al guardar' });
      res.json({ ok: true });
    });
  });
});

// DELETE: eliminar canal por ID
app.delete('/api/channels/:id', (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(CHANNELS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer' });
    let channels = JSON.parse(data).filter(c => c.id !== id);
    fs.writeFile(CHANNELS_FILE, JSON.stringify(channels, null, 2), 'utf8', err => {
      if (err) return res.status(500).json({ error: 'Error al guardar' });
      res.json({ ok: true });
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor API TV corriendo en http://0.0.0.0:${PORT}`);
});
