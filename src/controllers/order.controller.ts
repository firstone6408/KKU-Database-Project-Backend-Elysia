/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { OrderService } from "../services/order.service";
import { OrderStatus } from "../../prisma/generated/kku_client";

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
              return {
                payload: { data: null },
                message: "ปิดรายการเรียบร้อย",
              };
            }),
          {
            body: t.Object({
              orderId: t.String(),
              orderItems: t.Array(
                t.Object({
                  sellPrice: t.Number(),
                  quantity: t.Number(),
                  productId: t.String(),
                })
              ),
              orderStatus: t.Enum(OrderStatus),
              note: t.Optional(t.String()),
              paymentMethodId: t.String(),

              amountReceived: t.Optional(t.Number()),
              change: t.Optional(t.Number()),
              slipImage: t.Optional(t.File()),
              credit: t.Optional(t.Number()),
              deposit: t.Optional(t.Number()),
              discount: t.Optional(t.Number()),
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
  );
