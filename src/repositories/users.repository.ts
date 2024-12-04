import { z } from "zod";
import { dbQueryExecutor } from "../utils/database.utils";

export const userRepository = {
  async create(data: { username: string; name: string; image?: string }) {
    const { username, name, image } = data;
    let cols = "username, name";
    let placeholders = "?, ?";
    const values = [username, name];
    if (image) {
      cols += ", image";
      placeholders += ", ?";
      values.push(image);
    }
    return await dbQueryExecutor
      .values(values)
      .query(/*sql*/ `INSERT INTO users(${cols}) VALUES (${placeholders})`)
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
            name: z.string(),
            username: z.string(),
            image: z.string().nullable(),
          })
        )
      )
      .run();
  },
};
