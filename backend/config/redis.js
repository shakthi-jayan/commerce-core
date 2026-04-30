import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redisClient = null;

const getRedisClient = () => {
  if (process.env.USE_REDIS === 'false') {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB, 10) || 0,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 5000);
        logger.warn(`Redis retry attempt ${times}, next retry in ${delay}ms`);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis error: ${err.message}`);
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  return redisClient;
};

/**
 * Cache helper — get or set cache with TTL
 */
export const cacheGet = async (key) => {
  if (process.env.USE_REDIS === 'false') return null;
  try {
    const client = getRedisClient();
    if (!client) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis GET error for key ${key}: ${error.message}`);
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds = 300) => {
  if (process.env.USE_REDIS === 'false') return;
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    logger.error(`Redis SET error for key ${key}: ${error.message}`);
  }
};

export const cacheDelete = async (key) => {
  if (process.env.USE_REDIS === 'false') return;
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch (error) {
    logger.error(`Redis DEL error for key ${key}: ${error.message}`);
  }
};

export const cacheDeletePattern = async (pattern) => {
  if (process.env.USE_REDIS === 'false') return;
  try {
    const client = getRedisClient();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    logger.error(`Redis DEL pattern error for ${pattern}: ${error.message}`);
  }
};

export default getRedisClient;
