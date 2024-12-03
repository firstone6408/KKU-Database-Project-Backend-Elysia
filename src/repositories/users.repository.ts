import { database } from "../database/connect.db";

const db = database.pool;

export const userRepository = {
  create: async (data: {
    username: string;
    name: string;
    image?: string;
  }) => {
    const { username, name, image } = data;
    let cols = "username, name";
    let placeholders = "?, ?";
    const values = [username, name];
    if (image) {
      cols += ", image";
      placeholders += ", ?";
      values.push(image);
    }
    const result = await db.query(
      /*sql*/ `INSERT INTO users(${cols}) VALUES (${placeholders})`,
      values
    );

    return result;
  },
};
