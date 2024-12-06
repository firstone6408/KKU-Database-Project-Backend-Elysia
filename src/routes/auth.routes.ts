import { t } from "elysia";
import { baseRouter } from "./base.routes";
import { AuthService } from "../services/auth.service";

export const authRouters = baseRouter.group("/auth", { tags: ["Authen"] }, (app) => app

    .post("/login", ({ withRequestHandling, set, body, jwt }) =>
    {
        return withRequestHandling({ set }, async () =>
        {
            const token = await AuthService.login(body, jwt);
            return { payload: { data: { token } } }
        })
    }, {
        body: t.Object(
            {
                username: t.String(),
                password: t.String()
            }
        )
    })

    .guard({ isVerifyAuth: true }, app => app
        .get("/current-user", ({ withRequestHandling, set, store: { user } }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                console.log(user)
                // const result = await AuthService.currentUser(user);
                return { payload: { data: user } }
            })
        })
    )
);