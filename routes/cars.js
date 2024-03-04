import express from "express";
import mongoose from "mongoose";

import Car from "../models/Car.js";
import { pool } from "../db/connection.js";
import redisClient from "../db/redis.js";

const router = express.Router();

router.get("/cars", async (req, res) => {
  try {
    redisClient.get("cars", async (err, cars) => {
      if (err) throw err;

      if (cars) {
        res.json(JSON.parse(cars));
      } else {
        const cars = await Car.find();

        redisClient.set("cars", JSON.stringify(cars));

        res.json(cars);
      }
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post("/cars", async (req, res) => {
  const newCar = new Car(req.body);

  try {
    await newCar.save();
    res.status(201).json(newCar);

    redisClient.del("cars");
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

router.put("/cars/:id", async (req, res) => {
  const { id } = req.params;
  const { make, model, ownerId } = req.body;
  const updatedCar = { make, model, ownerId, _id: id };

  await Car.findByIdAndUpdate(id, updatedCar, { new: true });

  redisClient.del("cars");

  res.json(updatedCar);
});

router.post("/car/:userId/:carId", async (req, res) => {
  const session = await mongoose.startSession();
  let postgresTransactionClient;

  try {
    session.startTransaction();

    // MongoDB operation
    const { carId } = req.params;
    const existingCar = await Car.findById(carId).session(session);

    const carData = existingCar.toObject({ getters: false, virtuals: false });
    delete carData._id;

    const newCar = new Car(carData);
    await newCar.save({ session });

    // PostgreSQL operation
    postgresTransactionClient = await pool.connect();
    await postgresTransactionClient.query("BEGIN");
    const repostUpdateResult = await postgresTransactionClient.query(
      "UPDATE users SET cars = cars + 1 WHERE id = $1 RETURNING *",
      [req.params.userId]
    );
    await postgresTransactionClient.query("COMMIT");

    await session.commitTransaction();
    session.endSession();
    postgresTransactionClient.release();

    redisClient.del("cars");

    res
      .status(201)
      .json({ message: "Car created and cars count updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (postgresTransactionClient) {
      await postgresTransactionClient.query("ROLLBACK");
      postgresTransactionClient.release();
    }
    console.error("Error in creating car or updating cars count:", error);
    res.status(500).json({ message: "Error in processing your request" });
  }
});

export default router;
