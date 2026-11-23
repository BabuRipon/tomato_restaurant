import express from 'express';
const route = express.Router();
import {addMenuItem, deleteMenuItem, getAllItems, toggleMenuItemAvailability} from '../controllers/menuItems.js';
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import uploadFile from '../middlewares/multer.js';

route.post('/new', isAuth, isSeller, uploadFile, addMenuItem);
route.get('/all/:id', isAuth, getAllItems);
route.delete('/:itemId', isAuth, isSeller, deleteMenuItem);
route.put('/status/:itemId', isAuth, isSeller, toggleMenuItemAvailability);

export default route;
