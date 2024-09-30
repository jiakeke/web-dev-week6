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
        .send(workouts[0])
        .send(workouts[1]);
      savedWorkoutId = savedWorkout.body._id;  // Store the ID for further operations
    });

    describe("GET /api/workouts", () => {
      it("should return all workouts as JSON", async () => {
        await api
          .get("/api/workouts")
          .set("Authorization", `bearer ${token}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);
      });
    });

    describe("POST /api/workouts", () => {
      it("should successfully add a new workout", async () => {
        const newWorkout = {
          title: "testworkout",
          reps: 10,
          load: 100,
        };

        const response = await api
          .post("/api/workouts")
          .set("Authorization", `bearer ${token}`)
          .send(newWorkout)
          .expect(201);

        expect(response.body.title).toBe(newWorkout.title);
        expect(response.body.reps).toBe(newWorkout.reps);
        expect(response.body.load).toBe(newWorkout.load);
      });
    });

    describe("DELETE /api/workouts/:id", () => {
      it("should delete a workout by ID", async () => {
        await api
          .delete(`/api/workouts/${savedWorkoutId}`)
          .set("Authorization", `bearer ${token}`)
          .expect(200);

        // Verify that the workout no longer exists
        const response = await api
          .get(`/api/workouts/${savedWorkoutId}`)
          .set("Authorization", `bearer ${token}`)
          .expect(404);  // The workout should not be found
      });
    });

    describe("PUT /api/workouts/:id", () => {
      it("should update a workout by ID", async () => {
        const updatedWorkout = {
          title: "Updated workout",
          reps: 15,
          load: 150,
        };

        const response = await api
          .patch(`/api/workouts/${savedWorkoutId}`)
          .set("Authorization", `bearer ${token}`)
          .send(updatedWorkout)
          .expect(200);

        const new_response = await api
          .get(`/api/workouts/${savedWorkoutId}`)
          .set("Authorization", `bearer ${token}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);

        // Verify the response contains updated values
        expect(new_response.body.title).toBe(updatedWorkout.title);
        expect(new_response.body.reps).toBe(updatedWorkout.reps);
        expect(new_response.body.load).toBe(updatedWorkout.load);
      });
    });

    describe("GET /api/workouts/:id", () => {
      it("should return a single workout by ID", async () => {
        const response = await api
          .get(`/api/workouts/${savedWorkoutId}`)
          .set("Authorization", `bearer ${token}`)
          .expect(200)
          .expect("Content-Type", /application\/json/);

        // Verify the response contains the correct workout data
        expect(response.body.title).toBe(workouts[1].title);
        expect(response.body.reps).toBe(workouts[1].reps);
        expect(response.body.load).toBe(workouts[1].load);
      });
    });

  });

  afterAll(() => {
    mongoose.connection.close();
  });
});

