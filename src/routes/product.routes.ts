import { t } from "elysia";
import { baseRouter } from "./base.routes";
import { ProductSerivce } from "../services/product.service";

export const productRouters = baseRouter.group("/products", { tags: ["Products"] }, (app) => app
    .guard({ isVerifyAuth: true }, (app) => app

        // TODO endpoints POST "/api/products"
        .post("/", ({ withRequestHandling, set, body, store: { user } }) => 
        {
            return withRequestHandling({ set }, async () =>
            {
                const created = await ProductSerivce.create(body, user.id);
                return { payload: { data: created }, message: "เพิ่มสินค้าสำเร็จ", statusCode: 201 }
            })
        },
            {
                detail: {
                    description: "เพิ่มสินค้าเข้าระบบ โดยที่จะเพิ่มลง Stock และ ประวัติ Stock อัติโนมันติ"
                },
                body: t.Object(
                    {
                        sku: t.String(),
                        name: t.String(),
                        description: t.Optional(t.String()),
                        price: t.Number(),
                        image: t.Optional(t.String()),
                        categoryId: t.Optional(t.Number()),
                        branchId: t.Optional(t.Number()),
                        quantity: t.Optional(t.Number()),
                        note: t.Optional(t.String())
                    }
                )
            })


        // TODO endpoints GET "/api/products"
        .get("/", ({ withRequestHandling, set }) => 
        {
            return withRequestHandling({ set }, async () =>
            {
                const products = await ProductSerivce.list();
                return { payload: { data: products } }
            });
        })


        // TODO endpoints GET "/api/products/stocks"
        .get("/stocks", ({ withRequestHandling, set }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const productsWithStocks = await ProductSerivce.listWithStock();
                return { payload: { data: productsWithStocks } }
            })
        })


        // TODO endpoints GET "/api/products/:id"
        .get("/:id", ({ withRequestHandling, set, params: { id } }) =>
        {
            return withRequestHandling({ set }, async () => 
            {
                const product = await ProductSerivce.getById(id);
                return { payload: { data: product } }
            })
        },
            {
                params: t.Object({ id: t.Number() })
            }
        )


        // TODO endpoints GET "/api/products/sku/:sku"
        .get("/sku/:sku", ({ withRequestHandling, set, params: { sku } }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const product = await ProductSerivce.getBySku(sku);
                return { payload: { data: product } }
            })
        },
            {
                params: t.Object({ sku: t.String() })
            }
        )


        // TODO endpoints DELETE "/api/products/:id/sku/:sku"
        .delete("/:id/sku/:sku/soft-delete", ({ withRequestHandling, set, params: { id, sku } }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const deleted = await ProductSerivce.softRemove(id, sku);
                return { payload: { data: deleted }, message: "ลบสินค้าสำเร็จ" }
            })
        },
            {
                detail: { description: "เปลี่ยนสถาณะสินค้า(ไม่ได้ลบในระบบ)" },
                params: t.Object(
                    {
                        id: t.Number(),
                        sku: t.String()
                    }
                ),
            }
        )


        // TODO endpoints UPDATE "/api/products/:id/sku/:sku"
        .put("/:id/sku/:sku", ({ withRequestHandling, set, params: { id, sku }, body }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                console.log(id, sku)
                const updated = await ProductSerivce.update(id, sku, body);
                return { payload: { data: updated }, message: "อัปเดตสินค้าสำเร็จ" }
            })
        },
            {
                params: t.Object(
                    {
                        id: t.Number(),
                        sku: t.String()
                    }
                ),
                body: t.Object(
                    {
                        name: t.String(),
                        description: t.Optional(t.String()),
                        price: t.Number(),
                        image: t.Optional(t.String()),
                        categoryId: t.Optional(t.Number())
                    }
                )
            }
        )
    )
);