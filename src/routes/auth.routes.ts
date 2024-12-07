import { t } from "elysia";
import { baseRouter } from "./base.routes";
import { AuthService } from "../services/auth.service";

export const authRouters = baseRouter.group("/auth", { tags: ["Authen"] }, (app) => app

    .post("/login", ({ withRequestHandling, set, body, jwt, cookie: { token } }) =>
    {
        return withRequestHandling({ set }, async () =>
        {
            const _token = await AuthService.login(body, jwt);
            token.set({
                value: _token,
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60 * 24 * 7, // 7d
            })
            return { payload: { data: { _token } } }
        })
    },
        {
            body: t.Object(
                {
                    username: t.String(),
                    password: t.String()
                }
            )
        }
    )

    .guard({ isVerifyAuth: true }, app => app

        .post("/logout", ({ withRequestHandling, set, cookie: { token } }) => 
        {
            return withRequestHandling({ set }, async () => 
            {
                token.remove();
                return { payload: { data: {} }, message: "ออกจากระบบสำเร็จ" }
            })
        })



        .get("/current-user", ({ withRequestHandling, set, store: { user } }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const result = await AuthService.currentUser(user);
                return { payload: { data: result } }
            })
        })
    )
);