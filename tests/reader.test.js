const { expect } = require("chai");
const request = require("supertest");
const { Reader } = require("../src/models");
const app = require("../src/app");
const faker = require("faker");

describe("/readers", () => {
  before(async () => Reader.sequelize.sync());

  beforeEach(async () => {
    await Reader.destroy({ where: {} });
  });

  describe("with no records in the database", () => {
    describe("POST /readers", () => {
      it("creates a new reader in the database", async () => {
        const response = await request(app).post("/readers").send({
          name: "Elizabeth Bennet",
          email: "future_ms_darcy@gmail.com",
          password: "123456789",
        });
        const newReaderRecord = await Reader.findByPk(response.body.id, {
          raw: true,
        });

        expect(response.status).to.equal(201);
        expect(response.body.name).to.equal("Elizabeth Bennet");
        expect(newReaderRecord.name).to.equal("Elizabeth Bennet");
        expect(newReaderRecord.email).to.equal("future_ms_darcy@gmail.com");
      });

      it("Should star out password when creating a new reader", async () => {
        const reader = {
          name: faker.name.firstName(),
          email: faker.internet.email(),
          password: "123456789",
        };
        const response = await request(app).post("/readers").send(reader);
        expect(response.status).to.equal(201);
        expect(response.body.password).to.equal("*********");
      });

      it("Should return a 500 if name is empty", async () => {
        const readerData = {
          name: "",
          email: faker.internet.email(),
          password: "12345567890abc",
        };

        const result = await request(app).post("/readers").send(readerData);
        expect(result.status).to.equal(500);
        expect(result.body.error).to.equal(
          "Validation error: Name can not be empty"
        );
      });
      it("Should return a 500 if name is null", async () => {
        const readerData = {
          email: faker.internet.email(),
          password: "12345567890abc",
        };

        const result = await request(app).post("/readers").send(readerData);
        expect(result.status).to.equal(500);
        expect(result.body.error).to.equal(
          "notNull Violation: Name can not be empty"
        );
      });

      it("Should return a 500 if email is in an incorrect format", async () => {
        const readerData = {
          name: faker.name.firstName(),
          email: "helloathello.com",
          password: "12345567890abc",
        };
        const result = await request(app).post("/readers").send(readerData);
        expect(result.status).to.equal(500);
        expect(result.body.error).to.equal(
          "Validation error: Email must be in correct format"
        );
      });
      it("Should return a 500 if email is null", async () => {
        const readerData = {
          name: faker.name.firstName(),
          password: "12345567890abc",
        };
        const result = await request(app).post("/readers").send(readerData);
        expect(result.status).to.equal(500);
        expect(result.body.error).to.equal(
          "notNull Violation: Email can not be empty"
        );
      });

      it("Should return a 500 if password is less than 8 characters long", async () => {
        const readerData = {
          name: faker.name.firstName(),
          email: faker.internet.email(),
          password: "12",
        };
        const result = await request(app).post("/readers").send(readerData);
        expect(result.status).to.equal(500);
        expect(result.body.error).to.equal(
          "Validation error: Password must be 8 characters or longer!"
        );
      });
      it("Should return a 500 if password is null", async () => {
        const readerData = {
          name: faker.name.firstName(),
          email: faker.internet.email(),
        };
        const result = await request(app).post("/readers").send(readerData);
        expect(result.status).to.equal(500);
        expect(result.body.error).to.equal(
          "notNull Violation: Password must be 8 characters or longer!"
        );
      });
    });
  });

  describe("with records in the database", () => {
    let readers;

    beforeEach(async () => {
      readers = await Promise.all([
        Reader.create({
          name: faker.name.firstName(),
          email: faker.internet.email(),
          password: "123456789",
        }),
        Reader.create({
          name: faker.name.firstName(),
          email: faker.internet.email(),
          password: "123456789",
        }),
        Reader.create({
          name: faker.name.firstName(),
          email: faker.internet.email(),
          password: "123456789",
        }),
      ]);
    });

    describe("GET /readers", () => {
      it("gets all readers records", async () => {
        const response = await request(app).get("/readers");

        expect(response.status).to.equal(200);
        expect(response.body.length).to.equal(3);

        response.body.forEach((reader) => {
          const expected = readers.find((a) => a.id === reader.id);

          expect(reader.name).to.equal(expected.name);
          expect(reader.email).to.equal(expected.email);
        });
      });
      it("gets all records with passwords removed", async () => {
        const response = await request(app).get("/readers");
        expect(response.status).to.equal(200);
        response.body.forEach((reader) => {
          expect(!!reader.password).to.equal(false);
        });
      });
    });

    describe("GET /readers/:id", () => {
      it("gets readers record by id", async () => {
        const reader = readers[0];
        const response = await request(app).get(`/readers/${reader.id}`);

        expect(response.status).to.equal(200);
        expect(response.body.name).to.equal(reader.name);
        expect(response.body.email).to.equal(reader.email);
      });

      it("returns a 404 if the reader does not exist", async () => {
        const response = await request(app).get("/readers/12345");

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("The reader could not be found.");
      });
    });

    describe("PATCH /readers/:id", () => {
      it("updates readers email by id", async () => {
        const reader = readers[0];
        const response = await request(app)
          .patch(`/readers/${reader.id}`)
          .send({ email: "miss_e_bennet@gmail.com" });
        const updatedReaderRecord = await Reader.findByPk(reader.id, {
          raw: true,
        });

        expect(response.status).to.equal(200);
        expect(updatedReaderRecord.email).to.equal("miss_e_bennet@gmail.com");
      });

      it("returns a 404 if the reader does not exist", async () => {
        const response = await request(app)
          .patch("/readers/12345")
          .send({ email: faker.internet.email() });

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("The reader could not be found.");
      });
    });

    describe("DELETE /readers/:id", () => {
      it("deletes reader record by id", async () => {
        const reader = readers[0];
        const response = await request(app).delete(`/readers/${reader.id}`);
        const deletedReader = await Reader.findByPk(reader.id, { raw: true });

        expect(response.status).to.equal(204);
        expect(deletedReader).to.equal(null);
      });

      it("returns a 404 if the reader does not exist", async () => {
        const response = await request(app).delete("/readers/12345");
        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("The reader could not be found.");
      });
    });
  });
});
