const express = require('express');
const cors = require('cors');
const { getMapStatusData, getLocationsData, getUpdateStatusData, getGeocodeStatusData, getPlateStatusData, getNationalIDStatusData, getDetailedLocationsData, getShahrestanData, getZoneData, getDehestanData, getRoostaData, getOstanNames, getQueryData, getPieMap, getBSCTab1Data, getBSCTab2Data, getBSCTab3Data, getBSCTab4Data, getBSCTab5Data, updateRoostaData } = require('./api');
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
app.get('/api/bsc/tab1', async (req, res) => {
  try {
    const data = await getBSCTab1Data();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/bsc/tab2', async (req, res) => {
  try {
    const data = await getBSCTab2Data();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/bsc/tab3', async (req, res) => {
  try {
    const data = await getBSCTab3Data();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/bsc/tab4', async (req, res) => {
  try {
    const data = await getBSCTab4Data();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/bsc/tab5', async (req, res) => {
  try {
    const data = await getBSCTab5Data();
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
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/dashboard/piemap', async (req, res) => {
  try {
    const data = await getPieMap();
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

// Endpoint to update roosta data
// POST /api/locations/update-roosta
app.post('/api/locations/update-roosta', async (req, res) => {
  const modifiedRecords = req.body;

  if (!Array.isArray(modifiedRecords) || modifiedRecords.length === 0) {
    return res.status(400).json({ error: 'No valid data provided' });
  }

  try {
    const result = await updateRoostaData(modifiedRecords);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating roosta data:', error);
    res.status(500).json({ error: 'Failed to update roosta data' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://172.16.8.33:${port}`);
});