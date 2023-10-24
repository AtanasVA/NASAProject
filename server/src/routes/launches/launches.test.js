const request = require("supertest");
const app = require("../../app.js");
const { mongoConnect } = require("../../services/mongo");
const { mongoDisconnect } = require("../../services/mongo");

const completeLaunchData = {
  mission: "A mock space mission",
  rocket: "Explorer IS1",
  launchDate: "February 8, 1996",
  target: "Kepler-1652 b",
};
const launchDataWithoutDate = {
  mission: "A mock space mission",
  rocket: "Explorer IS1",
  target: "Kepler-1652 b",
};
const launchDataIncorrectDate = {
  mission: "A mock space mission",
  rocket: "Explorer IS1",
  target: "Kepler-1652 b",
  launchDate: "notADate",
};

describe("Server boot up", () => {
  beforeAll(async () => {
    mongoConnect();
  });

  describe("Test GET /launches", () => {
    test("Should respond with 200 success", async () => {
      await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });

  describe("Test POST /launches", () => {
    test("Should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect(201)
        .expect("Content-Type", /json/);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("Should catch missing properties in user input", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Bad user input..",
      });
    });

    test("Should catch invalid date input", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataIncorrectDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Invalid date entry..",
      });
    });
  });

  describe("Test DELETE /launches", () => {
    test("Should respond with 200 success", async () => {
      const response = await request(app)
        .delete("/v1/launches/101")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toMatchObject({ acknowledged: true });
    });

    test("Should catch missing launch ", async () => {
      const response = await request(app)
        .delete("/v1/launches/999")
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Launch does not exist",
      });
    });

    afterAll(async () => {
      await mongoDisconnect();
    });
  });
});
