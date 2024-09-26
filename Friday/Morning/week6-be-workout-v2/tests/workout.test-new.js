const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/userModel");
const Workout = require("../models/workoutModel");
const workouts = require("./data/workouts.js");

let token = null;

describe("Workout API Tests", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    const result = await api
      .post("/api/user/signup")
      .send({ email: "mattiv@matti.fi", password: "R3g5T7#gh" });
    token = result.body.token;
  });

  describe("Given initial workouts are saved", () => {
    let savedWorkoutId;

    beforeEach(async () => {
      await Workout.deleteMany({});
      const savedWorkout = await api
        .post("/api/workouts")
        .set("Authorization", `bearer ${token}`)
        .send(workouts[0]);

      savedWorkoutId = savedWorkout.body._id;  // Store the ID for further operations
    });



  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
