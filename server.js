import { genrate } from '../../query.js';  // adjust path if query.js is in root

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      console.log('Incoming message:', message);

      const result = await genrate(message);
      return res.status(200).json({ message: result });
    } catch (err) {
      console.error('Error in /api/chat:', err);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  } else if (req.method === 'GET') {
    return res.status(200).send('Welcome to the server of Movi');
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
