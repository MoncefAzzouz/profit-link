import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import ordersRoutes from './routes/orders.routes';
import storeRoutes from './routes/store.routes';
import financeRoutes from './routes/finance.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', 
  credentials: true
}));

// Increased limits for large AI image payloads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Main API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/finance', financeRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Profit Link API!' });
});

// Example DB Health Check Route
app.get('/health', async (req: Request, res: Response) => {
  try {
    // This tests if the database connection is working
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: String(error) });
  }
});

// Start Server
app.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
