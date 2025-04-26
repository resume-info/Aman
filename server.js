const express = require('express');
const path = require('path');
const { connectToDatabase, closeConnection } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// Initialize database connection
let db;
connectToDatabase()
  .then(database => {
    db = database;
    console.log('Database connection initialized');
  })
  .catch(err => {
    console.error('Failed to connect to the database', err);
  });

// Example API route to save logs to MongoDB
app.post('/api/logs', async (req, res) => {
  try {
    const collection = db.collection('logs');
    const result = await collection.insertOne(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Log saved successfully',
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving log to database' 
    });
  }
});

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit();
}); 