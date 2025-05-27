import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeDatabase } from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import fs from 'fs';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

const uploadDir = process.env.CSV_UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Error handler middleware
app.use(errorHandler);

app.get('/health', (req, res) => {
   res.status(200).json({ status: 'ok' });
});

app.use('/api/user', userRoutes);

async function startServer() {
   try {
      await initializeDatabase();

      app.listen(port, () => {
         console.log(`Server is running on port ${port}`);
      });
   } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
   }
}

startServer();
