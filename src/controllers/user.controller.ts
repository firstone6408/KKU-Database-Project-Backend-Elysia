import Elysia, { t } from "elysia";
import { withRequestHandling } from "../utils/request.utils";
import { authPlugin } from "../plugins/auth.plugins";
import { UserRole } from "../../prisma/generated/kku_client";
import { UserService } from "../services/user.service";

export const userController = new Elysia({ prefix: "/users", tags: ["Users"] })
    .use(authPlugin)


    .guard(
        {
            // isVerifyAuth: true,
            // isVerifyRole: ["ADMIN", "MANAGER"],
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
                        profileImage: t.Optional(t.File()),
                        phoneNumber: t.Optional(t.String()),
                        role: t.Enum(UserRole),
                        branchId: t.Optional(t.String())
                    }
                )
            }
            )
    )



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


            .get("/branch/:branchId", ({ params }) => withRequestHandling(async () =>
            {
                const users = await UserService.listUsersByBranchId(params.branchId);
                return { payload: { data: users } }
            }), { params: t.Object({ branchId: t.String() }) })
    )

