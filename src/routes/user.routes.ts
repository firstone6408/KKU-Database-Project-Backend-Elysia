import { t } from "elysia";
import { baseRouter } from "./base.routes";
import { UserService } from "../services/user.service";
import { z } from "zod";

export const userRouters = baseRouter.group("/users", { tags: ["Users"] }, (app) => app

    .guard({ isVerifyAuth: true }, (app) => app

        .post("/", ({ body, withRequestHandling, set }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const result = await UserService.create(body)
                return { payload: { data: result } }
            })
        }, {
            body: t.Object(
                {
                    username: t.String({ minLength: 1 }),
                    password: t.String({ minLength: 3 }),
                    email: t.String({ minLength: 1 }),
                    fullName: t.String({ minLength: 1 }),
                    role: t.Enum({
                        ADMIN: "ADMIN",
                        CASHIER: "CASHIER",
                        MANAGER: "MANAGER",
                        STAFF: "STAFF"
                    }),
                    image: t.Optional(t.String()),
                    phoneNumber: t.Optional(t.String()),
                    branchId: t.Optional(t.Number())
                }
            ),
        })


        .get("/", ({ withRequestHandling, set }) =>
        {
            return withRequestHandling({
                set,
                responseFilterSchema: z.object(
                    {
                        data: z.array(z.object(
                            {
                                username: z.string(),
                                email: z.string(),
                                fullName: z.string(),
                                role: z.string(),
                                image: z.string().nullable(),
                                phoneNumber: z.string().nullable(),
                                branchId: z.number().nullable()
                            }
                        ))
                    }
                )
            }, async () =>
            {
                const result = await UserService.list();
                return { payload: { data: result } }
            })
        })


        .get("/:id", ({ params: { id }, withRequestHandling, set }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const result = await UserService.getById(id)
                return { payload: { data: result } }
            })
        }, {
            params: t.Object({ id: t.Number() })
        })
    )
);
