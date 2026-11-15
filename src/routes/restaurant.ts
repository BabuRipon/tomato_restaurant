import express from 'express';
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import { addRestaurant, fetchMyRestaurant, updateRestaurantStatus } from '../controllers/restaurant.js';
import uploadFile from '../middlewares/multer.js';

const router = express.Router();

router.post('/new', isAuth, isSeller, uploadFile,addRestaurant);
router.get('/my', isAuth, isSeller, fetchMyRestaurant);
router.put('/status', isAuth, isSeller, updateRestaurantStatus);

export default router;
