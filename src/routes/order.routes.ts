import { t } from "elysia";
import { OrderService } from "../services/order.service";
import { baseRouter } from "./base.routes";
import { PaymentMethodT } from "../common/enums/stock-type.enum";

export const orderRouters = baseRouter.group("/order", { tags: ["Orders"] }, (app) => app

    .guard({ isVerifyAuth: true }, (app) => app

        // TODO endpoint POST "/api/order/"
        .post("/create", ({ withRequestHandling, set, store: { user } }) => 
        {
            return withRequestHandling({ set }, async () => 
            {
                const created = await OrderService.createOrder(user.id, user.branchId);
                return { payload: { data: created }, message: "เปิดบิลสำเร็จ", statusCode: 201 }
            });
        })



        .get("/user", ({ withRequestHandling, set, store: { user } }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                const currentOrder = await OrderService.orderByUserId(user.id);
                console.log(currentOrder)
                return { payload: { data: currentOrder } }
            });
        })



        .post("/confim", ({ withRequestHandling, set, store: { user }, body }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                await OrderService.orderConfirm(body, user.id);
                return { payload: { data: null }, message: "ยืนยันสำเร็จ" }
            });
        },
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



        .post("/cancel", ({ withRequestHandling, set, body, store: { user } }) =>
        {
            return withRequestHandling({ set }, async () =>
            {
                await OrderService.orderCancel(body, user.id);
                return { payload: { data: null }, message: "ยกเลิกรายการสำเร็จ" }
            })
        },
            {
                body: t.Object({ id: t.Number() })
            }
        )
    )
);