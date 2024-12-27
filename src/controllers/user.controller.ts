import Elysia, { t } from "elysia";
import { withRequestHandling } from "../utils/request.utils";
import { authPlugin } from "../plugins/auth.plugins";
import { UserRole } from "../../prisma/generated/kku_client";
import { UserService } from "../services/user.service";

export const userController = new Elysia({ prefix: "/users", tags: ["Users"] })
    .use(authPlugin)

    //
    // verify auth, role: "ADMIN"
    //
    .guard(
        {
            isVerifyAuth: true,
            isVerifyRole: ["ADMIN"],
            detail: { description: "คำอธิบาย: ใช้สำหรับ ADMIN เท่านั้น" }
        }, (app) => app
            .post("/", ({ body, set }) => withRequestHandling(async () =>
            {
                await UserService.createUser(body);
                set.status = "Created";
                return { payload: { data: null }, message: "สร้างบัญชีผู้ใช้สำเร็จ" }
            }), {

                body: t.Object(
                    {
                        username: t.String(),
                        email: t.String(),
                        password: t.String(),
                        name: t.String(),
                        profileImage: t.Optional(t.String()),
                        phoneNumber: t.Optional(t.String()),
                        role: t.Enum(UserRole),
                        branchId: t.Optional(t.String())
                    }
                )
            }
            )
    )



    //
    // verify auth
    //
    .guard(
        {
            isVerifyAuth: true,
            detail: { description: "คำอธิบาย: ใช้สำหรับ User ที่ Login แล้ว" }
        }, (app) => app

            .get("/:id", ({ params }) => withRequestHandling(async () =>
            {
                const user = await UserService.getById(params.id);
                return { payload: { data: user } }
            }),
                {
                    params: t.Object({ id: t.String() })
                }
            )



            .get("/", () => withRequestHandling(async () =>
            {
                const users = await UserService.list();
                return { payload: { data: users } }
            }))
    )

