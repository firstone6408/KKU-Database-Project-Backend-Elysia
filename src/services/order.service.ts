import { PaymentMethod } from "../../prisma/generated/kku_client";
import { kkuDB } from "../database/prisma/kku.prisma"
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class OrderService
{
    public static async createOrder(userId: number,
        branchId: number | null,
    )
    {
        if (!branchId)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "บัญชีของคุณยังไม่มีสาขา",
                    type: "fail"
                }
            )
        }

        const existingUser = await db.user.findFirst(
            {
                where:
                {
                    id: userId,
                    branchId: branchId
                },
                select: { id: true }
            }
        );

        if (!existingUser)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "ไม่มีบัญชีผู้ใช้นี้อยู่ในระบบ หรือ ผู้ใชไม่ได้อยู่ในสาขา",
                    type: "fail"
                }
            );
        }

        const isOpenBill = await db.order.findFirst(
            {
                where:
                {
                    userId: userId,
                    branchId: branchId,
                    orderStatus: "PENDING"
                },
                select: { id: true }
            }
        );

        if (isOpenBill)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "ไม่สามารถเปิดบิลใหม่ได้ เนื่องจากคุณมีบิลที่เปิดอยู่แล้ว",
                    type: "fail"
                }
            );
        }

        return await db.order.create(
            {
                data: {
                    userId: existingUser.id,
                    branchId: branchId
                }
            }
        );
    }

    public static async orderByUserId(userId: number)
    {
        return await db.order.findMany(
            {
                where: { userId: userId, },
                include: { orderItems: true },
                orderBy: { id: "desc" }
            }
        );
    }

    public static async orderConfirm(options:
        {
            id: number,
            paymentMethod: PaymentMethod
            orderItems:
            {
                quantity: number,
                price: number,
                productId: number
            }[]

        },
        userId: number,
    )
    {
        const existingOrder = await db.order.findFirst(
            {
                where:
                {
                    id: options.id,
                    orderStatus: "PENDING"
                },
                select: { id: true }
            }
        );

        if (!existingOrder)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "ไม่พบบิล",
                    type: "fail"
                }
            );
        }


        // check order
        for (let i = 0; i < options.orderItems.length; i += 1)
        {
            const item = options.orderItems[i];
            const stock = await db.stock.findFirst(
                {
                    where: { productId: item.productId },
                    select: { quantity: true }
                }
            );

            if (!stock || stock.quantity < item.quantity)
            {
                throw new HttpError({
                    statusCode: 400,
                    message: `สินค้าบางรายการ มี Stock ไม่เพียงพอ`,
                    type: "fail",
                });
            }
        }

        // update order
        const totalPrice = options.orderItems.reduce((
            sum, item) => sum + (item.price * item.quantity), 0);

        const order = await db.order.update(
            {
                where:
                {
                    id: options.id,
                    userId: userId
                },
                data:
                {
                    totalPrice: totalPrice,
                    paymentMethod: options.paymentMethod,
                    orderStatus: "COMPLETED",
                    paymentStatus: "PAID"
                }
            }
        );

        // update stock and stock history
        for (let i = 0; i < options.orderItems.length; i += 1)
        {
            const item = options.orderItems[i];
            const stockUpdate = await db.stock.update(
                {
                    where: { productId: item.productId },
                    data:
                    {
                        quantity:
                        {
                            decrement: item.quantity
                        }
                    }
                }
            );

            await db.stockHistory.createMany(
                {
                    data: {
                        quantity: item.quantity,
                        note: "ขายออก",
                        stockId: stockUpdate.id,
                        type: "REMOVE",
                        userId: userId,
                        productId: item.productId,
                        orderId: options.id
                    }
                }
            );
        }

        const createdOrderItems = options.orderItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
            orderId: options.id
        }))

        // add order items
        await db.orderItem.createMany({
            data: createdOrderItems
        });

        return order;
    }

    public static async orderCancel(options:
        {
            id: number,
        }
        , userId: number
    )
    {
        const existingOrder = await db.order.findFirst(
            {
                where:
                {
                    id: options.id,
                    userId: userId,
                    orderStatus: { not: "CANCELED" }
                },
                select: { id: true, userId: true, orderStatus: true }
            },
        );

        if (!existingOrder)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "ไม่พบบิล",
                    type: "fail"
                }
            );
        }

        // ถ้ายังไม่จ่ายตังแต่ยกเลิกก็ให้ข้ามการ recover
        switch (existingOrder.orderStatus)
        {
            case "COMPLETED":
                // recover stock
                const recoverStock = await db.stockHistory.findMany(
                    {
                        where: { orderId: options.id },
                        select:
                        {
                            stockId: true,
                            quantity: true,
                            productId: true
                        }
                    }
                );

                if (recoverStock.length <= 0)
                {
                    throw new HttpError(
                        {
                            statusCode: 400,
                            message: "ไม่พบรายการสินค้าในประวัติ",
                            type: "fail"
                        }
                    );
                }

                for (let i = 0; i < recoverStock.length; i += 1)
                {
                    const item = recoverStock[i];

                    // recover stock
                    await db.stock.update(
                        {
                            where: { id: item.stockId },
                            data:
                            {
                                quantity:
                                {
                                    increment: item.quantity
                                }
                            }
                        }
                    );

                    // add cancel status
                    await db.stockHistory.create(
                        {
                            data:
                            {
                                quantity: item.quantity,
                                note: "ลูกค้ายกเลิกรายการ",
                                type: "CANCELED",
                                stockId: item.stockId,
                                userId: userId,
                                productId: item.productId,
                                orderId: options.id
                            }
                        }
                    );
                }

                // cancel order
                await db.order.update(
                    {
                        where: {
                            id: existingOrder.id,
                            userId: existingOrder.userId
                        },
                        data:
                        {
                            orderStatus: "CANCELED",
                        }
                    }
                );
                break;

            default:
                // ลบ order ถ้ายังไม่สั่งของ
                await db.order.delete(
                    {
                        where: { id: existingOrder.id }
                    }
                );
                break;
        }

    }
}