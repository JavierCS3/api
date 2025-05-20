import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.post('/guardar', async (req, res) => {
  try {
    const { sensor, valor } = req.body;

    if (!sensor || !valor) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    await client.connect();
    const collection = client.db("sensores").collection("lecturas");
    const resultado = await collection.insertOne({
      sensor,
      valor,
      fecha: new Date()
    });

    res.status(200).json({ mensaje: "Dato guardado", id: resultado.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar en MongoDB" });
  } finally {
    await client.close();
  }
});

app.get("/", (req, res) => {
  res.send("API Humo funcionando");
});

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});