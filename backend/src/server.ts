import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

// 🛣️ Route imports
import authRoutes from './routes/auth';
import entriesRoutes from './routes/entries';
import unitRoutes from './routes/units';
import scheduleRoutes from './routes/schedule';
import todoRoutes from './routes/todos';
import registerRoutes from './routes/register';
import sessionRoutes from './routes/sessions';

// 📦 Load .env variables
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard';

// 🪵 Global Request Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 🔧 Middleware setup
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // ✅ Allow both common dev ports
  credentials: true,
}));

// ... (existing imports)

app.use(express.json()); // Parse incoming JSON requests

// 🚏 Mount all API routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/sessions', sessionRoutes);

// 🌐 Serve Frontend in Production
const __rootPath = path.resolve();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__rootPath, 'frontend', 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__rootPath, 'frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// ✅ Optional: Global error handler
// app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

// 🌐 Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });
