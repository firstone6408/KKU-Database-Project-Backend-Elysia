import { Context } from "elysia";
import { userRepository } from "../repositories/users.repository";
import { apiHandler } from "../utils/api.utils";
import { z } from "zod";

export const userController = {
  /*
    {
      "username": "user",
      "name": "User",
      "email": "user@gmail.com",
      "phone": "012-3456-789",
      "password": "123"
    }
  */
  async create(context: Context) {
    // console.log(context.body);
    return apiHandler
      .body(
        z.object({
          username: z.string(),
          name: z.string(),
          email: z.string().email(),
          password: z.string(),
          image: z.string().optional(),
          phone: z.string().optional(),
        })
      )
      .withHandling(context, async ({ body }) => {
        // console.log("body", body);
        const result = await userRepository.create(body);

        return { payload: { data: result } };
      });
  },

  async list(context: Context) {
    return apiHandler.withHandling(context, async () => {
      const result = await userRepository.findAll();
      // console.log(result);

      return { payload: { data: result.queryResult } };
    });
  },

  async getById(context: Context) {
    return apiHandler
      .params(
        z.object({
          id: z.string(),
        })
      )
      .withHandling(context, async ({ params }) => {
        const id = Number(params.id);
        const result = await userRepository.findById({ id });
        return { payload: { data: result.queryResult } };
      });
  },

  /*
    {
      "username": "user",
      "name": "User",
      "email": "user@gmail.com",
      "phone": "012-3456-789",
      "password": "123"
    }
  */
  async update(context: Context) {
    return apiHandler
      .params(
        z.object({
          id: z.string(),
        })
      )
      .body(
        z.object({
          username: z.string(),
          name: z.string(),
          email: z.string().email(),
          password: z.string(),
          image: z.string().optional(),
          phone: z.string().optional(),
        })
      )
      .withHandling(context, async ({ params, body }) => {
        const id = Number(params.id);
        const result = await userRepository.update({ id, ...body });
        return { payload: { data: result.queryResult } };
      });
  },

  async remove(context: Context) {
    //console.log(context.params);
    return apiHandler
      .params(
        z.object({
          id: z.string(),
        })
      )
      .withHandling(context, async ({ params }) => {
        const id = Number(params.id);
        const result = await userRepository.delete({ id });
        return { payload: { data: result.queryResult } };
      });
  },

  async test(context: Context) {
    console.log(context);
    return {};
  },
};
