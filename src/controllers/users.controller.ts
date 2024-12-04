import { Context } from "elysia";
import { userRepository } from "../repositories/users.repository";
import { apiHandler } from "../utils/api.utils";
import { z } from "zod";

export const userController = {
  async create(context: Context) {
    // console.log(context.body);
    return apiHandler
      .body(
        z.object({
          username: z.string(),
          name: z.string(),
        })
      )
      .withHandling(context, async ({ body }) => {
        // const body = context.body as {
        //   username: string;
        //   name: string;
        //   image?: string;
        // };
        console.log("body", body);
        // const result = await userRepository.create(body);

        return { payload: { data: {} } };
      });
  },

  async list(context: Context) {
    return apiHandler.withHandling(context, async () => {
      const result = await userRepository.findAll();
      // console.log(result);

      return { payload: { data: result.queryResult } };
    });
  },
};
