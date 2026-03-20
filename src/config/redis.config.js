import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis Error:", err);
});

export const connectRedis = async () => {
  await client.connect();
  console.log("✅ Redis Connected");
};

export default redisClient;