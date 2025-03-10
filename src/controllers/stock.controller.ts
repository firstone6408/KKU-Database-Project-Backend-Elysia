/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { StockService } from "../services/stock.service";

export const stockController = new Elysia({
  prefix: "/stocks",
  tags: ["Stocks"],
})
  .use(authPlugin)

  .guard(
    {
      isVerifyAuth: true,
      isVerifyRole: ["ADMIN", "MANAGER", "STAFF"],
      detail: { description: "คำอธิบาย: ใช้สำหรับ Admin, Manager" },
    },
    (app) =>
      app.post(
        "/add",
        ({ body, store: { userJwt }, set }) =>
          withRequestHandling(async () => {
            await StockService.createOrIncrementStock(userJwt.id, body);
            set.status = "Created";
            return {
              payload: { data: null },
              message: "เพิ่มสินค้าใน Stock สำเร็จ",
            };
          }),
        {
          detail: {
            description: "สร้างหรือเพิ่มสินค้าเข้า Stock แต่ละสาขา",
          },
          body: t.Object({
            branchId: t.String(),
            refCode: t.String(),
            distributor: t.String(),
            note: t.Optional(t.String()),
            stockInItems: t.Array(
              t.Object({
                productId: t.String(),
                costPrice: t.Number(),
                quantity: t.Number({ minimum: 0 }),
              })
            ),
          }),
        }
      )
  );
