import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db("sensores");

    app.post('/guardar', async (req, res) => {
      try {
        const { sensor, valor } = req.body;

        if (!sensor || valor === undefined) {
          return res.status(400).json({ error: 'Datos incompletos' });
        }

        const collection = db.collection("lecturas");
        const resultado = await collection.insertOne({
          sensor,
          valor,
          fecha: new Date()
        });

        res.status(200).json({ mensaje: "Dato guardado", id: resultado.insertedId });
      } catch (error) {
        console.error("Error al guardar en MongoDB:", error);
        res.status(500).json({ error: "Error al guardar en MongoDB" });
      }
    });

    app.get("/", (req, res) => {
      res.send("API Humo funcionando");
    });

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1);
  }
}

startServer();

// Opcional: manejar cierre del servidor para desconectar Mongo
process.on('SIGINT', async () => {
  console.log("Cerrando conexión a MongoDB...");
  await client.close();
  process.exit(0);
});