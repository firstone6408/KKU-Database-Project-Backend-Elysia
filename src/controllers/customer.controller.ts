/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { CustomerService } from "../services/customer.service";

export const customerController = new Elysia({
  prefix: "/customers",
  tags: ["Customers"],
})
  .use(authPlugin)

  .guard(
    {
      isVerifyAuth: true,
      detail: { description: "คำอธิบาย: สำหรับ User ที่ Login" },
    },
    (app) =>
      app

        .post(
          "/",
          ({ body, set }) =>
            withRequestHandling(async () => {
              const customer = await CustomerService.createCustomer(body);
              set.status = "Created";
              return {
                payload: { data: null },
                message: `เพิ่มลูกค้า ${customer.name} เข้าสู่ระบบสำเร็จ`,
              };
            }),
          {
            body: t.Object({
              customerCode: t.String(),
              customerGroupId: t.String(),
              name: t.String(),
              phoneNumber: t.String(),
              address: t.Optional(t.String()),
              branchId: t.String(),
              userId: t.String(),
            }),
          }
        )

        .put(
          "/:id",
          ({ params, body }) =>
            withRequestHandling(async () => {
              const customer = await CustomerService.updateCustomerById(
                params.id,
                body
              );
              return {
                payload: { data: null },
                message: `อัปเดตลูกค้ารหัส ${customer.customerCode} สำเร็จ`,
              };
            }),
          {
            params: t.Object({ id: t.String() }),
            body: t.Object({
              customerGroupId: t.String(),
              name: t.String(),
              phoneNumber: t.String(),
              address: t.Optional(t.String()),
            }),
          }
        )

        .get(
          "/branch/:branchId",
          ({ params }) =>
            withRequestHandling(async () => {
              const customers =
                await CustomerService.listCustomersByBranchId(
                  params.branchId
                );
              return { payload: { data: customers } };
            }),
          {
            params: t.Object({ branchId: t.String() }),
          }
        )

        .get(
          "/branch/:branchId/user/:userId",
          ({ params }) =>
            withRequestHandling(async () => {
              const customers =
                await CustomerService.listCustomersByBranchIdAndUserId(
                  params.branchId,
                  params.userId
                );
              return { payload: { data: customers } };
            }),
          {
            params: t.Object({
              branchId: t.String(),
              userId: t.String(),
            }),
          }
        )

        .get(
          "/:id",
          ({ params }) =>
            withRequestHandling(async () => {
              const customers = await CustomerService.listCustomersById(
                params.id
              );
              return { payload: { data: customers } };
            }),
          {
            params: t.Object({
              id: t.String(),
            }),
          }
        )
  );
