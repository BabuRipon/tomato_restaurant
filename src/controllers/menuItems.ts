import getUriData from "../config/dataUri.js";
import { AuthenticateRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/TryCatch.js";
import MenuItem from '../models/menuItems.js';
import Restaurant from "../models/restaurant.js";
import axios from 'axios';

export const addMenuItem = TryCatch(async (req: AuthenticateRequest, res) => {
    const user = req.user;
    if(!user){
        res.status(401).json({
            message: 'Unauthorized User, please login.'
        })
        return;
    }

    const {name, description, price} = req.body;
    if(!name || !price){
        res.status(400).json({
            message: 'please fill all the mandate fields.'
        })
        return;
    }
    if(!user?.restaurantId){
        res.status(400).json({
            message: 'no reaturantId found.'
        })
        return;
    }
    const restaurant = await Restaurant.findOne({
        _id: user.restaurantId
    })

    if(!restaurant){
        res.status(400).json({
            message: 'No restaurant found.'
        })
        return;
    }

    const file = req.file;
    if(!file){
        res.status(400).json({
            message: 'No image found'
        })
        return;
    }

    const dataUri = getUriData(file);
    if(!dataUri.content){
        res.status(500).json({
            message: 'failed to create dataUri'
        })
    }

    const {data: uploadResult} = await axios.post(`${process.env.UTILS_SERVICE}/api/utils/upload`,{
        dataUri: dataUri.content
    });

    const menuItem = new MenuItem({
        restaurantId: user?.restaurantId,
        image: uploadResult.url,
        name,
        description,
        price
    })

    await menuItem.save();

    res.status(201).json({
        message: 'Menu item created successfully.',
        menuItem
    })
})

export const getAllItems = TryCatch(async (req: AuthenticateRequest, res)=>{
    const {id} = req.params;

    if(!id) {
         res.status(400).json({
            message: 'id is required.'
        })
        return;
    }

    const items = await MenuItem.find({
        restaurantId: id as any
    });

    res.status(200).json(items)
})

export const deleteMenuItem = TryCatch(async (req: AuthenticateRequest, res) => {
    
    if(!req.user) {
        return res.status(401).json({
            message: 'Unauthorized User, please login.'
        })
    }

    const {itemId} = req.params;

    if(!itemId) {
         res.status(400).json({
            message: 'id is required.'
        })
        return;
    }

    const item = await MenuItem.findById(itemId);
    if(!item){
        return res.status(404).json({
            message: `No item found with this ${itemId}`
        })
    }

    const restaurant = await Restaurant.find({
        ownerId: req.user._id,
        restaurantId: item.restaurantId
    })

    if(!restaurant){
        return res.status(404).json({
            message: `No restaurant fount with this restaurant id: ${item.restaurantId}`
        })
    }

    await item.deleteOne();
    res.status(200).json({
        message: 'Menu item deleted successfully.'
    })
})

export const toggleMenuItemAvailability = TryCatch(async (req: AuthenticateRequest, res) => {
    if(!req.user) {
        return res.status(401).json({
            message: 'Unauthorized User, please login.'
        })
    }

    const {itemId} = req.params;  

    if(!itemId) {
         res.status(400).json({
            message: 'id is required.'
        })
        return;
    }

    const item = await MenuItem.findById(itemId);
    if(!item){
        return res.status(404).json({
            message: `No item found with this ${itemId}`
        })
    }

    const restaurant = await Restaurant.find({
        ownerId: req.user._id,
        restaurantId: item.restaurantId
    })

    if(!restaurant){
        return res.status(404).json({
            message: `No restaurant fount with this restaurant id: ${item.restaurantId}`
        })
    }

    item.isAvailable = !item.isAvailable;
    await item.save();
    res.status(200).json({
        message: `Item marked as ${item.isAvailable ? 'Available': 'unavailable'}`,
        item
    })
})