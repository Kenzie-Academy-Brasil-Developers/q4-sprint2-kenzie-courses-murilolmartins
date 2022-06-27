import app from "../../app";
import supertest from "supertest";
import { Course, User } from "../../entities";
import { DataSource } from "typeorm";
import AppDataSource from "../../data-source";
import { generateCourseName, generateEmail } from "../index";
import { userRepository } from "../../repositories";
import jwt from "jsonwebtoken";

describe("Create course route | Integration test", () => {
  let connection: DataSource;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => (connection = res))
      .catch((err) => console.log("Error during datasource initialization"));
  });
  afterAll(async () => {
    await connection.destroy();
  });

  it("Return: course as JSON response | Status code: 201", async () => {
    const courseName = generateCourseName();
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
    const course: Partial<Course> = {
      courseName: courseName,
      duration: "1d",
    };

    const response = await supertest(app)
      .post("/courses")
      .send({ ...course })
      .set({
        authorization: `Token ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });
});
