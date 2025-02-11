/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { PaymentMethodService } from "../services/payment-method.service";

export const paymentMethodController = new Elysia({
  prefix: "/payment-methods",
  tags: ["PaymentMethods"],
})
  .use(authPlugin)

  .guard(
    {
      isVerifyAuth: true,
      isVerifyRole: ["ADMIN"],
    },
    (app) =>
      app

        .post(
          "/",
          ({ body, set }) =>
            withRequestHandling(async () => {
              const result =
                await PaymentMethodService.createPaymentMethod(body);

              set.status = 201;
              return {
                payload: { data: null },
                message: `เพิ่ม ${result.name} ในระบบสำเร็จ`,
              };
            }),
          {
            body: t.Object({ name: t.String({ minLength: 2 }) }),
          }
        )

        .put(
          "/:id",
          ({ params, body }) =>
            withRequestHandling(async () => {
              await PaymentMethodService.updatePaymentMethod(
                params.id,
                body
              );
              return { payload: { data: null }, message: "อัปเดตสำเร็จ" };
            }),
          {
            params: t.Object({ id: t.String() }),
            body: t.Object({ name: t.String() }),
          }
        )

        .delete(
          "/:id",
          ({ params }) =>
            withRequestHandling(async () => {
              await PaymentMethodService.removePaymentMethod(params.id);
              return { payload: { data: null }, message: "ลบสำเร็จ" };
            }),
          {
            params: t.Object({ id: t.String() }),
          }
        )
  )

  .guard(
    {
      isVerifyAuth: true,
    },
    (app) =>
      app.get("/", () =>
        withRequestHandling(async () => {
          const paymentMethods =
            await PaymentMethodService.listPaymentMethods();
          return { payload: { data: paymentMethods } };
        })
      )
  );
