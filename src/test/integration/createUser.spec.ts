import app from "../../app";
import supertest from "supertest";
import { User } from "../../entities";
import { generateEmail } from "../index";
import { DataSource } from "typeorm";
import AppDataSource from "../../data-source";

describe("Create user route | Integration test", () => {
  let connection: DataSource;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => (connection = res))
      .catch((err) => console.log("Error during datasource initialization"));
  });
  afterAll(async () => {
    await connection.destroy();
  });

  it("Return: User as JSON response | Status code: 201", async () => {
    const user: Partial<User> = {
      firstName: "Murilo",
      lastName: "Martins",
      email: generateEmail(),
      isAdm: false,
      password: "1234",
    };

    const response = await supertest(app)
      .post("/users")
      .send({ ...user });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("Return: Email already exists error | Status code: 409", async () => {
    const user: Partial<User> = {
      firstName: "Murilo",
      lastName: "Martins",
      email: generateEmail(),
      isAdm: false,
      password: "1234",
    };

    const response_first = await supertest(app)
      .post("/users")
      .send({ ...user });

    const response = await supertest(app)
      .post("/users")
      .send({ ...user });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("Email already exists");
  });
});
