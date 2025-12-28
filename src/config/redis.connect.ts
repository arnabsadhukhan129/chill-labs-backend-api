import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient: RedisClientType;


const redisUrl = process.env.NODE_ENV !== 'development'
    ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    : `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

console.log(redisUrl,process.env.NODE_ENV,process.env.REDIS_PORT)

redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) =>
    console.error(`${process.env.SERVICE_NAME} Client Error`, err)
);

const connectRedisClient = async () => {
    try {
        await redisClient.connect();
        console.log(`Connecting to Redis at ${redisUrl}`);
        console.log(
            `Connected ${process.env.SERVICE_NAME} Service at REDIS PORT ${process.env.REDIS_PORT}`
        );
    } catch (err) {
        console.error(
            `Failed to connect ${process.env.SERVICE_NAME} to Redis services on PORT ${process.env.REDIS_PORT}`,
            err
        );
        process.exit(1); // Exit if Redis connection fails
    }
};

export { redisClient, connectRedisClient };
