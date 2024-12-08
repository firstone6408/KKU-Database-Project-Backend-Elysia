import { t } from "elysia";
import { baseRouter } from "./base.routes";
import { AuthService } from "../services/auth.service";
import { withRequestHandling } from "../utils/request.utils";

export const authRouters = baseRouter.group("/auth", { tags: ["Authen"] }, (app) => app

    .post("/login", ({ body, jwt, cookie: { token } }) => withRequestHandling(async () =>
    {
        const _token = await AuthService.login(body, jwt);
        token.set(
            {
                value: _token,
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60 * 24 * 7, // 7d
            }
        )
        return { payload: { data: { _token } } }
    }),
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

        .post("/logout", ({ cookie: { token } }) => withRequestHandling(async () => 
        {
            token.remove();
            return { payload: { data: {} }, message: "ออกจากระบบสำเร็จ" }
        }))



        .get("/current-user", ({ store: { user } }) => withRequestHandling(async () =>
        {
            const result = await AuthService.currentUser(user);
            return { payload: { data: result } }
        }))
    )
);