import axios from "axios";
import jwt from 'jsonwebtoken';
import getUriData from "../config/dataUri.js";
import { AuthenticateRequest, Iuser } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/TryCatch.js";
import Restaurant from "../models/restaurant.js";

export const addRestaurant = TryCatch(async (req: AuthenticateRequest, res) => {
    const user = req.user;

    if(!user){
        res.status(401).json({
            message: 'Unauthorized'
        })
        return;
    }

    const existingRestaurant = await Restaurant.findOne({
        ownerId: user._id
    });

    if(existingRestaurant){
        res.status(400).json({
            message: 'Restaurant already Exist.'
        })
        return;
    }

    const {name, description, latitude, longitude, phone, formattedAddress} = req.body;

    const phoneNumber = Number(phone);
    if(!phoneNumber){
        res.status(400).json({
            message: 'please correct phone number'
        })
        return;
    }

    if(!name || !latitude || !longitude){
        res.status(400).json({
            message: 'Please give all the details.'
        })
        return;
    }

    const file = req.file;
    if(!file){
        res.status(400).json({
            message: 'please give image.'
        })
    }

    const dataUri = getUriData(file);
    if(!dataUri.content){
        res.status(500).json({
            message: 'Failed to create dataUri.'
        })
        return;
    }

    const {data: uploadResult} = await axios.post(`${process.env.UTILS_SERVICE}/api/utils/upload`,{
        dataUri: dataUri.content
    });

    const restaurant = new Restaurant({
        name,
        description,
        image: uploadResult.url,
        phone: phoneNumber,
        isVerified: false,
        ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress
        }
    })

    await restaurant.save();

    res.status(201).json({
        message: 'Restaurant created successfully',
        restaurant
    })
})

export const fetchMyRestaurant = TryCatch(async (req: AuthenticateRequest, res)=>{
    if(!req.user){
        res.status(401).json({
            message: 'Please login'
        })
        return;
    }

    const restaurant = await Restaurant.findOne({
        ownerId: req.user._id
    })

    if(!restaurant){
        res.status(400).json({
            message: 'No restaurant found'
        })
        return;
    }

    if(!req.user.restaurantId){
        const token = jwt.sign({
            user: {
                ...req.user,
                restaurantId: restaurant._id
            }
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: '10d'
        })

        res.status(200).json({
            restaurant,
            token
        });
        return;
    }

    res.status(200).json({restaurant})
})

export const updateRestaurantStatus = TryCatch(async (req: AuthenticateRequest, res) => {
    const user = req.user;
    if(!req.user){
        res.status(401).json({
            message: 'Unauthorized User, please login.'
        })
    }

    const {status} = req.body;
    if(typeof status!=='boolean'){
        res.status(400).json({
            message: 'status must be boolean.'
        })
    }

    const restaurant = await Restaurant.findOneAndUpdate({ownerId: user?._id as string},{isOpen: status},{new: true});

    if(!restaurant){
        res.status(404).json({
            message: 'No restaurant found.'
        });
        return;
    }

    res.status(201).json({
        message: 'Restaurant status updated.',
        restaurant
    })
})

export const updateRestaurant = TryCatch(async (req: AuthenticateRequest, res)=>{
    const user = req.user;
    if(!req.user){
        res.status(401).json({
            message: 'Unauthorized User, please login.'
        })
    }

     const {name, description} = req.body;

    const restaurant = await Restaurant.findOneAndUpdate({ownerId: user?._id as string},{name, description},{new: true});

    if(!restaurant){
        res.status(404).json({
            message: 'No restaurant found.'
        });
        return;
    }

    res.status(201).json({
        message: 'Restaurant status updated.',
        restaurant
    })
})

export const getNearbyRestaurant = TryCatch(async (req: AuthenticateRequest, res) => {
    const {lat, long, search} = req.query as {
        lat?: string;
        long?:string;
        search?:string
    };

    if(!lat || !long){
        res.status(400).json({
            message: 'latitude and longitude are required'
        })
        return;
    }
    
    const query: any = {
        isVerified: false
    }

    if(search && typeof search === 'string'){
        query.name = {$regex: search, $options: 'i'}
    }

    const restaurants = await Restaurant.aggregate([
        {
            $geoNear:{
                near:{
                    type: 'Point',
                    coordinates: [parseFloat(long), parseFloat(lat)]
                },
                distanceField: 'distance',
                maxDistance: 200000,
                spherical: true,
                query
            }
        },
        {
            $sort: {isOpen: -1, distance: 1}
        },
        {
            $addFields: {
                distanceKm: {
                    $round: [{$divide: ["$distance", 1000]}, 2]
                }
            },
        }
    ]);

    res.status(200).json({
        success: true,
        count: restaurants.length,
        restaurants
    })
})

export const fetchSingleRestaurant = TryCatch(async (req: AuthenticateRequest, res) => {
    const {id} = req.params;
    const restaurant = await Restaurant.findById(id);

    res.status(200).json(restaurant);
})