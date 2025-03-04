/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { ProductService } from "../services/product.service";
import { ProductUnit } from "../../prisma/generated/kku_client";

export const productController = new Elysia({
  prefix: "/products",
  tags: ["Products"],
})
  .use(authPlugin)

  .guard(
    {
      isVerifyAuth: true,
      isVerifyRole: ["ADMIN"],
      detail: { description: "คำอธิบาย: สำหรับ Admin" },
    },
    (app) =>
      app

        .post(
          "/",
          ({ body, set }) =>
            withRequestHandling(async () => {
              const created = await ProductService.createProduct(body);

              set.status = 201;
              return {
                payload: { data: null },
                message: `สร้างสินค้า ${created.name} รหัส ${created.productCode} สำเร็จ`,
              };
            }),
          {
            body: t.Object({
              barcode: t.String(),
              productCode: t.String({ minLength: 2 }),
              name: t.String({ minLength: 1 }),
              model: t.Optional(t.String()),
              size: t.Optional(t.String()),
              description: t.Optional(t.String()),
              image: t.Optional(t.File()),
              categoryId: t.String(),
              unit: t.Enum(ProductUnit),
            }),
          }
        )

        .put(
          "/:id",
          ({ params, body }) =>
            withRequestHandling(async () => {
              //console.log(body)
              const productUpdated = await ProductService.updateProduct(
                params.id,
                body
              );
              return {
                payload: { data: null },
                message: `อัปเดตสินค้ารหัส ${productUpdated.productCode} สำเร็จ`,
              };
            }),
          {
            params: t.Object({ id: t.String() }),
            body: t.Object({
              barcode: t.String(),
              productCode: t.String({ minLength: 2 }),
              name: t.String({ minLength: 1 }),
              model: t.Optional(t.String()),
              size: t.Optional(t.String()),
              description: t.Optional(t.String()),
              image: t.Optional(t.File()),
              categoryId: t.String(),
              isDeleted: t.BooleanString(),
              unit: t.Enum(ProductUnit),
            }),
          }
        )

        .delete(
          "/soft-remove/:id",
          ({ params }) =>
            withRequestHandling(async () => {
              await ProductService.softRemoveProduct(params.id);
              return {
                payload: { data: null },
                message: `ลบสินค้ารหัส ${params.id} สำเร็จ`,
              };
            }),
          { params: t.Object({ id: t.String() }) }
        )
  )

  .guard(
    {
      isVerifyAuth: true,
      detail: { description: "คำอธิบาย: สำหรับ ผู้ใช้ที่ Login" },
    },
    (app) =>
      app
        .get("/", () =>
          withRequestHandling(async () => {
            const products = await ProductService.listProducts();
            return { payload: { data: products } };
          })
        )

        .get(
          "/:id",
          ({ params }) =>
            withRequestHandling(async () => {
              const product = await ProductService.getProductById(
                params.id
              );
              return { payload: { data: product } };
            }),
          { params: t.Object({ id: t.String() }) }
        )

        .get(
          "/branch/:branchId",
          ({ params, query }) =>
            withRequestHandling(async () => {
              const products = await ProductService.listProductsByBranchId(
                params.branchId,
                query
              );
              return { payload: { data: products } };
            }),
          {
            params: t.Object({ branchId: t.String() }),
          }
        )

        .get(
          "/branch/:branchId/available",
          ({ params }) =>
            withRequestHandling(async () => {
              const products =
                await ProductService.listProductsAvailableByBranchId(
                  params.branchId
                );
              return { payload: { data: products } };
            }),
          {
            params: t.Object({ branchId: t.String() }),
          }
        )

    // .get(
    //   "/branch/:branchId/unstocked-products",
    //   ({ params }) =>
    //     withRequestHandling(async () => {
    //       const products =
    //         await ProductService.listUnstockedProductsByBranchId(
    //           params.branchId
    //         );
    //       return { payload: { data: products } };
    //     }),
    //   {
    //     params: t.Object({ branchId: t.String() }),
    //   }
    // )
  );
