// src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import dotenv from 'dotenv'

dotenv.config();

const PORT = process.env.PORT || 5000
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth API Documentation',
      version: '1.0.0',
      description: 'API documentation for authentication services',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
