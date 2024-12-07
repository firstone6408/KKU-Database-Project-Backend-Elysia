import { baseRouter } from "./base.routes";

export const stockHistoryRouters = baseRouter.group("/stock-history", { tags: ["Stock Histories"] }, (app) => app
    .guard({ isVerifyAuth: true }, (app) => app
        .get("/", ({ withRequestHandling, set }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                return { payload: { data: {} } }
            })
        })
    )
);