import express, {type Response, type Request, type NextFunction} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import { connectToDb } from './config/db.js';
import restaurantRoutes from './routes/restaurant.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/restaurant', restaurantRoutes);

const port = process.env.PORT || 5001;
app.listen(port, async () => {
    await connectToDb();
    console.log('Restaurant endpoint running on port: ',port);
})