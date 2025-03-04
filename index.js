const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); 

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 5000; //ssssss

// Middleware
app.use(cors());
app.use(express.json());

// Static files serve karein
app.use('/images', express.static(path.join(__dirname, 'images')));

// MongoDB Connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connect() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas:', err);
    }
}

connect();

// Routes
app.get('/', (req, res) => {
    res.send('Trip Tailor Backend is running!');
});

// Cities Route
app.get('/api/cities', async (req, res) => {
    try {
        const db = client.db('triptailor');
        const citiesCollection = db.collection('cities');
        const cities = await citiesCollection.find({}).toArray();
        res.json(cities);
    } catch (err) {
        console.error('Error fetching cities:', err);
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/cities', async (req, res) => {
    try {
        const db = client.db('triptailor');
        const citiesCollection = db.collection('cities');
        const newCity = req.body;
        const result = await citiesCollection.insertOne(newCity);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error inserting city:', err);
        res.status(500).json({ message: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});