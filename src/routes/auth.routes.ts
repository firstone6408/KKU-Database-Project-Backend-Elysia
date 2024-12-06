import Elysia, { t } from "elysia";
import { initRouter } from "./init.routes";
import { AuthService } from "../services/auth.service";

export const authRouters = new Elysia({ prefix: "/auth", tags: ["Authen"] })
    .use(initRouter)


    .post("/login", ({ withRequestHandling, set, body, jwt }) => {
        return withRequestHandling({ set }, async () => {
            const token = await AuthService.login(body, jwt);
            return { payload: { data: { token } } }
        })
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })

    .guard({ isVerifyAuth: true }, app => app
        .get("/current-user", ({ withRequestHandling, set, store: { user } }) => {
            return withRequestHandling({ set }, async () => {
                console.log(user)
                // const result = await AuthService.currentUser(user);
                return { payload: { data: user } }
            })
        })
    );