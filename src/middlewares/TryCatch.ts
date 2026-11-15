import {Response, Request, NextFunction, RequestHandler} from 'express';

const TryCatch = (cb: RequestHandler): RequestHandler => {
    return async (req: Request, res:Response, next: NextFunction) => {
        try{
            await cb(req, res, next);
        }
        catch(err: any){
            res.status(500).json({
                message: err.message
            })
        }
    }
}

export default TryCatch;
