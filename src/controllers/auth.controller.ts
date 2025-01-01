import Elysia, { t } from "elysia";
import { withRequestHandling } from "../utils/request.utils";
import { AuthService } from "../services/auth.service";
import { authPlugin } from "../plugins/auth.plugins";

export const authController = new Elysia({
  prefix: "/auth",
  tags: ["Authen"],
})
  .use(authPlugin)

  .post("/login", ({ jwt, body, cookie: { token } }) => withRequestHandling(async () =>
  {
    const result = await AuthService.login(body, jwt);
    // console.log(result)
    token.set(
      {
        value: result.token,
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7, // 7d
      }

    );
    return {
      payload: { data: { token: result.token, user: result.user } },
      message: "เข้าสู่ระบบสำเร็จ",
    };
  }),
    {
      detail: { description: "คำอธิบาย: สำหรับให้ User Login" },
      body: t.Object(
        {
          username: t.String(),
          password: t.String(),
        }
      ),
    }
  )

  .post("/login/provider", ({ body, jwt, cookie: { token } }) => withRequestHandling(async () => 
  {
    const result = await AuthService.loginWithProvider(body, jwt);
    token.set(
      {
        value: result.token,
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7, // 7d
      }

    );
    return {
      payload: { data: { token: result.token, user: result.user } },
      message: "เข้าสู่ระบบสำเร็จ",
    };
  }),
    {
      detail: { description: "คำอธิบาย: สำหรับการ Login ด้วยผู้บริการอื่นๆ เช่น Google" },
      body: t.Object({ email: t.String() })
    }
  )

  .guard(
    {
      isVerifyAuth: true,
      detail: { description: "คำอธิบาย: ใช้สำหรับ User ที่ Login แล้ว" },
    },
    (app) => app

      .post("/logout", ({ cookie: { token } }) => withRequestHandling(async () =>
      {
        token.remove();
        return {
          payload: { data: null },
          message: "ออกจากระบบสำเร็จ",
        };
      }))

      .get("/current-user", ({ store: { userJwt } }) => withRequestHandling(async () =>
      {
        const result = await AuthService.currentUser(userJwt);
        return { payload: { data: result } };
      }))
  );
