import app from "../../app";
import supertest from "supertest";
import { User } from "../../entities";
import { DataSource } from "typeorm";
import AppDataSource from "../../data-source";
import { generateEmail } from "..";
import { userRepository } from "../../repositories";
import { hashSync } from "bcrypt";

describe("Login User Route | Integration test", () => {
  let connection: DataSource;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => (connection = res))
      .catch((err) => console.log("Error during datasource initialization"));
  });
  afterAll(async () => {
    await connection.destroy();
  });

  it("Return: Token | Status code: 200", async () => {
    let email = generateEmail();
    const user = new User();

    user.firstName = "Murilo";
    user.lastName = "Martins";
    user.email = email;
    user.isAdm = true;
    user.password = hashSync("1234", 8);
    user.createdAt = new Date();
    user.updatedAt = new Date();

    const new_user = await userRepository.save(user);

    const response = await supertest(app)
      .post("/login")
      .send({ email: email, password: "1234" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
