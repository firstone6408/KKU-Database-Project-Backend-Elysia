/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { OrderService } from "../services/order.service";
import { OrderStatus, OrderType } from "../../prisma/generated/kku_client";

export const orderController = new Elysia({
  prefix: "/orders",
  tags: ["Orders"],
})
  .use(authPlugin)

  .guard(
    {
      isVerifyAuth: true,
    },
    (app) =>
      app

        .post(
          "/create",
          ({ store: { userJwt }, body }) =>
            withRequestHandling(async () => {
              await OrderService.createOrder(userJwt.id, body);
              return {
                payload: { data: null },
                message: "สร้างรายการสำเร็จ",
              };
            }),
          {
            body: t.Object({
              customerId: t.String(),
              branchId: t.String(),
              orderCode: t.String(),
            }),
          }
        )

        .put(
          "/confirm",
          ({ body }) =>
            withRequestHandling(async () => {
              await OrderService.confirmOrder(body);
              //   console.log("body:", body);
              return {
                payload: { data: null },
              };
            }),
          {
            body: t.Object({
              orderId: t.String(),
              orderItems: t.ArrayString(
                t.Object({
                  sellPrice: t.Numeric(),
                  quantity: t.Numeric(),
                  productId: t.String(),
                })
              ),
              orderType: t.Enum(OrderType),
              note: t.Optional(t.String()),
              paymentMethodId: t.String(),

              amountRecevied: t.Optional(t.Numeric()),
              change: t.Optional(t.Numeric()),
              slipImage: t.Optional(t.File()),
              credit: t.Optional(t.Numeric()),
              deposit: t.Optional(t.Numeric()),
              discount: t.Optional(t.Numeric()),
            }),
          }
        )

        .put(
          "/pay",
          ({ body }) =>
            withRequestHandling(async () => {
              await OrderService.payOrder(body.orderId, {
                slipImage: body.slipImage,
              });
              //   console.log("body:", body);
              return {
                payload: { data: null },
              };
            }),
          {
            body: t.Object({
              orderId: t.String(),
              slipImage: t.File(),
            }),
          }
        )

        .delete(
          "/:id/cancel",
          ({ params }) =>
            withRequestHandling(async () => {
              await OrderService.cancelOrder(params.id);
              return {
                payload: { data: null },
                message: `ยกเลิกรายการสำเร็จ`,
              };
            }),
          {
            params: t.Object({ id: t.String() }),
          }
        )

        .get(
          "/user/:userId",
          ({ params }) =>
            withRequestHandling(async () => {
              const orders = await OrderService.listOrdersByUserId(
                params.userId
              );
              return { payload: { data: orders } };
            }),
          {
            params: t.Object({ userId: t.String() }),
          }
        )

        .get(
          "/branch/:branchId",
          ({ params, query }) =>
            withRequestHandling(async () => {
              const orders = await OrderService.listOrdersByBranchId(
                params.branchId,
                query
              );
              return { payload: { data: orders } };
            }),
          { params: t.Object({ branchId: t.String() }) }
        )
  );
