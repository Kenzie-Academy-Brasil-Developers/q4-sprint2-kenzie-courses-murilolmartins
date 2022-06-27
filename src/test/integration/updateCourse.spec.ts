import app from "../../app";
import supertest from "supertest";
import { Course, User } from "../../entities";
import { DataSource } from "typeorm";
import AppDataSource from "../../data-source";
import { generateCourseName, generateEmail } from "../index";
import { courseRepository, userRepository } from "../../repositories";
import jwt from "jsonwebtoken";

describe("Update course route | Integration test", () => {
  let connection: DataSource;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => (connection = res))
      .catch((err) => console.log("Error during datasource initialization"));
  });
  afterAll(async () => {
    await connection.destroy();
  });

  it("Return: Course | Status code: 200", async () => {
    const courseName = generateCourseName();
    let email = generateEmail();
    const user = new User();
    const course = new Course();

    course.courseName = courseName;
    course.duration = "1d";

    user.firstName = "Murilo";
    user.lastName = "Martins";
    user.email = email;
    user.isAdm = true;
    user.password = "1234";
    user.createdAt = new Date();
    user.updatedAt = new Date();

    const new_user = await userRepository.save(user);
    const new_course = await courseRepository.save(course);

    const token = jwt.sign(
      { id: new_user.id },
      process.env.SECRET_KEY as string,
      {
        expiresIn: process.env.EXPIRES_IN,
      }
    );

    const response = await supertest(app)
      .patch(`/courses/${new_course.id}`)
      .send({ duration: "2d" })
      .set({
        authorization: `Token ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("duration");
    expect(response.body.duration).toBe("2d");
  });
});
