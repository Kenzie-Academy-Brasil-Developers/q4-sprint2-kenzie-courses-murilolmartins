import AppDataSource from "../data-source";
import { faker } from "@faker-js/faker";
import { existsSync } from "fs";
import path from "path";
import { unlink } from "fs/promises";
import { User } from "../entities";
import { DataSource } from "typeorm";

export const generateEmail = (): string => {
  const firstName = faker.name.firstName().toLowerCase();
  const email = faker.internet.email(firstName).toLowerCase();

  return email;
};

export const generateCourseName = (): string => {
  const name = faker.name.jobArea();

  return name;
};

export class Connection {
  dbPath: string;
  dbConnection: Promise<DataSource>;

  constructor() {
    this.dbPath = path.join(__dirname, "../../dbTest.sqlite");
  }

  create = async () => {
    if (existsSync(this.dbPath)) {
      await unlink(this.dbPath);
    }

    this.dbConnection = AppDataSource.initialize();
  };

  close = async () => {
    const connection = await this.dbConnection;
    await connection.destroy();

    if (existsSync(this.dbPath)) {
      await unlink(this.dbPath);
    }
  };

  clear = async () => {
    const connection = await this.dbConnection;
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  };
}
