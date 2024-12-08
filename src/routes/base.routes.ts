import jwt from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import { withRequestHandling } from "../utils/request.utils";
import { verifyAuth } from "../middlewares/auth.middleware";

export const baseRouter = new Elysia()
    .use(jwt(
        {
            name: "jwt",
            secret: process.env.JWT_SECRET || "sdfsd9f890*&*6278678A^S",
            exp: "7d"
        }
    ))
    .state({ user: {} as JwtPayload })
    //  .decorate("withRequestHandling", withRequestHandling)
    .derive(() =>
    {
        return {
            helloTest: () => { }
        }
    })
    //
    // Middlewares Authen
    //
    .macro(({ onBeforeHandle }) => (
        {
            isVerifyAuth(enabled: boolean)
            {
                if (!enabled) return
                onBeforeHandle(async ({ cookie: { token }, store: { user }, jwt }) =>
                    verifyAuth(token.value || "", user, jwt))
            }
        }
    ))