import jwt,{JwtPayload} from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

import TryCatch from "./TryCatch.js"

export interface Iuser{
    _id: string,
    name: string,
    email:string,
    image?:string,
    role?:string,
    restaurantId: string,
}

export interface AuthenticateRequest extends Request {
    user?: Iuser
}

export const isAuth = async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<void> =>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            res.status(401).json({
                message: 'please login - no auth header'
            })
            return;
        }

        const token = authHeader.split(' ')[1];
        if(!token || token==='null'){
            res.status(401).json({
                message: 'please login - token missing.'
            })
            return;
        }

        const decodedValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        if(!decodedValue || !decodedValue?.user){
            res.status(401).json({
                message: 'invalid token.'
            })
            return;
        }

        req.user = decodedValue.user;
        next();
    }
    catch(error: any){
        res.status(500).json({
            message: 'please login - jwt error',
            error: error?.response?.message?.data
        })
    }
}

export const isSeller = async (req:AuthenticateRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if(user?.role !== 'Seller'){
        res.status(403).json({
            message: 'You are not a seller'
        })
        return;
    }

    next();
}
