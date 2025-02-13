/** @format */

import Elysia from "elysia";
import { authPlugin } from "../plugins/auth.plugins";
import { withRequestHandling } from "../utils/request.utils";

export const deliveryController = new Elysia({
  prefix: "/deliveries",
  tags: ["Deliveries"],
})
  .use(authPlugin)
  .guard({ isVerifyAuth: true }, (app) =>
    app.get("/", () =>
      withRequestHandling(async () => {
        return { payload: { data: null }, message: "" };
      })
    )
  );
