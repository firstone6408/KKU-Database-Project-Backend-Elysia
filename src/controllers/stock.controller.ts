import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { StockService } from "../services/stock.service";

export const stockController = new Elysia({ prefix: "/stocks", tags: ["Stocks"] })
    .use(authPlugin)


    .guard(
        {
            isVerifyAuth: true,
            isVerifyRole: ["ADMIN", "MANAGER", "STAFF"],
            detail: { description: "คำอธิบาย: ใช้สำหรับ Admin, Manager" }
        }
    )

    .post("/add", (
        {
            body,
            store: { userJwt }
        }
    ) => withRequestHandling(async () =>
    {
        await StockService.createOrIncrementStock(userJwt.id, body);
        return { payload: { data: null }, message: "เพิ่มสินค้าใน Stock สำเร็จ" }
    }),
        {
            detail: { description: "สร้างหรือเพิ่มสินค้าเข้า Stock แต่ละสาขา" },
            body: t.Object(
                {
                    branchId: t.String(),
                    productId: t.String(),
                    quantity: t.Number({ minimum: 0 }),
                    refCode: t.String(),
                    note: t.Optional(t.String()),
                    costPrice: t.Number(),
                }
            )
        }
    )

    .get("/branch/:branchId/stock-in-history", ({ params }) => withRequestHandling(async () =>
    {
        const stocks = await StockService.listStocksWithStockInHistoryByBranchId(params.branchId);
        return { payload: { data: stocks } }
    })
        , {
            params: t.Object({ branchId: t.String() })
        }
    )

    .get("/branch/:branchId/stock-out-history", ({ params }) => withRequestHandling(async () =>
    {
        const stocks = await StockService.listStocksWithStockOutHistoryByBranchId(params.branchId);
        return { payload: { data: stocks } }
    })
        , {
            params: t.Object({ branchId: t.String() })
        }
    )