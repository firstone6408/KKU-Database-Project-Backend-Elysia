/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { StockHistoryService } from "../services/stock-history.service";
import { UserRole } from "../../prisma/generated/kku_client";

export const stockHistoryController = new Elysia({
  prefix: "/stock-histories",
  tags: ["Stock Histories"],
})
  .use(authPlugin)
  .guard(
    {
      isVerifyAuth: true,
      isVerifyRole: [UserRole.ADMIN, UserRole.MANAGER],
    },
    (app) =>
      app.patch(
        "cancel/branch/:branchId/:stockInHistoryId",
        ({ params, body, store: { userJwt } }) =>
          withRequestHandling(async () => {
            const { branchId, stockInHistoryId } = params;
            const { cancelNote } = body;
            const r = await StockHistoryService.cancelStockInHistory(
              branchId,
              stockInHistoryId,
              userJwt.id,
              cancelNote
            );
            return {
              payload: { data: r },
              message: "ยกเลิกบิลนำเข้าสำเร็จ",
            };
          }),
        {
          params: t.Object({
            branchId: t.String(),
            stockInHistoryId: t.String(),
          }),
          body: t.Object({
            cancelNote: t.String(),
          }),
        }
      )
  )
  .guard(
    {
      isVerifyAuth: true,
    },
    (app) =>
      app.get(
        "/in/branch/:branchId",
        ({ params }) =>
          withRequestHandling(async () => {
            const stockInHistories =
              await StockHistoryService.listStockInHistories(
                params.branchId
              );
            return { payload: { data: stockInHistories } };
          }),
        { params: t.Object({ branchId: t.String() }) }
      )
  );
