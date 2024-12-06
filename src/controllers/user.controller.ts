import { Context } from "elysia";
import { apiRequestHandler } from "../utils/api.utils";
import { z } from "zod";
import { UserService } from "../services/user.service";
import "../schemas/jwt-payload.schema";

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
    return apiRequestHandler
      .body(
        z.object({
          username: z.string(),
          password: z.string(),
          email: z.string(),
          fullName: z.string(),
          image: z.string().optional(),
          phoneNumber: z.string().optional(),
          role: z.enum(["ADMIN", "CASHIER", "MANAGER", "STAFF"]),
          branchId: z.number().optional(),
        })
      )
      .validateAndProcessRequest(context, async ({ body }) => {
        const result = await UserService.create(body);
        return { payload: { data: result } };
      });
  },

  async list(context: Context) {
    return apiRequestHandler.validateAndProcessRequest(
      context,
      async () => {
        // console.log(result);

        return { payload: { data: {} } };
      }
    );
  },

  async getById(context: Context) {
    return apiRequestHandler
      .params(
        z.object({
          id: z.string(),
        })
      )
      .validateAndProcessRequest(context, async ({ params }) => {
        const id = Number(params.id);

        return { payload: { data: {} } };
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
    return apiRequestHandler
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
      .validateAndProcessRequest(context, async ({ params, body }) => {
        const id = Number(params.id);
        return { payload: { data: {} } };
      });
  },

  async remove(context: Context) {
    //console.log(context.params);
    return apiRequestHandler
      .params(
        z.object({
          id: z.string(),
        })
      )
      .validateAndProcessRequest(context, async ({ params }) => {
        const id = Number(params.id);
        return { payload: { data: {} } };
      });
  },

  async test(context: Context) {
    console.log(context);
    return {};
  },
};
