import express from 'express';
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
import { errorHandler } from './middlewares/error.middleware';
import path from 'path';
import { requestContext } from './middlewares/request-context.middleware';
import cookieParser from 'cookie-parser';
import v1AuthRoutes from './routes/v1-auth.route';
import v1NewsRoutes from './routes/v1-news.route';
import membershipImportRoutes from './routes/membership-import.route';
import readinessRoutes from './routes/readiness.route';
import membershipRoutes from './routes/membership.route';
import { assertRuntimeConfig } from './lib/runtime-config';
import masterRoutes from './routes/master.route';
import programRoutes from './routes/program.route';
import publicPeriodRoutes from './routes/public-periods.route';

dotenv.config();

if (['staging', 'production'].includes(process.env.NODE_ENV ?? '')) assertRuntimeConfig();

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(requestContext);
app.use('/uploads', express.static(process.env.PUBLIC_STORAGE_ROOT ?? path.join(__dirname, '../public/uploads')));

// Health Check
app.use(readinessRoutes);

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
app.use('/api/v1/auth', v1AuthRoutes);
app.use('/api/v1/news', v1NewsRoutes);
app.use('/api/v1/membership-imports', membershipImportRoutes);
app.use('/api/v1/memberships', membershipRoutes);
app.use('/api/v1/masters', masterRoutes);
app.use('/api/v1/programs', programRoutes);
app.use('/api/v1/periods', publicPeriodRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Server Init
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[server]: API running effortlessly at http://localhost:${PORT}`);
  });
}
