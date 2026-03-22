import redisClient from "../config/redis.config.js"

const rateLimiter = async({
    key,
    windowSize = 10,
    maxRequests = 10,
}) => {
    const now = Date.now();
    const windowStart = now - windowSize * 1000;

    await redisClient.zRemRangeByScore(key,0,windowStart);

    const currentRequest = await redisClient.zCard(key);

    if(currentRequest >= maxRequests){
        return {
            allowed : false,
            remaining : 0,
        };
    }
    await redisClient.zAdd(key,{
        score : now,
        value : `${now}`
    })

    await redisClient.expire(key,windowSize);

    return {
        allowed : true,
        remaining : maxRequests - currentRequest - 1,
    }
}

export{rateLimiter} 