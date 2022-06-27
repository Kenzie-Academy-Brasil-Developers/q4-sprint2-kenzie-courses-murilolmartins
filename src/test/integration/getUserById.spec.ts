import app from "../../app";
import supertest from "supertest";
import { User } from "../../entities";
import { generateEmail } from "../index";
import { DataSource } from "typeorm";
import AppDataSource from "../../data-source";
import { userRepository } from "../../repositories";
import jwt from "jsonwebtoken";

describe("Get User by ID Route | Integration test", () => {
  let connection: DataSource;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => (connection = res))
      .catch((err) => console.log("Error during datasource initialization"));
  });
  afterAll(async () => {
    await connection.destroy();
  });

  it("Return: User | Status code: 200", async () => {
    let email = generateEmail();
    const user = new User();

    user.firstName = "Murilo";
    user.lastName = "Martins";
    user.email = email;
    user.isAdm = true;
    user.password = "1234";
    user.createdAt = new Date();
    user.updatedAt = new Date();

    const new_user = await userRepository.save(user);

    const token = jwt.sign(
      { id: new_user.id },
      process.env.SECRET_KEY as string,
      {
        expiresIn: process.env.EXPIRES_IN,
      }
    );

    const response = await supertest(app)
      .get(`/users/${new_user.id}`)
      .set({
        authorization: `Token ${token}`,
      });

    expect(response.status).toBe(200);
  });
});
