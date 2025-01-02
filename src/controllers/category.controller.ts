import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { CategoryService } from "../services/category.service";

export const categoryController = new Elysia({ prefix: "/categories", tags: ["Categories"] })
    .use(authPlugin)


    .guard(
        {
            isVerifyAuth: true,
            isVerifyRole: ["ADMIN"],
            detail: { description: "คำอธิบาย: ใช้ได้เฉพาะ ADMIN เท่านั้น" },
        }
        , (app) => app
            .post("/", ({ body, set }) => withRequestHandling(async () =>
            {
                const category = await CategoryService.createCategory(body);
                set.status = 201;
                return { payload: { data: null }, message: `เพิ่มหมวดหมู่ ${category.name} เข้าสู่ระบบแล้ว` }
            }),
                {
                    body: t.Object(
                        {
                            categoryCode: t.String({ minLength: 1 }),
                            name: t.String({ minLength: 1 })
                        }
                    )
                }
            )



            .put("/:id", ({ params, body }) => withRequestHandling(async () =>
            {
                await CategoryService.updateCategory(params.id, body);
                return { payload: { data: null }, message: "อัปเดตหมวดหมู่สินค้าสำเร็จ" }
            }),
                {
                    params: t.Object({ id: t.String() }),
                    body: t.Object({ categoryCode: t.String(), name: t.String() })
                }
            )



            .delete("/:id", ({ params }) => withRequestHandling(async () =>
            {
                const result = await CategoryService.deleteCategory(params.id)
                return { payload: { data: null }, message: `ลบหมวดหมู่ ${result.name} สำเร็จ` }
            }),
                {
                    params: t.Object({ id: t.String() })
                }
            )
    )



    .guard(
        {
            isVerifyAuth: true,
            detail: { description: "คำอธิบาย: User ทั่วไปใช้ได้" },
        }, (app) => app
            .get("/", () => withRequestHandling(async () =>
            {
                const categories = await CategoryService.listCategories();
                return { payload: { data: categories } }
            }))
    )