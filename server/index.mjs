import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

console.log('✅ Starting server script...');

const app = express();
const port = process.env.PORT || 3000;

// STEP 1: Ensure db.json exists with default content
const dbPath = './server/db.json';
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ submissions: [] }, null, 2));
  console.log('📁 Created db.json with default data');
}

// STEP 2: Set up LowDB with schema
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { submissions: [] }); // 👈 THIS is what fixes it
await db.read();
await db.write();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Save form submission
app.post('/submit', async (req, res) => {
  const entry = req.body;
  await db.read();
  db.data.submissions.push(entry);
  await db.write();
  res.status(200).json({ message: 'Saved!' });
});

// Retrieve all submissions
app.get('/submissions', async (req, res) => {
  await db.read();
  res.json(db.data.submissions);
});

console.log('📡 Preparing to start server...');
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});

