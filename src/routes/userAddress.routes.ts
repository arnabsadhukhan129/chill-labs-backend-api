import { Router } from 'express';
import {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress
} from '../controllers/user_address.controller';

const router = Router();

/**
 * @swagger
 * /user-address:
 *   post:
 *     summary: Create a new user address
 *     tags: [UserAddress]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - latitude
 *               - longitude
 *             properties:
 *               user_id:
 *                 type: integer
 *               address_type:
 *                 type: string
 *                 enum: [current, permanent]
 *               latitude:
 *                 type: string
 *               longitude:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address created successfully
 */
router.post('/', createAddress);

/**
 * @swagger
 * /user-address/{userId}:
 *   get:
 *     summary: Get all addresses for a user
 *     tags: [UserAddress]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user addresses
 */
router.get('/:userId', getUserAddresses);

/**
 * @swagger
 * /user-address/{id}:
 *   put:
 *     summary: Update a user address
 *     tags: [UserAddress]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address_type:
 *                 type: string
 *                 enum: [current, permanent]
 *               latitude:
 *                 type: string
 *               longitude:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 */
router.put('/:id', updateAddress);

/**
 * @swagger
 * /user-address/{id}:
 *   delete:
 *     summary: Delete a user address
 *     tags: [UserAddress]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Address deleted successfully
 */
router.delete('/:id', deleteAddress);

export default router;
