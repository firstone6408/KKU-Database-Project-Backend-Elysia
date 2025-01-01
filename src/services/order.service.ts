import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class OrderService
{
    public static async createOrder(
        userId: string,

        options:
            {
                customerId: string,
                branchId: string,
            }
    )
    {
        const existingBranch = await db.branch.findUnique({ where: { id: options.branchId }, select: { id: true } })

        if (!existingBranch)
        {
            throw new HttpError(
                {
                    message: "ไม่พบสาขาที่ระบุ",
                    statusCode: 404,
                    type: "fail"
                }
            );
        }

        const existingCustomerInBranch = await db.customer.findFirst(
            {
                where:
                {
                    AND: [
                        { id: options.customerId },
                        { branchId: options.branchId }
                    ]
                },
                select: { id: true }
            }
        );

        if (!existingCustomerInBranch)
        {
            throw new HttpError(
                {
                    message: "ลูกค้าไม่ได้อยู่ในสาขานี้",
                    statusCode: 400,
                    type: "fail"
                }
            );
        }

        const existingOrder = await db.order.findUnique(
            {
                where:
                {
                    customerId_userId_branchId:
                    {
                        customerId: options.customerId,
                        userId: userId,
                        branchId: options.branchId
                    }
                },
                select: { id: true }
            }
        );

        if (existingOrder)
        {
            throw new HttpError(
                {
                    message: "รายการนี้ถูกสร้างแล้ว",
                    statusCode: 400,
                    type: "fail"
                }
            );
        }

        await db.order.create(
            {
                data:
                {
                    customerId: options.customerId,
                    userId: userId,
                    branchId: options.branchId,
                    status: "PENDING"
                }
            }
        );
    }

    public static async confirmOrder(options:
        {
            note?: string | undefined;
            orderId: string;
            orderItems: {
                sellPrice: number;
                quantity: number;
                productId: string;
            }[];
            amountReceived: number;
            change: number;
            paymentMethodId: string;
        }
    )
    {
        // check
        const existingOrder = await db.order.findFirst(
            {
                where:
                {
                    AND: [
                        { id: options.orderId },
                        { status: "PENDING" }
                    ]
                },
                select: { id: true, branchId: true }
            }
        );

        if (!existingOrder)
        {
            throw new HttpError(
                {
                    message: "ไม่พบรายการนี้",
                    statusCode: 404,
                    type: "fail"
                }
            );
        }

        const existingPaymentMethod = await db.paymentMethod.findUnique(
            {
                where: { id: options.paymentMethodId },
                select: { id: true }
            }
        );

        if (!existingPaymentMethod)
        {
            throw new HttpError(
                {
                    message: "ไม่พบประเภทการชำระเงินนี้",
                    statusCode: 404,
                    type: "fail"
                }
            );
        }

        const orderItems = options.orderItems;

        for (let i = 0; i < orderItems.length; i += 1)
        {
            const orderItem = orderItems[i];
            const stock = await db.stock.findFirst(
                {
                    where: { productId: orderItem.productId },
                    select:
                    {
                        quantity: true,
                        product: { select: { name: true } }
                    }
                }
            );

            if (!stock || stock.quantity < orderItem.quantity)
            {
                throw new HttpError(
                    {
                        statusCode: 400,
                        message: `สินค้า ${stock?.product.name} มีจำนวน ในStock ไม่เพียงพอ`,
                        type: "fail",
                    }
                );
            }
        }


        // create payment order
        const paymentOrder = await db.paymentOrder.create(
            {
                data:
                {
                    amountRecevied: options.amountReceived,
                    change: options.change,
                    paymentMethodId: options.paymentMethodId
                },
                select: { id: true }
            }
        );

        // calculate totalPrice
        const totalPrice = orderItems.reduce(
            (sum, orderItem) => sum + (orderItem.sellPrice * orderItem.quantity), 0);

        // confirm/update order
        await db.order.update(
            {
                where: { id: options.orderId },
                data:
                {
                    totalPrice: totalPrice,
                    paymentOrderId: paymentOrder.id,
                    status: "COMPLETED",
                },
                select: { id: true }
            }
        );

        // update stock and stock out history
        for (let i = 0; i < orderItems.length; i += 1)
        {
            const orderItem = orderItems[i];
            // update stock
            const stockUpdate = await db.stock.update(
                {
                    where:
                    {
                        productId_branchId:
                        {
                            productId: orderItem.productId,
                            branchId: existingOrder.branchId
                        }
                    },
                    data: { quantity: { decrement: orderItem.quantity } },
                    select: { id: true }
                }
            );

            // create stock out history
            await db.stockOutHistory.create(
                {
                    data:
                    {
                        quantity: orderItem.quantity,
                        type: "SALE",
                        stockId: stockUpdate.id
                    }
                }
            );
        }

        const createOrderItems = orderItems.map((orderItem) => (
            {
                orderId: options.orderId,
                sellPrice: orderItem.sellPrice,
                quantity: orderItem.quantity,
                productId: orderItem.productId
            }
        ));

        await db.orderItem.createMany({ data: createOrderItems });
    }

    public static async cancelOrder(id: string)
    {
        const existingOrder = await db.order.findFirst(
            {
                where:
                {
                    AND: [
                        { id: id },
                        { status: "PENDING" }
                    ]
                },
                select: { id: true, OrderItem: true },
            }
        );

        if (!existingOrder)
        {
            throw new HttpError(
                {
                    message: "ไม่พบรายการนี้",
                    statusCode: 404,
                    type: "fail"
                }
            );
        }

        await db.order.delete({ where: { id: existingOrder.id }, select: { id: true } });
    }

    public static async listOrdersByUserId(userId: string)
    {
        const orders = await db.order.findMany(
            {
                where: { userId: userId },
                include:
                {
                    paymentOrder:
                    {
                        select:
                        {
                            id: true,
                            amountRecevied: true,
                            change: true,
                            createdAt: true,
                            paymentMethod:
                            {
                                select:
                                {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    customer:
                    {
                        select:
                        {
                            id: true,
                            customerCode: true,
                            name: true,
                            phoneNumber: true,
                            address: true,
                            customerGroup:
                            {
                                select:
                                {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    branch:
                    {
                        select:
                        {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        );

        return orders;
    }
}