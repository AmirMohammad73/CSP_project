const express = require('express');
const cors = require('cors');
const { getMapStatusData, getLocationsData, getUpdateStatusData, getGeocodeStatusData } = require('./api');
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Data endpoint
app.get('/api/data', async (req, res) => {
  try {
    const data = await getMapStatusData();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/locations', async (req, res) => {
  try {
    const data = await getLocationsData();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/update', async (req, res) => {
  try {
    const data = await getUpdateStatusData();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/geocode', async (req, res) => {
  try {
    const data = await getGeocodeStatusData();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://172.16.8.33:${port}`);
});