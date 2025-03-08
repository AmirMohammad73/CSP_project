const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { getMapStatusData, getLocationsData, getUpdateStatusData, getGeocodeStatusData, getPlateStatusData, getNationalIDStatusData, getDetailedLocationsData, getShahrestanData, getZoneData, getDehestanData, getRoostaData, getOstanNames, getQueryData, getPieMap, getBSCTab1Data, getBSCTab2Data, getBSCTab3Data, getBSCTab4Data, getBSCTab5Data, updateRoostaData, getPostalCodeRequest, storeToken, generateToken, authenticateUser, authenticateToken, blacklistToken, getGnafIndexData, changePassword, getInteroperability, getNotifications, getUsernameById, SetTimestamp, getMapCount, getUpdateCount, getDadehCount, getGeoCount, getRadarData, getWeeklyData, getMonthlyData, getQuarterlyData, getBests, getProgressData } = require('./api');

const JWT_SECRET = 'efd6401dca50843be8272263a61b1a97959fdfafb1f0bcedc6210269c7c84902';
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
app.get('/api/data', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getMapStatusData(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Data endpoint
app.get('/api/progressdata', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getProgressData(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/locations', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // User information is available from the authenticated token
    if (user.role === '4') {
      // For role 4, return an empty array or skip fetching data
      res.json(['ostan']);
    } else if (user.role === '1') {
      res.json(['setad']);
    } else if (user.role === '5') {
      // Fetch general locations data
      const data = await getLocationsData();
      // Combine ['QR'] with the fetched data
      const combinedData = ['QR', ...data];
      // Send the combined data as response
      res.json(combinedData);
    } else if (user.role === '3') {
      // Fetch general locations data
      const data = await getLocationsData();
      const combinedData = ['nazer', ...data];
      res.json(combinedData);
    } else {
      // For other roles, fetch and return the general locations data
      const data = await getLocationsData();
      res.json(data);
    }
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/bsc/tab1', authenticateToken, async (req, res) => {
  try {
    const data = await getBSCTab1Data();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/bsc/tab2', authenticateToken, async (req, res) => {
  try {
    const data = await getBSCTab2Data();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/bsc/tab3', authenticateToken, async (req, res) => {
  try {
    const data = await getBSCTab3Data();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/bsc/tab4', authenticateToken, async (req, res) => {
  try {
    const data = await getBSCTab4Data();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/bsc/tab5', authenticateToken, async (req, res) => {
  try {
    const data = await getBSCTab5Data();
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to handle the query with dynamic WHERE conditions
app.post('/query', authenticateToken, async (req, res) => {
    try {
        const { selectedItems } = req.body;
		console.log("selectedItems:", selectedItems);
        const { role, permission } = req.user;
        const data = await getQueryData(selectedItems, role, permission);
        res.json(data);
    } catch (err) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/api/locations/detailed', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // User information is available from the authenticated token
    const data = await getDetailedLocationsData(user);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/mapcount', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // User information is available from the authenticated token
    const data = await getMapCount(user);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/updatecount', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // User information is available from the authenticated token
    const data = await getUpdateCount(user);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/dadehcount', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // User information is available from the authenticated token
    const data = await getDadehCount(user);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/geocount', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // User information is available from the authenticated token
    const data = await getGeoCount(user);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/locations/shahrestan', authenticateToken, async (req, res) => {
  const { ostantitle } = req.query;
  try {
    const data = await getShahrestanData(ostantitle);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/locations/zone', authenticateToken, async (req, res) => {
  const { ostantitle, shahrestantitle } = req.query;
  try {
    const data = await getZoneData(ostantitle, shahrestantitle);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/locations/dehestan', authenticateToken, async (req, res) => {
  const { ostantitle, shahrestantitle, zonetitle } = req.query;
  try {
    const data = await getDehestanData(ostantitle, shahrestantitle, zonetitle);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/locations/roosta', authenticateToken, async (req, res) => {
  const { ostantitle, shahrestantitle, zonetitle, dehestantitle } = req.query;
  try {
    const data = await getRoostaData(ostantitle, shahrestantitle, zonetitle, dehestantitle);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/dashboard/piemap', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // Assuming `authenticateToken` adds the user's info to `req.user`
    const data = await getPieMap(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/ostans', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getOstanNames(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Data endpoint
app.get('/api/update', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getUpdateStatusData(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/geocode', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getGeocodeStatusData(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/radardata', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getRadarData(user);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Data endpoint
app.get('/api/weeklydata', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getWeeklyData(user.role, user.permission, user.username);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/monthlydata', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getMonthlyData(user.role, user.permission, user.username);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/quarterlydata', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getQuarterlyData(user.role, user.permission, user.username);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Data endpoint
app.get('/api/license-plate', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getPlateStatusData(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Data endpoint
app.get('/api/national-id', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getNationalIDStatusData(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Data endpoint
app.get('/api/postalcode-request', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getPostalCodeRequest(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Data endpoint
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const username = await user.username; // Fetch username from users1 table
    const timestamp = await user.timestamp;
    
    if (!username) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Convert the timestamp to a PostgreSQL-compatible format
    //const pgTimestamp = new Date(timestamp).toISOString();
    
    const data = await getNotifications(username, timestamp);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/interoperability-task-force/dc', authenticateToken, async (req, res) => {
  try {
    const data = await getInteroperability('تکمیل داده ها');
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/interoperability-task-force/dqi', authenticateToken, async (req, res) => {
  try {
    const data = await getInteroperability('بهبود کیفیت داده ها');
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/interoperability-task-force/dbd', authenticateToken, async (req, res) => {
  try {
    const data = await getInteroperability('توسعه پایگاه داده');
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/interoperability-task-force/dapi', authenticateToken, async (req, res) => {
  try {
    const data = await getInteroperability('دریافت API از سایر دستگاهها');
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
app.post('/api/locations/update-roosta', authenticateToken, async (req, res) => {
  const modifiedRecords = req.body;
  const user = req.user;
  const username = await user.username;
  const role = await user.role;
  console.log(username, role);
  if (!Array.isArray(modifiedRecords) || modifiedRecords.length === 0) {
    return res.status(400).json({ error: 'No valid data provided' });
  }

  try {
    const result = await updateRoostaData(modifiedRecords, role, username);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating roosta data:', error);
    res.status(500).json({ error: 'Failed to update roosta data' });
  }
});

// Data endpoint
app.get('/api/gnafindex', authenticateToken, async (req, res) => {
  try {
	const user = req.user;
    const data = await getGnafIndexData(user.role, user.permission);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Data endpoint
app.get('/api/best-updates', authenticateToken, async (req, res) => {
  try {
    const data = await getBests("amaliate_meydani");
	console.log(data);
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Data endpoint
app.get('/api/best-data', authenticateToken, async (req, res) => {
  try {
    const data = await getBests("dadeh_amaei");
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Data endpoint
app.get('/api/best-geocodes', authenticateToken, async (req, res) => {
  try {
    const data = await getBests("daryafte_naghsheh");
    res.json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await authenticateUser(username, password);
    const token = generateToken(user);
    await storeToken(token, user.user_id);

    res.json({ token, fullName: user.fullname });
  } catch (err) {
    console.error('Login error:', err);
    if (err.message === 'Invalid username or password') {
      res.status(401).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.patch('/api/update-timestamp', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // Assuming `req.user` contains { userId: 2, role: '4', permission: ['Hamdan'] }
    const username = await user.username; // Fetch username from users1 table
	const update_action = await SetTimestamp(username);
    res.status(200).json({ message: 'Timestamp updated successfully' });
  } catch (error) {
    console.error('Error updating timestamp:', error);
    res.status(500).json({ error: 'Failed to update timestamp' });
  }
});

// Logout endpoint (optional)
app.post('/api/logout', authenticateToken, async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await blacklistToken(token); // Call the function to blacklist the token
      res.json({ message: 'Logged out successfully' });
    } else {
      res.status(401).json({ error: 'No token provided' });
    }
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Endpoint to change password
app.post('/api/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword, repeatNewPassword } = req.body;
  const userId = req.user.userId;

  try {
    const result = await changePassword(userId, currentPassword, newPassword, repeatNewPassword);
    res.json(result);
  } catch (err) {
    console.error('Error changing password:', err);

    // Handle specific errors
    if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Current password is incorrect' || err.message === 'New passwords do not match') {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://172.16.8.33:${port}`);
});