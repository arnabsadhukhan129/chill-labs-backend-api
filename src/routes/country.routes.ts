// routes/CountryRoutes.ts
import { Router } from 'express';
import getCountries from '../controllers/country.controller';

const router = Router();
/**
 * @swagger
 * /list/countries:
 *   get:
 *     summary: Retrieve all countries
 *     tags: [Lists]
 *     description: Returns a list of all countries
 *     responses:
 *       200:
 *         description: A list of countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   iso:
 *                     type: string
 *                   name:
 *                     type: string
 *                   nicename:
 *                     type: string
 *                   iso3:
 *                     type: string
 *                   numcode:
 *                     type: integer
 *                   phonecode:
 *                     type: integer
 */
router.get('/countries', getCountries);

export default router;
