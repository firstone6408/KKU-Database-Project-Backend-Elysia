import { baseRouter } from "./base.routes";

export const orderRouters = baseRouter.group("/order", { tags: ["Orders"] }, (app) => app

    .guard({ isVerifyAuth: true }, (app) => app

        // TODO endpoint POST "/api/order/"
        .post("/", ({ withRequestHandling, set }) => 
        {
            return withRequestHandling({ set }, async () => 
            {
                return { payload: { data: {} } }
            })
        })
    )
);