import express from 'express';
import cors from 'cors';
import { genrate } from './query.js';  // keep your backend RAG file as query.js

const app = express();
const port = process.env.PORT || 3001;

// middlewares
app.use(express.json());
app.use(cors()); // allow frontend running on another port

// test route
app.get('/', (req, res) => {
  res.send('Welcome to the server of Movi');
});

// chat route
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Incoming message:', message);

    const result = await genrate(message);  // call backend function
    res.json({ message: result });
  } catch (err) {
    console.error('Error in /chat:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is listening on http://localhost:${port}`);
});
