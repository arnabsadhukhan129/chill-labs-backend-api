import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const envFile = path.resolve(__dirname, `../../.env.${env}`);

console.log(`Resolved .env file path: ${envFile}`);

// Load environment variables from the resolved .env file
const result = dotenv.config({ path: envFile });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully.');
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
}

interface DatabaseConfig {
  uri: string;
  options?: {
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    bufferCommands?: boolean;
  };
}

interface Config {
  development: DatabaseConfig;
  test: DatabaseConfig;
  production: DatabaseConfig;
}

const config: Config = {
  development: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chill_labs_db_dev',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    },
  },
  test: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chill_labs_db_test',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    },
  },
  production: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chill_labs_db_prod',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    },
  }
};

export default config;
