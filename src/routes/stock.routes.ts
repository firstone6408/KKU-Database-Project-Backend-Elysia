import { t } from "elysia";
import { StockService } from "../services/stock.service";
import { baseRouter } from "./base.routes";
import { StockTypeT } from "../common/enums/stock-type.enum";
import { HttpError } from "../middlewares/error.middleware";

export const stockRouters = baseRouter.group("/stock", { tags: ["Stock"] }, (app) => app

    .guard({ isVerifyAuth: true }, (app) => app

        // TODO endpoints PUT /api/stock/update/:id/product/:productId
        .put("/update/:id/product/:productId", (
            { withRequestHandling, set, params: { id, productId }, body, store: { user } }
        ) =>
        {
            return withRequestHandling({ set }, async () => 
            {
                // console.log(id, productId)
                // console.log(body)
                let updatedStock;
                switch (body.type)
                {
                    case "ADD":
                        updatedStock = await StockService.addStockToProduct(
                            id, productId, body, user.id
                        );
                        break;

                    case "REMOVE":
                        updatedStock = await StockService.removeStockToProduct(
                            id, productId, body, user.id
                        );
                        break;
                    default:
                        throw new HttpError(
                            {
                                statusCode: 400,
                                message: `ประเภทสต็อก ${body.type} ไม่รองรับ`,
                                type: "fail"
                            }
                        );
                }
                return { payload: { data: updatedStock }, message: "ปรับสินค้าใน Stock สำเร็จ" }
            })
        },
            {
                detail: { description: "ปรับ(เพิ่ม-ลด)สินค้าใน Stock พร้อมบันทึกประวัติ" },
                params: t.Object(
                    {
                        id: t.Number(),
                        productId: t.Number()
                    }
                ),
                body: t.Object(
                    {
                        quantity: t.Number({ minimum: 1 }),
                        type: StockTypeT,
                        note: t.Optional(t.String())
                    }
                )
            }
        )


        // ! PUT /api/stock/transfer/:id/product/:productId/branch/:branchId (ยังไม่พร้อมใช้งาน)
        .put("/transfer/:id/product/:productId/branch/:branchId", (
            { withRequestHandling, set }
        ) => 
        {
            return withRequestHandling({ set }, async () =>
            {
                return { payload: { data: {} } }
            })
        },
            {
                detail: { description: "ถ่ายโอนไปยันสาขาอื่น !!ยังไม่พร้อมใช้งาน" }
            })


        // ! PUT /api/stock/adjust/:id/product/:productId/branch/:branchId" (ยังไม่พร้อมใช้งาน)
        .put("/adjust/:id/product/:productId/branch/:branchId", (
            { withRequestHandling, set }
        ) => 
        {
            return withRequestHandling({ set }, async () =>
            {
                return { payload: { data: {} } }
            })
        },
            { detail: { description: "ปรับปรุงสินค้าใน stock !!ยังไม่พร้อมใช้งาน" } }
        )


        // TODO endpoints GET "/api/stock/:id/history"
        .get("/:id/history", ({ withRequestHandling, set, params: { id } }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const stockWithHistories = await StockService.getStockWithHistoriesById(id);
                return { payload: { data: stockWithHistories } }
            });
        },
            {
                params: t.Object({ id: t.Number() })
            }
        )
    )


);