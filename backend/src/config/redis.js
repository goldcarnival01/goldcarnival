import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Prefer REDIS_URL when available (Render/Aiven/etc). Fallback to host/port if provided.
const inferredRedisUrl = process.env.REDIS_URL
  || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : undefined);

// Create a lazy client. If no configuration is present, create a dummy client interface
// so imports won't fail and server can start without Redis.
export const redisClient = inferredRedisUrl
  ? createClient({
      url: inferredRedisUrl,
      password: process.env.REDIS_PASSWORD || undefined
    })
  : createClient({
      // Intentionally invalid URL to prevent accidental localhost connection on Render
      // We'll skip connecting when no config is provided.
      url: 'redis://unused:0'
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

// Connect to Redis (only when configuration exists)
export const connectRedis = async () => {
  const hasConfig = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
  if (!hasConfig) {
    console.log('ℹ️ Redis not configured. Skipping connectRedis.');
    return;
  }
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
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