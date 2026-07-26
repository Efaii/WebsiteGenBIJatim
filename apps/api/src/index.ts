import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import homeRoutes from './routes/home.route';
import authRoutes from './routes/auth.route';
import faqRoutes from './routes/faq.route';
import testimonialRoutes from './routes/testimonial.route';
import dashboardRoutes from './routes/dashboard.route';
import newsRoutes from './routes/news.route';
import commissariatRoutes from './routes/commissariat.route';
import contactRoutes from './routes/contact.route';
import awardeeRoutes from './routes/awardee.route';
import docsRoutes from './routes/docs';
import profileRoutes from './routes/profile';
import eventsRoutes from './routes/events';
import path from 'path';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000'],
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
app.use('/api/commissariats', commissariatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/awardee', awardeeRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventsRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err.status || err.statusCode || 400;
  res.status(status).json({ message: err.message || 'An error occurred' });
});

// Server Init
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[server]: API running effortlessly at http://localhost:${PORT}`);
  });
}
