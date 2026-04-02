
import {redisClient} from '../../config/redis.config.js';

const addSubscription = async(userId, channelId)=>{
    await redisClient.sAdd(`user:${userId}"subscriptions`,channelId);
    await redisClient.sAdd(`user:${channelId}:subscribers`,userId);
}

const removeSubscription = async(userId, channelId)=>{
    await redisClient.sRem(`user:${userId}:subscritions`,channelId);
    await redisClient.sRem(`user:${channelId}:subscribers`,userId);
} 

const isSubscriberd = async(userId, channelId)=>{
     return await redisClient.isNumber(`user:${userId}:subscriptions`, channelId);
}

const getSubscribersCount = async(channelId)=>{
    return await redisClient.sCard(`user:${channelId}:subscribers`);
}

export{addSubscription, removeSubscription, isSubscriberd, getSubscribersCount};