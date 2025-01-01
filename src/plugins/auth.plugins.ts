import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import { verifyAuth, verifyRole } from "../middlewares/auth.middleware";
import { UserRole } from "../../prisma/generated/kku_client";

export const authPlugin = new Elysia()
    .use(jwt(
        {
            name: "jwt",
            secret: process.env.JWT_SECRET || "sdfsd9f890*&*6278678A^S",
            exp: "7d"
        }
    ))
    .state({ userJwt: {} as JwtPayload })
    .macro(({ onBeforeHandle }) => (
        {
            isVerifyAuth(enabled: boolean)
            {
                if (!enabled) return
                onBeforeHandle(async ({ cookie: { token }, store: { userJwt }, jwt, request }) =>
                    verifyAuth(token.value || "", userJwt, jwt, request))
            },
            isVerifyRole(userRole: UserRole[])
            {
                onBeforeHandle(async ({ store: { userJwt } }) =>
                    verifyRole(userRole, userJwt))
            }
        }
    ))