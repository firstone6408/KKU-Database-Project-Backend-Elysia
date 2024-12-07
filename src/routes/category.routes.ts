import { t } from "elysia";
import { CategoryService } from "../services/category.service";
import { baseRouter } from "./base.routes";

export const cateroryRouters = baseRouter.group("/categories", { tags: ["Categories"] }, (app) => app
    .guard({ isVerifyAuth: true }, (app) => app

        // TODO endpoint POST "/categories/"
        .post("/", ({ withRequestHandling, set, body }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const created = await CategoryService.create(body);
                return { payload: { data: created }, message: "สร้างประเภทสินค้าสำเร็จ" }
            });
        },
            {
                body: t.Object({ name: t.String() })
            }
        )


        // TODO endpoint GET "/categories/"
        .get("/", ({ withRequestHandling, set }) => 
        {
            return withRequestHandling({ set }, async () => 
            {
                const categories = await CategoryService.list();
                return { payload: { data: categories } }
            });
        })


        // TODO endpoint GET "/categories/:id"
        .get("/:id", ({ withRequestHandling, set, params: { id } }) => 
        {
            return withRequestHandling({ set }, async () => 
            {
                const category = await CategoryService.getById(id);
                return { payload: { data: category } }
            })
        },
            {
                params: t.Object({ id: t.Number() })
            })


        // TODO endpoint PUT "/categories/:id"
        .put("/:id", ({ withRequestHandling, set, params: { id }, body }) => 
        {
            return withRequestHandling({ set }, async () =>
            {
                const updated = await CategoryService.update(id, body);
                return { payload: { data: updated }, message: "อัปเดตประเภทสินค้าสำเร็จ" }
            });
        },
            {
                params: t.Object({ id: t.Number() }),
                body: t.Object({ name: t.String() })
            }
        )


        // TODO endpoint DELETE "/categories/:id"
        .delete("/:id", ({ withRequestHandling, set, params: { id } }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const deleted = await CategoryService.remove(id);
                return { payload: { data: deleted }, message: "ลบประเภทสินค้าสำเร็จ" }
            });
        },
            {
                params: t.Object({ id: t.Number() })
            }
        )

    )
);