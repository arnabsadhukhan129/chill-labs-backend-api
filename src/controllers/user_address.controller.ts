import { Request, Response } from 'express';
import { UserAddressService } from '../services/user_address.service';
import { handleResponse } from '../utils/responseHandler';
import authService from '../services/auth.service';
import User from '../../models/User';

export const createAddress = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      address_type,
      latitude,
      longitude,
      country,
      city,
      state,
      postalCode,
      address
    } = req.body;

    if (!user_id || !latitude || !longitude) {
      return res.status(400).json({ message: 'user_id, latitude, and longitude are required' });
    }
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const newAddress = await UserAddressService.createAddress({
      user_id,
      address_type,
      latitude,
      longitude,
      country,
      city,
      state,
      postalCode,
      address
    });

    handleResponse(res, 201, 'Address created successfully', newAddress);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating address', error: error.message });
  }
};

export const getUserAddresses = async (req: Request, res: Response) => {
  try {
    const user_id = req.params.userId;

    const user = await authService.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addresses = await UserAddressService.getUserAddresses(Number(user_id));
    handleResponse(res, 200, 'Addresses retrieved successfully', addresses);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving addresses', error: error.message });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    const updated = await UserAddressService.updateAddress(id, req.body);
    handleResponse(res, 200, 'Address updated successfully', updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    const result = await UserAddressService.deleteAddress(id);
    handleResponse(res, 200, result.message);
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};
