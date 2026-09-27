import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

import newsRoutes from './routes/news';
import profileRoutes from './routes/profile';

app.use(cors());
app.use(express.json());

app.use('/api/news', newsRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('GenBI Jatim API Server');
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'api'
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
