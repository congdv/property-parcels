import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

const ONE_MONTH_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

export const initializeRedis = async () => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  redisClient = redisUrl
    ? createClient({ url: redisUrl })
    : createClient({
        socket: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379"),
        },
        password: process.env.REDIS_PASSWORD,
      });

  redisClient.on("error", (err) => console.error("Redis Client Error", err));

  await redisClient.connect();
  console.log("Redis client connected");

  return redisClient;
};

export const getRedisClient = () => {
  return redisClient;
};

export const cacheGet = async (key: string) => {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: unknown,
  ttl: number = ONE_MONTH_TTL
) => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    return false;
  }
};

export const cacheDelete = async (key: string) => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
    return false;
  }
};

export const cacheClear = async (pattern: string = "*") => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error(`Error clearing cache with pattern ${pattern}:`, error);
    return false;
  }
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("Redis client disconnected");
  }

};
