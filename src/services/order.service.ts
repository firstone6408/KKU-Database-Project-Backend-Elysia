/** @format */

import { OrderStatus } from "../../prisma/generated/kku_client";
import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class OrderService {
  public static async createOrder(
    userId: string,

    options: {
      customerId: string;
      branchId: string;
      orderCode: string;
    }
  ) {
    // check branch
    const existingBranch = await db.branch.findUnique({
      where: { id: options.branchId },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new HttpError({
        message: "ไม่พบสาขาที่ระบุ",
        statusCode: 404,
        type: "fail",
      });
    }

    // check customer
    const existingCustomerInBranch = await db.customer.findFirst({
      where: {
        AND: [{ id: options.customerId }, { branchId: options.branchId }],
      },
      select: { id: true },
    });

    if (!existingCustomerInBranch) {
      throw new HttpError({
        message: "ลูกค้าไม่ได้อยู่ในสาขานี้",
        statusCode: 400,
        type: "fail",
      });
    }

    // chec order
    const existingOrder = await db.order.findUnique({
      where: {
        customerId_userId_branchId_orderCode: {
          customerId: options.customerId,
          userId: userId,
          branchId: options.branchId,
          orderCode: options.orderCode,
        },
      },
      select: { id: true },
    });

    if (existingOrder) {
      throw new HttpError({
        message: "รายการนี้ถูกสร้างแล้ว",
        statusCode: 400,
        type: "fail",
      });
    }

    // if not create
    await db.order.create({
      data: {
        customerId: options.customerId,
        orderCode: options.orderCode,
        userId: userId,
        branchId: options.branchId,
        status: "PENDING",
      },
    });
  }

  public static async confirmOrder(options: {
    note?: string;
    slipImage?: File;
    orderId: string;
    orderItems: {
      sellPrice: number;
      quantity: number;
      productId: string;
    }[];
    orderStatus: OrderStatus;
    paymentMethodId: string;
    amountReceived: number;
    change: number;
    credit: number;
    deposit: number;
    discount: number;
  }) {
    // check order
    const existingOrder = await db.order.findFirst({
      where: {
        AND: [{ id: options.orderId }, { status: "PENDING" }],
      },
      select: { id: true, branchId: true },
    });

    if (!existingOrder) {
      throw new HttpError({
        message: "ไม่พบรายการนี้",
        statusCode: 404,
        type: "fail",
      });
    }

    // check payment method
    const existingPaymentMethod = await db.paymentMethod.findUnique({
      where: { id: options.paymentMethodId },
      select: { id: true },
    });

    if (!existingPaymentMethod) {
      throw new HttpError({
        message: "ไม่พบประเภทการชำระเงินนี้",
        statusCode: 404,
        type: "fail",
      });
    }

    // validate and check quantity order items
    const orderItems = options.orderItems;
    // calculate totalPrice
    // const totalPrice = orderItems.reduce(
    //   (sum, orderItem) => sum + orderItem.sellPrice * orderItem.quantity,
    //   0
    // );
    let totalPrice = 0;

    for (let i = 0; i < orderItems.length; i += 1) {
      const orderItem = orderItems[i];
      const stock = await db.stock.findFirst({
        where: { productId: orderItem.productId },
        select: {
          quantity: true,
          productId: true,
          product: { select: { name: true } },
        },
      });

      if (!stock || stock.quantity < orderItem.quantity) {
        throw new HttpError({
          statusCode: 400,
          message: `บางสินค้า มีจำนวน ในStock ไม่เพียงพอ`,
          type: "fail",
        });
      }

      const productSaleBranch = await db.productSaleBranch.findUnique({
        where: {
          productId_branchId: {
            productId: stock.productId,
            branchId: existingOrder.branchId,
          },
        },
        select: { sellPrice: true },
      });

      if (!productSaleBranch) {
        throw new HttpError({
          statusCode: 400,
          message: `สินค้า ${stock?.product.name} ยังไม่ได้กำหนดราคา`,
          type: "fail",
        });
      }

      // calculate totalPrice
      totalPrice += orderItem.sellPrice * orderItem.quantity;
    }

    // check order status
    let paymentCondition: any = {
      orderId: options.orderId,
      paymentMethodId: options.paymentMethodId,
    };

    switch (options.orderStatus) {
      case "CREDIT_USED":
        if (options.credit <= 0) {
          throw new HttpError({
            message: "จำนวนวัน Credit ต้องมากกว่า 0",
            statusCode: 400,
            type: "fail",
          });
        }
        paymentCondition.credit = options.credit;
        break;
      case "DEPOSITED":
        if (options.deposit <= 0) {
          throw new HttpError({
            message: "จำนวนเงินมัดจำ ต้องมากกว่า 0",
            statusCode: 400,
            type: "fail",
          });
        }
        paymentCondition.deposit = options.deposit;
        break;
      case "COMPLETED":
        if (options.amountReceived <= 0) {
          throw new HttpError({
            message: "จำนวนเงินที่จ่าย ต้องมากกว่า 0",
            statusCode: 400,
            type: "fail",
          });
        }
        paymentCondition.amountReceived = options.amountReceived;
        paymentCondition.change = options.change;
        paymentCondition.discount = options.discount;
        break;

      default:
        throw new HttpError({
          message: "การชำระเงินผิดพลาด",
          statusCode: 400,
          type: "fail",
        });
    }

    // create payment order
    const paymentOrder = await db.paymentOrder.create({
      data: paymentCondition,
      select: { paymentMethodId: true },
    });

    if (!paymentOrder) {
      throw new HttpError({
        message: "ไม่พบวิธีการชำระเงิน",
        statusCode: 404,
        type: "fail",
      });
    }

    // confirm/update order
    await db.order.update({
      where: { id: options.orderId },
      data: {
        totalPrice: totalPrice,
        status: options.orderStatus,
      },
      select: { id: true },
    });

    // update stock and stock out history
    for (let i = 0; i < orderItems.length; i += 1) {
      const orderItem = orderItems[i];
      // update stock
      const stockUpdate = await db.stock.update({
        where: {
          productId_branchId: {
            productId: orderItem.productId,
            branchId: existingOrder.branchId,
          },
        },
        data: { quantity: { decrement: orderItem.quantity } },
        select: { id: true },
      });

      // create stock out history
      await db.stockOutHistory.create({
        data: {
          quantity: orderItem.quantity,
          type: "SALE",
          orderId: options.orderId,
          productId: orderItem.productId,
          stockId: stockUpdate.id,
          sellPrice: orderItem.sellPrice,
        },
      });
    }
  }

  public static async cancelOrder(id: string) {
    const existingOrder = await db.order.findFirst({
      where: {
        AND: [{ id: id }, { status: "PENDING" }],
      },
      select: { id: true },
    });

    if (!existingOrder) {
      throw new HttpError({
        message: "ไม่พบรายการนี้",
        statusCode: 404,
        type: "fail",
      });
    }

    await db.order.delete({
      where: { id: existingOrder.id },
      select: { id: true },
    });
  }

  public static async listOrdersByUserId(userId: string) {
    const orders = await db.order.findMany({
      where: { userId: userId },
      include: {
        customer: true,
        PaymentOrder: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
        StockOutHistory: {
          select: {
            quantity: true,
            type: true,
            note: true,
            sellPrice: true,
            createdAt: true,
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    categoryCode: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return orders;
  }
}
