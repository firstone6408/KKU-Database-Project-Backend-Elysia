/** @format */

import { OrderStatus, OrderType } from "../../prisma/generated/kku_client";
import { filePathConfig } from "../config/file-path.config";
import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { ImageFileHandler } from "../utils/file.utils";

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
    //  orderStatus: OrderStatus;
    orderType: OrderType;
    paymentMethodId: string;
    amountRecevied?: number;
    change?: number;
    credit?: number;
    deposit?: number;
    discount?: number;
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

    // check delivery
    const delivery = await db.delivery.findUnique({
      where: { orderId: options.orderId },
      select: { fee: true },
    });
    if (delivery) {
      totalPrice += delivery.fee;
    }

    if (options.discount) {
      totalPrice -= options.discount;
    }

    // check order status
    let paymentCondition: any = {
      orderId: options.orderId,
      paymentMethodId: options.paymentMethodId,
      discount: options.discount,
    };
    let orderStatus: OrderStatus = "UNPAID";

    switch (options.orderType) {
      case "CREDIT_USED":
        if (options.credit && options.credit <= 0) {
          throw new HttpError({
            message: "จำนวนวัน Credit ต้องมากกว่า 0",
            statusCode: 400,
            type: "fail",
          });
        }
        paymentCondition.credit = options.credit;
        break;
      case "DEPOSITED":
        if (options.deposit && options.deposit <= 0) {
          throw new HttpError({
            message: "จำนวนเงินมัดจำ ต้องมากกว่า 0",
            statusCode: 400,
            type: "fail",
          });
        }
        paymentCondition.deposit = options.deposit;
        break;
      case "DEPOSITED_CREDIT_USED":
        if (options.credit && options.credit <= 0) {
          throw new HttpError({
            message: "จำนวนวัน Credit ต้องมากกว่า 0",
            statusCode: 400,
            type: "fail",
          });
        }
        if (options.deposit && options.deposit <= 0) {
          throw new HttpError({
            message: "จำนวนเงินมัดจำ ต้องมากกว่า 0",
            statusCode: 400,
            type: "fail",
          });
        }
        paymentCondition.credit = options.credit;
        paymentCondition.deposit = options.deposit;
        break;
      case "FULL_PAYMENT":
        if (options.amountRecevied && options.amountRecevied <= 0) {
          throw new HttpError({
            message: "จำนวนเงินที่จ่าย ต้องมากกว่า 0",
            statusCode: 400,
            type: "fail",
          });
        }
        paymentCondition.amountRecevied = options.amountRecevied;
        paymentCondition.change = options.change;

        orderStatus = "COMPLETED";
        paymentCondition.paidAt = new Date();
        break;

      default:
        throw new HttpError({
          message: "การชำระเงินผิดพลาด",
          statusCode: 400,
          type: "fail",
        });
    }

    // create payment order
    await db.paymentOrder.create({
      data: paymentCondition,
      select: { paymentMethodId: true },
    });

    if (options.slipImage) {
      const pathFile = await new ImageFileHandler(
        filePathConfig.SLIP_IMAGE
      ).uploadFile(options.slipImage);
      await db.paymentOrderSlip.create({
        data: {
          paymentOrderId: options.orderId,
          imageUrl: pathFile,
        },
        select: { id: true },
      });
    }

    // confirm/update order
    await db.order.update({
      where: { id: options.orderId },
      data: {
        totalPrice: totalPrice,
        status: orderStatus,
        type: options.orderType,
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

  public static async payOrder(
    orderId: string,
    options: {
      slipImage: File;
    }
  ) {
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        type: true,
        PaymentOrder: true,
        totalPrice: true,
      },
    });

    if (!existingOrder) {
      throw new HttpError({
        message: "ไม่พบบิลนี้",
        statusCode: 404,
        type: "fail",
      });
    }

    switch (existingOrder.status) {
      case "COMPLETED":
        throw new HttpError({
          message: "บิลนี้ถูกชำระเงินแล้ว",
          statusCode: 400,
          type: "fail",
        });
      default:
        break;
    }

    let amountRecevied: number;

    const paymentOrder = existingOrder.PaymentOrder;

    if (!paymentOrder || !existingOrder.totalPrice) {
      throw new HttpError({
        message: "ไม่พบข้อมูลการชำระเงิน",
        statusCode: 404,
        type: "fail",
      });
    }

    switch (existingOrder.type) {
      case "DEPOSITED":
      case "DEPOSITED_CREDIT_USED":
        if (!paymentOrder.deposit) {
          throw new HttpError({
            message: "ไม่พบเงินมัดจำ",
            statusCode: 404,
            type: "fail",
          });
        }
        amountRecevied = existingOrder.totalPrice - paymentOrder.deposit;
        break;
      case "CREDIT_USED":
        amountRecevied = existingOrder.totalPrice;
        break;
      default:
        throw new HttpError({
          message: "เกิดข้อผิดพลาดบางอย่าง",
          statusCode: 400,
          type: "fail",
        });
    }

    await db.paymentOrder.update({
      where: { orderId: orderId },
      data: {
        amountRecevied: amountRecevied,
        paidAt: new Date(),
      },
      select: { orderId: true },
    });

    await db.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
      select: { id: true },
    });

    const filepath = await new ImageFileHandler(
      filePathConfig.SLIP_IMAGE
    ).uploadFile(options.slipImage);

    await db.paymentOrderSlip.create({
      data: {
        paymentOrderId: orderId,
        imageUrl: filepath,
      },
      select: { paymentOrderId: true },
    });
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

  public static async listOrdersByBranchIdAndUserId(
    branchId: string,
    userId: string,
    options?: {
      status?: OrderStatus;
    }
  ) {
    // check branch
    const existingBranch = await db.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new HttpError({
        message: "ไม่พบสาขาที่ระบุ",
        statusCode: 404,
        type: "fail",
      });
    }

    const whereConditions: any = {
      branchId: branchId,
      userId: userId,
    };

    if (options) {
      if (options.status) {
        whereConditions.status = options.status;
      }
    }

    const orders = await db.order.findMany({
      where: whereConditions,
      include: {
        StockOutHistory: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
        customer: {
          include: {
            customerGroup: true,
          },
        },
        PaymentOrder: {
          include: {
            paymentMethod: true,
            PaymentOrderSlip: true,
          },
        },
        Delivery: true,
      },
    });

    return orders;
  }

  public static async listOrdersByBranchId(
    branchId: string,
    query?: {
      orderCode?: string;
      orderType?: string;
      orderStatus?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    // check branch
    const existingBranch = await db.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new HttpError({
        message: "ไม่พบสาขาที่ระบุ",
        statusCode: 404,
        type: "fail",
      });
    }

    const whereConditions: any = {
      branchId: branchId,
    };

    if (query?.orderCode) {
      whereConditions.orderCode = {
        contains: query.orderCode,
      };
    }

    if (query?.orderType) {
      whereConditions.type = query.orderType;
    }

    if (query?.orderStatus) {
      whereConditions.status = query.orderStatus;
    }

    if (query?.startDate && query?.endDate) {
      whereConditions.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    } else if (query?.startDate) {
      whereConditions.createdAt = {
        gte: new Date(query.startDate),
      };
    } else if (query?.endDate) {
      whereConditions.createdAt = {
        lte: new Date(query.endDate),
      };
    }

    const orders = await db.order.findMany({
      where: whereConditions,
      include: {
        StockOutHistory: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
        customer: {
          include: {
            customerGroup: true,
          },
        },
        PaymentOrder: {
          include: {
            paymentMethod: true,
            PaymentOrderSlip: true,
          },
        },
        Delivery: true,
      },
      orderBy: [{ createdAt: "desc" }, { status: "desc" }],
    });

    return orders;
  }

  public static async listOrdersByBranchIdAndOrderId(
    branchId: string,
    orderId: string
  ) {
    // check branch
    const existingBranch = await db.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new HttpError({
        message: "ไม่พบสาขาที่ระบุ",
        statusCode: 404,
        type: "fail",
      });
    }

    // check order id
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!existingOrder) {
      throw new HttpError({
        message: "ไม่พบบิลนี้",
        statusCode: 404,
        type: "fail",
      });
    }

    const order = await db.order.findUnique({
      where: {
        branchId: branchId,
        id: orderId,
      },
      include: {
        StockOutHistory: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
        customer: {
          include: {
            customerGroup: true,
          },
        },
        PaymentOrder: {
          include: {
            paymentMethod: true,
            PaymentOrderSlip: true,
          },
        },
        Delivery: true,
      },
    });

    return order;
  }
}
