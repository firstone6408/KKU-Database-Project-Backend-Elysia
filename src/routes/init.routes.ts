import jwt from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import { withRequestHandling } from "../plugins/request.plugin";
import { verifyAuth } from "../middlewares/auth.middleware";

export const initRouter = new Elysia()
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET || "sdfsd9f890*&*6278678A^S",
        exp: "7d"
    }))
    .state({ user: {} as JwtPayload })
    .decorate("withRequestHandling", withRequestHandling)
    //
    // Middlewares Authen
    //
    .macro(({ onBeforeHandle }) => ({
        isVerifyAuth(enabled: boolean) {
            if (!enabled) return
            onBeforeHandle(async ({ request: { headers }, store: { user }, jwt }) =>
                verifyAuth(headers, user, jwt))
        }
    }));