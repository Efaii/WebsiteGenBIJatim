import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import homeRoutes from './routes/home.route';
import authRoutes from './routes/auth.route';
import faqRoutes from './routes/faq.route';
import testimonialRoutes from './routes/testimonial.route';
import dashboardRoutes from './routes/dashboard.route';
import newsRoutes from './routes/news.route';
import newsPublicRoutes from './routes/news-public.route';
import docsRoutes from './routes/docs.route';
import eventsRoutes from './routes/events.route';
import profileRoutes from './routes/profile.route';
import commissariatRoutes from './routes/commissariat.route';
import prokerRoutes from './routes/proker.route';
import { globalErrorHandler } from './middlewares/error.middleware';

/**
 * @module index
 * @description Express application entry point with CORS, routes, and static file serving.
 */

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'GenBI Express API is live.' });
});

// Feature Routes
app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/public/news', newsPublicRoutes);
app.use('/api/public/docs', docsRoutes);
app.use('/api/public/events', eventsRoutes);
app.use('/api/public/profile', profileRoutes);
app.use('/api/commissariats', commissariatRoutes);
app.use('/api/proker', prokerRoutes);

// Global Error Handler (must be last)
app.use(globalErrorHandler);

// Server Init
app.listen(PORT, () => {
  console.log(`[server]: API running at http://localhost:${PORT}`);
});
