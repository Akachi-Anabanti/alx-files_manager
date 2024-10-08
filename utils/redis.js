// redis client config
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isRedisLive = true;

    this.client.on('error', (error) => {
      console.error(`Redis client error: ${error}`);
      this.isRedisLive = false;
    });

    this.client.on('end', () => {
      this.isRedisLive = false;
    });
  }

  isAlive() {
    return this.isRedisLive;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
