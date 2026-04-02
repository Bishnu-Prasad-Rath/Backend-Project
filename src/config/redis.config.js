import { createClient } from "redis";

 const redisClient = createClient({
  url: process.env.REDIS_URL, // optional but recommended
});

// ✅ handle errors
redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

redisClient.on("connect",()=>{
  console.log("Redis is Reconnecting");
})

redisClient.on("ready",()=>{
  console.log("Redis is Ready.");
})

// ✅ connect function
 const connectRedis = async () => {
  try {
    if(!redisClient.isOpen) {
      await redisClient.connect();
    }
    console.log("✅ Redis connected successfully");
  } catch (error) {
    console.log("❌ Redis connection failed:", error);
  }
};

export{redisClient,connectRedis}