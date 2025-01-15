const express = require('express');
const cors = require('cors');
const { getMapStatusData, getLocationsData, getUpdateStatusData, getGeocodeStatusData, getPlateStatusData, getNationalIDStatusData, getDetailedLocationsData, getShahrestanData, getZoneData, getDehestanData, getRoostaData, getOstanNames, getQueryData } = require('./api');
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
	console.log(data);
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
// Endpoint to handle the query with dynamic WHERE conditions
app.post('/query', async (req, res) => {
    try {
        const { selectedItems } = req.body; // Array of selected ostantitles
        const data = await getQueryData(selectedItems);
        res.json(data);
    } catch (err) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/api/locations/detailed', async (req, res) => {
  try {
    const data = await getDetailedLocationsData();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/locations/shahrestan', async (req, res) => {
  const { ostantitle } = req.query;
  console.log(ostantitle);
  try {
    const data = await getShahrestanData(ostantitle);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/locations/zone', async (req, res) => {
  const { ostantitle, shahrestantitle } = req.query;
  try {
    const data = await getZoneData(ostantitle, shahrestantitle);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/locations/dehestan', async (req, res) => {
  const { ostantitle, shahrestantitle, zonetitle } = req.query;
  try {
    const data = await getDehestanData(ostantitle, shahrestantitle, zonetitle);
	console.log(data);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/locations/roosta', async (req, res) => {
  const { ostantitle, shahrestantitle, zonetitle, dehestantitle } = req.query;
  try {
    const data = await getRoostaData(ostantitle, shahrestantitle, zonetitle, dehestantitle);
	console.log(data);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/ostans', async (req, res) => {
  try {
    const data = await getOstanNames();
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

// Data endpoint
app.get('/api/license-plate', async (req, res) => {
  try {
    const data = await getPlateStatusData();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/national-id', async (req, res) => {
  try {
    const data = await getNationalIDStatusData();
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