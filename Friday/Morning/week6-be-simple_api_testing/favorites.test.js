import { request, expect } from "./config.js";

describe("Favorite API", function () {
  describe("When the current user is unauthenticated", function () {
    describe("POST /favorites", function () {
      it("should require authentication to add a favorite airport", async function () {
        const response = await request.post("/favorites").send({
          airport_id: "YBR",
          note: "Going to Canada",
        });

        expect(response.status).to.eql(401);
      });
    });
  });

  describe("When the current user is authenticated", function () {
    const token = "Bearer token=5XwHCKAW5TNWHPzGXyLBeHCf";
    describe("GET /favorites", function () {
      it("should allow the user to retrieve their favorite airports", async function () {
        const getResponse = await request
          .get("/favorites")
          .set("Authorization", token);
        expect(getResponse.status).to.eql(200);
      });
    });

    describe("POST /favorites", function () {
      it("should allow the user to save, update and delete a favorite airports", async function () {
        const postResponse = await request
          .post("/favorites")
          .set("Authorization", token)
          .send({
            airport_id: "YBR",
            note: "Going to Canada",
          });

        expect(postResponse.status).to.eql(201);
        expect(postResponse.body.data.attributes.airport.name).to.eql(
          "Brandon Municipal Airport"
        );
        expect(postResponse.body.data.attributes.note).to.eql("Going to Canada");

        const favoriteId = postResponse.body.data.id;

        const putResponse = await request
          .put(`/favorites/${favoriteId}`)
          .set("Authorization", token)
          .send({
            note: "My usual layover when visiting family and friends",
          });

        expect(putResponse.status).to.eql(200);
        expect(putResponse.body.data.attributes.note).to.eql(
          "My usual layover when visiting family and friends"
        );

        const deleteResponse = await request
          .delete(`/favorites/${favoriteId}`)
          .set("Authorization", token);

        expect(deleteResponse.status).to.eql(204);

        const getResponse = await request
          .get(`/favorites/${favoriteId}`)
          .set("Authorization", token);

        expect(getResponse.status).to.eql(404);
      });
    });

  });
});
