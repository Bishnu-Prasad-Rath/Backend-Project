import { createClient } from "redis";

 const redisClient = createClient({
  url: process.env.REDIS_URL, // optional but recommended
});

// ✅ handle errors
redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

// ✅ connect function
 const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected successfully");
  } catch (error) {
    console.log("❌ Redis connection failed:", error);
  }
};

export{redisClient,connectRedis}