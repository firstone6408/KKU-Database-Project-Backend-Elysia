import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { ProductService } from "../services/product.service";

export const productController = new Elysia({ prefix: "/products", tags: ["Products"] })
    .use(authPlugin)

    //
    // verify auth, role: "ADMIN"
    //
    .guard(
        {
            isVerifyAuth: true,
            isVerifyRole: ["ADMIN"],
            detail: { description: "คำอธิบาย: สำหรับ Admin" }
        },
        (app) => app



            .post("/", ({ body, set }) => withRequestHandling(async () =>
            {
                const created = await ProductService.createProduct(body);

                set.status = 201;
                return {
                    payload: { data: null },
                    message: `สร้างสินค้า ${created.name} รหัส ${created.productCode} สำเร็จ`
                }
            }),
                {
                    body: t.Object(
                        {
                            productCode: t.String({ minLength: 2 }),
                            name: t.String({ minLength: 1 }),
                            description: t.Optional(t.String()),
                            image: t.Optional(t.String()),
                            categoryId: t.String()
                        }
                    )
                }
            )



            .put("/:id", ({ params, body }) => withRequestHandling(async () =>
            {
                const productUpdated = await ProductService.updateProduct(params.id, body);
                return {
                    payload: { data: null },
                    message: `อัปเดตสินค้ารหัส ${productUpdated.productCode} สำเร็จ`
                }
            }),
                {
                    params: t.Object({ id: t.String() }),
                    body: t.Object(
                        {
                            name: t.Optional(t.String()),
                            description: t.Optional(t.String()),
                            image: t.Optional(t.String()),
                            categoryId: t.Optional(t.String())
                        }
                    )
                }
            )



            .delete("/soft-remove/:id", ({ params }) => withRequestHandling(async () =>
            {
                await ProductService.softRemoveProduct(params.id);
                return { payload: { data: null }, message: `ลบสินค้ารหัส ${params.id} สำเร็จ` }
            }),
                { params: t.Object({ id: t.String() }) }
            )
    )

    //
    // verify auth
    //
    .guard(
        {
            isVerifyAuth: true,
            detail: { description: "คำอธิบาย: สำหรับ ผู้ใช้ที่ Login" }
        }
        , (app) => app



            .get("/", () => withRequestHandling(async () =>
            {
                const products = await ProductService.listProducts();
                return { payload: { data: products } }
            }))



            .get("/:id", ({ params, store: { userJwt } }) => withRequestHandling(async () =>
            {
                const product = await ProductService.getProductById(params.id);
                return { payload: { data: product } }
            }),
                { params: t.Object({ id: t.String() }) }
            )
    )