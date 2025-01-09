// server.js
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://assiengment-11.web.app',
    'https://assiengment-11.firebaseapp.com'
     ],
  credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ermh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // Collections
    const carsCollection = client.db('carRent').collection('cars');
    const bookingsCollection = client.db('carRent').collection('bookings');

    // Get all cars
    app.get('/cars', async (req, res) => {
      const cars = await carsCollection.find().toArray();
      res.json(cars);
    });

    // Get car by ID
    app.get('/cars/:id', async (req, res) => {
      try {
        const car = await carsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!car) {
          return res.status(404).json({ error: "Car not found" });
        }
        res.json(car);
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    // Add a new booking
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      if (result.insertedId) {
        await carsCollection.updateOne(
          { _id: new ObjectId(booking.carId) },
          { $inc: { booking_count: 1 } }
        );
      }
      res.json(result);
    });    
    // Get all cars
    app.get('/bookings', async (req, res) => {
      const bookings = await bookingsCollection.find().toArray();
      res.json(bookings);
    });
    // Add a new car 
    app.post('/cars', async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);
      res.json(result);
    });

    // Update car details
    app.put('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const updates = req.body;
      const result = await carsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
      res.json(result);
    });
    // Delete car
    app.delete('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });
    // Get bookings by user ID
    app.get('/bookings/:userId', async (req, res) => {
      const userId = req.params.userId;
      const bookings = await bookingsCollection.find({ userId }).toArray();
      res.json(bookings);
    });
    // Update booking dates
    app.put('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const { startDateTime, endDateTime } = req.body;
      const result = await bookingsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { startDateTime, endDateTime } }
      );
      res.json(result);
    });

    // Cancel booking
    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });

  }
  finally{
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello guys');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
