/** @format */

import Elysia, { t } from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";
import { StockHistoryService } from "../services/stock-history.service";

export const stockHistoryController = new Elysia({
  prefix: "/stock-histories",
  tags: ["Stock Histories"],
})
  .use(authPlugin)
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
