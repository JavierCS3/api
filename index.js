require('dotenv').config(); // Load environment variables
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3001; // Render sets PORT

// Connection URI - store this in your .env file or Render environment variables
// Make sure this is MONGODB_URI in Render's environment settings
const uri = process.env.MONGODB_URI; 
if (!uri) {
    console.error("MONGODB_URI not found in environment variables. Please set it.");
    process.exit(1);
}

const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        // Usa el nombre de tu base de datos real aquí
        db = client.db("estadosDB"); // <--- ACTUALIZADO
        console.log("Successfully connected to MongoDB and database 'estadosDB'!");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1); // Exit if DB connection fails
    }
}

connectDB();

app.use(express.json()); // Middleware to parse JSON bodies

// Test route
app.get('/', (req, res) => {
    res.send('API Humo is running!');
});

// Your Arduino will send data here
app.post('/api/guardar', async (req, res) => {
    if (!db) {
        // Este mensaje se enviará si la conexión a la BD falló al inicio
        return res.status(500).json({ message: "Database not initialized or connection failed" });
    }
    try {
        const data = req.body; 
        console.log("Received data:", data);

        // Validate incoming data (optional but recommended)
        if (!data || (data.sensor && data.valor === undefined) && (data.estado === undefined || data.temperatura === undefined || data.voltajeGas === undefined)) {
            return res.status(400).json({ message: "Invalid data format" });
        }

        // Usa el nombre de tu colección real aquí
        const collection = db.collection("cambiosEstado"); // <--- ACTUALIZADO
        const result = await collection.insertOne({ ...data, timestamp: new Date() });

        console.log(`A document was inserted into 'cambiosEstado' with the _id: ${result.insertedId}`);
        res.status(201).json({ message: "Data saved successfully", id: result.insertedId });
    } catch (error) {
        console.error("Error saving data to MongoDB collection 'cambiosEstado':", error);
        res.status(500).json({ message: "Failed to save data", error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log("Closing MongoDB connection...");
    if (client) { // Check if client was initialized
        await client.close();
    }
    process.exit(0);
});