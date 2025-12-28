// src/routes/staff_activity.routes.ts
import { Router } from "express";
// import { staffActivityController } from "../controllers/staff_activity.controller";

const router = Router();

// /**
//  * @swagger
//  * /addActivity:
//  *   post:
//  *     summary: Add a staff activity
//  *     tags:
//  *       - Staff Activity
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               date_time:
//  *                 type: string
//  *                 format: date-time
//  *                 example: "2025-01-23T07:24:54.279Z"
//  *                 description: The date and time of the activity.
//  *               latitude:
//  *                 type: string
//  *                 example: "37.7749"
//  *                 description: Latitude of the activity location.
//  *               longitude:
//  *                 type: string
//  *                 example: "-122.4194"
//  *                 description: Longitude of the activity location.
//  *               module:
//  *                 type: string
//  *                 example: "Property"
//  *                 description: The module associated with the activity.
//  *               action:
//  *                 type: string
//  *                 example: "Update"
//  *                 description: The action performed by the staff.
//  *               action_target_id:
//  *                 type: string
//  *                 example: "123"
//  *                 description: The ID of the target entity of the action.
//  *             required:
//  *               - date_time
//  *     responses:
//  *       "200":
//  *         description: User activity logged successfully.
//  *       "400":
//  *         description: Invalid request.
//  *       "500":
//  *         description: Internal server error.
//  */
// router.post("/addActivity", staffActivityController.addActivity);

// /**
//  * @swagger
//  * /allActivity:
//  *   get:
//  *     summary: Retrieve a list of staff activities with optional filters and pagination.
//  *     tags:
//  *       - Staff Activity
//  *     description: This endpoint retrieves all staff activities based on the provided filters and pagination options. 
//  *                  You can filter by date range, time range, and user ID.
//  *     parameters:
//  *       - in: query
//  *         name: date_from
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter activities starting from this date (inclusive). Accepts ISO 8601 date format.
//  *         example: "2025-01-01"
//  *       - in: query
//  *         name: date_to
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Filter activities up to this date (inclusive). Accepts ISO 8601 date format.
//  *         example: "2025-01-23"
//  *       - in: query
//  *         name: time_from
//  *         schema:
//  *           type: string
//  *           format: time
//  *         description: Filter activities starting from this time of the day (inclusive). Accepts HH:mm:ss format.
//  *         example: "08:00:00"
//  *       - in: query
//  *         name: time_to
//  *         schema:
//  *           type: string
//  *           format: time
//  *         description: Filter activities up to this time of the day (inclusive). Accepts HH:mm:ss format.
//  *         example: "18:00:00"
//  *       - in: query
//  *         name: user_id
//  *         schema:
//  *           type: integer
//  *         description: Filter activities by the user ID.
//  *         example: 45
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *         description: The page number for pagination. Defaults to 1 if not provided.
//  *         example: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *         description: The number of results to return per page. Defaults to 10 if not provided.
//  *         example: 10
//  *     responses:
//  *       200:
//  *         description: Activities retrieved successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 total:
//  *                   type: integer
//  *                   description: The total number of activities matching the filters.
//  *                   example: 100
//  *                 activities:
//  *                   type: array
//  *                   description: A list of activities for the current page.
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       id:
//  *                         type: integer
//  *                         description: The activity ID.
//  *                         example: 1
//  *                       user_id:
//  *                         type: integer
//  *                         description: The user ID associated with the activity.
//  *                         example: 45
//  *                       date_time:
//  *                         type: string
//  *                         format: date-time
//  *                         description: The date and time of the activity.
//  *                         example: "2025-01-23T09:30:00.000Z"
//  *                       module:
//  *                         type: string
//  *                         description: The module associated with the activity.
//  *                         example: "attendance"
//  *                       action:
//  *                         type: string
//  *                         description: The action performed during the activity.
//  *                         example: "checked-in"
//  *                       action_target_id:
//  *                         type: integer
//  *                         description: The target ID associated with the action.
//  *                         example: 101
//  *                 currentPage:
//  *                   type: integer
//  *                   description: The current page of results.
//  *                   example: 1
//  *                 totalPages:
//  *                   type: integer
//  *                   description: The total number of pages available.
//  *                   example: 10
//  *       400:
//  *         description: Invalid input or missing required parameters.
//  *       500:
//  *         description: Internal server error.
//  */

// router.get("/allActivity", staffActivityController.getAllActivity);

export default router;
