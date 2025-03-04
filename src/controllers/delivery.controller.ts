/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import {
  DeliveryStatus,
  DeliveryType,
  UserRole,
} from "../../prisma/generated/kku_client";
import { DeliveryService } from "../services/delivery.service";

export const deliveryController = new Elysia({
  prefix: "/deliveries",
  tags: ["Deliveries"],
})
  .use(authPlugin)
  .guard(
    {
      isVerifyAuth: true,
    },
    (app) =>
      app
        .get(
          "/branch/:branchId",
          ({ params }) =>
            withRequestHandling(async () => {
              const deliveries =
                await DeliveryService.listDeliveriesByBranchId(
                  params.branchId
                );
              return { payload: { data: deliveries } };
            }),
          {
            params: t.Object({
              branchId: t.String(),
            }),
          }
        )
        .get(
          "/branch/:branchId/drivers/active",
          ({ params }) =>
            withRequestHandling(async () => {
              const drivers = await DeliveryService.listActiveDrivers(
                params.branchId
              );
              return { payload: { data: drivers } };
            }),
          {
            params: t.Object({
              branchId: t.String(),
            }),
          }
        )
        .get(
          "/branch/:branchId/drivers/available",
          ({ params }) =>
            withRequestHandling(async () => {
              const drivers = await DeliveryService.listAvailableDrivers(
                params.branchId
              );
              return { payload: { data: drivers } };
            }),
          {
            params: t.Object({
              branchId: t.String(),
            }),
          }
        )
  )
  .guard(
    {
      isVerifyAuth: true,
      isVerifyRole: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF],
    },
    (app) =>
      app
        .post(
          "/",
          ({ set, body }) =>
            withRequestHandling(async () => {
              const { orderId, options } = body;
              // console.log("Body:", body);
              await DeliveryService.createDelivery(orderId, options);
              set.status = "Created";
              return { payload: { data: null }, message: "" };
            }),
          {
            body: t.Object({
              orderId: t.String(),
              options: t.Object({
                trackNumber: t.String(),
                distance: t.Number(),
                address: t.Optional(t.String()),
                type: t.Enum(DeliveryType),
                lng: t.Number(),
                lat: t.Number(),
                note: t.Optional(t.String()),
                sendDate: t.Date(),
                fee: t.Number(),
              }),
            }),
          }
        )

        .post(
          "/drivers",
          ({ set, body }) =>
            withRequestHandling(async () => {
              await DeliveryService.addDrivers(body.orderId, body.userIds);
              set.status = "Created";
              return { payload: { data: null } };
            }),
          {
            body: t.Object({
              orderId: t.String(),
              userIds: t.Array(t.String()),
            }),
          }
        )

        .put(
          "/done",
          ({ body }) =>
            withRequestHandling(async () => {
              console.log("Body:", body);
              await DeliveryService.deliveryDone(body.orderId, {
                slipImage: body.slipImage,
              });
              return { payload: { data: null } };
            }),
          {
            body: t.Object({
              orderId: t.String(),
              slipImage: t.Optional(t.File()),
            }),
          }
        )
  );
