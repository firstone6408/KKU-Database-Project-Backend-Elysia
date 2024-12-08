import { t } from "elysia";
import { CategoryService } from "../services/category.service";
import { baseRouter } from "./base.routes";
import { withRequestHandling } from "../utils/request.utils";

export const cateroryRouters = baseRouter.group("/categories", { tags: ["Categories"] }, (app) => app
    .guard({ isVerifyAuth: true }, (app) => app

        // TODO endpoint POST "/categories/"
        .post("/", ({ body }) => withRequestHandling(async () =>
        {
            const created = await CategoryService.create(body);
            return { payload: { data: created }, message: "สร้างประเภทสินค้าสำเร็จ" }
        }),
            {
                body: t.Object({ name: t.String() })
            }
        )


        // TODO endpoint GET "/categories/"
        .get("/", () => withRequestHandling(async () => 
        {
            const categories = await CategoryService.list();
            return { payload: { data: categories } }
        }))


        // TODO endpoint GET "/categories/:id"
        .get("/:id", ({ params: { id } }) => withRequestHandling(async () => 
        {
            const category = await CategoryService.getById(id);
            return { payload: { data: category } }
        }),
            {
                params: t.Object({ id: t.Number() })
            })


        // TODO endpoint PUT "/categories/:id"
        .put("/:id", ({ params: { id }, body }) => withRequestHandling(async () =>
        {
            const updated = await CategoryService.update(id, body);
            return { payload: { data: updated }, message: "อัปเดตประเภทสินค้าสำเร็จ" }
        }),
            {
                params: t.Object({ id: t.Number() }),
                body: t.Object({ name: t.String() })
            }
        )


        // TODO endpoint DELETE "/categories/:id"
        .delete("/:id", ({ params: { id } }) => withRequestHandling(async () =>
        {
            const deleted = await CategoryService.remove(id);
            return { payload: { data: deleted }, message: "ลบประเภทสินค้าสำเร็จ" }
        }),
            {
                params: t.Object({ id: t.Number() })
            }
        )

    )
);