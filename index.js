// server.js
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors());
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
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

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
      const id = req.params.id;
      const car = await carsCollection.findOne({ _id: new ObjectId(id) });
      res.json(car);
    });

    // Add a new booking
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
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

  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello guys');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
