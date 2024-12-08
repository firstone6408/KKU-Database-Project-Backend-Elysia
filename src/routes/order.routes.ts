import { t } from "elysia";
import { OrderService } from "../services/order.service";
import { baseRouter } from "./base.routes";
import { PaymentMethodT } from "../common/enums/stock-type.enum";
import { withRequestHandling } from "../utils/request.utils";

export const orderRouters = baseRouter.group("/order", { tags: ["Orders"] }, (app) => app

    .guard({ isVerifyAuth: true }, (app) => app

        // TODO endpoint POST "/api/order/"
        .post("/create", ({ store: { user }, set }) => withRequestHandling(async () => 
        {
            const created = await OrderService.createOrder(user.id, user.branchId);
            set.status = 201;
            return { payload: { data: created }, message: "เปิดบิลสำเร็จ" }
        }))



        .get("/user", ({ store: { user } }) => withRequestHandling(async () =>
        {
            const currentOrder = await OrderService.orderByUserId(user.id);
            console.log(currentOrder)
            return { payload: { data: currentOrder } }
        }))



        .post("/confim", ({ store: { user }, body }) => withRequestHandling(async () =>
        {
            await OrderService.orderConfirm(body, user.id);
            return { payload: { data: null }, message: "ยืนยันสำเร็จ" }
        }),
            {
                body: t.Object(
                    {
                        id: t.Number(),
                        paymentMethod: PaymentMethodT,
                        orderItems: t.Array(t.Object(
                            {
                                quantity: t.Number(),
                                price: t.Number(),
                                productId: t.Number()
                            }
                        ))
                    }
                )
            }
        )



        .post("/cancel", ({ body, store: { user } }) => withRequestHandling(async () =>
        {
            await OrderService.orderCancel(body, user.id);
            return { payload: { data: null }, message: "ยกเลิกรายการสำเร็จ" }
        }),
            {
                body: t.Object({ id: t.Number() })
            }
        )
    )
);