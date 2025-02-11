/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { ProductSaleBranchService } from "../services/product-sale-branch.service";

export const productSaleBranchController = new Elysia({
  prefix: "/product-sale-branches",
  tags: ["ProductSaleBranches"],
})
  .use(authPlugin)

  .guard(
    {
      isVerifyAuth: true,
      isVerifyRole: ["ADMIN", "MANAGER"],
    },
    (app) =>
      app.post(
        "/add",
        ({ body }) =>
          withRequestHandling(async () => {
            const result =
              await ProductSaleBranchService.createOrUpdateProductSaleBranch(
                body
              );
            return {
              payload: { data: null },
              message: `ปรับราคาสินค้า ${result.product.name} เป็นราคา ${result.sellPrice} สำเร็จ`,
            };
          }),
        {
          detail: {
            description: "ใช้สำหรับ เพิ่มหรือปรับราคาสินค้าแต่ละสาขา",
          },
          body: t.Object({
            productId: t.String(),
            branchId: t.String(),
            sellPrice: t.Number(),
          }),
        }
      )
  );
