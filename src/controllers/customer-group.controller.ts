import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { CustomerGroupService } from "../services/customer-group.service";

export const customerGroupCotroller = new Elysia({ prefix: "/customer-groups", tags: ["CustomerGroups"] })
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
                const customerGroup = await CustomerGroupService.createCustomerGroup(body);
                set.status = "Created";
                return { payload: { data: null }, message: `เพิ่มกลุ่ม ${customerGroup.name} สำเร็จ` }
            }),
                { body: t.Object({ name: t.String({ minLength: 1 }) }) }
            )



            .put("/:id", ({ params, body }) => withRequestHandling(async () =>
            {
                await CustomerGroupService.updateCustomerGroup(params.id, body)
                return { payload: { data: null }, message: "อัปเดตกลุ่มสำเร็จ" }
            }),
                {
                    params: t.Object({ id: t.String() }),
                    body: t.Object({ name: t.String() })
                }
            )
    )

    //
    // verify auth
    //
    .guard(
        {
            isVerifyAuth: true,
            detail: { description: "คำอธิบาย: ใช้สำหรับ User ที่ Login" }
        }
        , (app) => app
            .get("/", () => withRequestHandling(async () => 
            {
                const customerGroups = await CustomerGroupService.listCustomerGroup();
                return { payload: { data: customerGroups } }
            }))
    )