import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis Client Ready');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connection established successfully.');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
};

// Redis utility functions
export const setCache = async (key, value, expireTime = 3600) => {
  try {
    if (redisClient.isReady) {
      await redisClient.setEx(key, expireTime, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
};

export const getCache = async (key) => {
  try {
    if (redisClient.isReady) {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
};

export const deleteCache = async (key) => {
  try {
    if (redisClient.isReady) {
      await redisClient.del(key);
    }
  } catch (error) {
    console.error('Redis deleteCache error:', error);
  }
};

export const clearCache = async () => {
  try {
    if (redisClient.isReady) {
      await redisClient.flushAll();
    }
  } catch (error) {
    console.error('Redis clearCache error:', error);
  }
}; 