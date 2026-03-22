import {rateLimiter} from '../redis/rateLimiter.js';

const rateLimitMiddleware = (options) => {
   return async (req,res,next)=>{
     const key = `rate:${req.ip}`;
    const result = await rateLimiter({
      key,
      ...options,  
    })

    if(!result.allowed){
        return res.status(429).json({
            success : false,
            message : "Too many requests try again later."
        });
    }
    next();
   };
};

export{rateLimitMiddleware}