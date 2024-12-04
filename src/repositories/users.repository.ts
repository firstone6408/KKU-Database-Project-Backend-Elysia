import { z } from "zod";
import { dbQueryExecutor } from "../utils/database.utils";

export const userRepository = {
  async create(data: {
    username: string;
    name: string;
    email: string;
    password: string;
    image?: string;
    phone?: string;
  }) {
    const { username, name, email, image, password, phone } = data;
    let cols = "username, name, email, password";
    let placeholders = "?, ?, ?, ?";
    const values = [username, name, email, password];
    if (image) {
      cols += ", image";
      placeholders += ", ?";
      values.push(image);
    }
    if (phone) {
      cols += ", phone";
      placeholders += ", ?";
      values.push(phone);
    }
    return await dbQueryExecutor
      .query(/*sql*/ `INSERT INTO users(${cols}) VALUES (${placeholders})`)
      .values(values)
      .run();
  },

  async findById(data: { id: number }) {
    const { id } = data;
    return dbQueryExecutor
      .query(/*sql*/ `SELECT * FROM users WHERE id = ?`)
      .values([id])
      .setResultSchema(
        z.array(
          z.object({
            id: z.number(),
            username: z.string(),
            name: z.string(),
            email: z.string(),
            role: z.string(),
            status: z.string(),
            created_at: z.date(),
            updated_at: z.date(),
            last_login: z.date().nullable(),
            phone: z.string().nullable(),
            image: z.string().nullable(),
          })
        )
      )
      .run();
  },

  async findByName(data: { name: string }) {
    const { name } = data;
    return await dbQueryExecutor
      .query(/*sql*/ `SELECT * FROM users WHERE name = ?`)
      .values([name])
      .setResultSchema(
        z.array(
          z.object({
            id: z.number(),
            username: z.string(),
            name: z.string(),
            email: z.string(),
            role: z.string(),
            status: z.string(),
            created_at: z.date(),
            updated_at: z.date(),
            last_login: z.date().nullable(),
            phone: z.string().nullable(),
            image: z.string().nullable(),
          })
        )
      )
      .run();
  },

  async findAll() {
    // console.log("ok");
    return await dbQueryExecutor
      .query(/*sql*/ `SELECT * FROM users`)
      .setResultSchema(
        z.array(
          z.object({
            id: z.number(),
            username: z.string(),
            name: z.string(),
            email: z.string(),
            role: z.string(),
            status: z.string(),
            created_at: z.date(),
            updated_at: z.date(),
            last_login: z.date().nullable(),
            phone: z.string().nullable(),
            image: z.string().nullable(),
          })
        )
      )
      .run();
  },

  async update(data: {
    id: number;
    username: string;
    name: string;
    email: string;
    password: string;
    image?: string;
    phone?: string;
  }) {
    const { id, username, name, email, image, password, phone } = data;
    let updates = "username = ?, name = ?, email = ?, password = ?";
    const values: any = [username, name, email, password];
    if (image) {
      updates += ", image = ?";
      values.push(image);
    }
    if (phone) {
      updates += ", phone = ?";
      values.push(phone);
    }
    values.push(id);
    return await dbQueryExecutor
      .query(/*sql*/ `UPDATE users SET ${updates} WHERE id = ?`)
      .values(values)
      .run();
  },

  async delete(data: { id: number }) {
    const { id } = data;
    return await dbQueryExecutor
      .query(/*sql*/ `UPDATE users SET status = 'INACTIVE' WHERE id = ?`)
      .values([id])
      .run();
  },
};
