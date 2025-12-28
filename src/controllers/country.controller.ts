// controllers/CountryController.ts
import { Request, Response } from 'express';
import Country from '../../models/country';
import { handleResponse } from '../utils/responseHandler';
async function getCountries(req: Request, res: Response) {
  try {
    const countries = await Country.find();
    handleResponse(res, 200, 'retrieved successfully', { countries });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving countries', error });
  }
}

export default getCountries;
