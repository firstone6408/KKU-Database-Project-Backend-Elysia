import { Context } from "elysia";
import { userRepository } from "../repositories/users.repository";

export const userController = {
  create: async (context: Context) => {
    const body = context.body as {
      username: string;
      name: string;
      image?: string;
    };
    const result = await userRepository.create(body);

    return {
      ok: true,
      message: "Created",
      payload: {
        data: result,
      },
    };
  },
};
