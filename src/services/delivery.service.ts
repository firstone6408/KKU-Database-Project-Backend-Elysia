/** @format */

import {
  DeliveryStatus,
  DeliveryType,
} from "../../prisma/generated/kku_client";
import { filePathConfig } from "../config/file-path.config";
import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { ImageFileHandler } from "../utils/file.utils";

const db = kkuDB.kkuPrismaClient;

export abstract class DeliveryService {
  public static async createDelivery(
    orderId: string,
    options: {
      trackNumber: string;
      distance: number;
      address?: string;
      type: DeliveryType;
      lng: number;
      lat: number;
      note?: string;
      sendDate: Date;
      fee: number;
    }
  ) {
    const existingOrder = await db.order.findFirst({
      where: {
        id: orderId,
      },
      select: { id: true, customerId: true, status: true },
    });

    if (!existingOrder) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบบิลนี้",
        type: "fail",
      });
    }

    if (existingOrder.status === "COMPLETED") {
      throw new HttpError({
        statusCode: 401,
        message: "บิลนี้จบการขายแล้ว",
        type: "fail",
      });
    }

    const existingDelivery = await db.delivery.findUnique({
      where: {
        orderId: orderId,
      },
      select: {
        status: true,
      },
    });

    if (existingDelivery) {
      throw new HttpError({
        statusCode: 401,
        message: "บิลนี้ได้มีการบันทึกจัดทำขนส่งแล้ว",
        type: "fail",
      });
    }

    let cusAddress: string;
    if (!options.address) {
      const existingCustomer = await db.customer.findFirst({
        where: {
          id: existingOrder.customerId,
        },
        select: {
          address: true,
        },
      });
      if (!existingCustomer) {
        throw new HttpError({
          statusCode: 404,
          message: "ไม่พบรายชื่อลูกค้า",
          type: "fail",
        });
      }
      if (!existingCustomer.address) {
        throw new HttpError({
          statusCode: 404,
          message: "ไม่พบที่อยู่เดิมของลูกค้า",
          type: "fail",
        });
      }
      cusAddress = existingCustomer.address;
    } else {
      cusAddress = options.address;
    }

    await db.delivery.create({
      data: {
        orderId: orderId,
        address: cusAddress,
        ...options,
      },
    });
  }

  public static async listDeliveriesByBranchId(branchId: string) {
    const deliveries = await db.delivery.findMany({
      where: {
        order: {
          branchId: branchId,
        },
      },
      include: {
        DeliveryDriver: {
          select: {
            assignedAt: true,
            deliveryId: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                name: true,
                phoneNumber: true,
              },
            },
          },
        },
        order: {
          include: {
            PaymentOrder: true,
          },
        },
      },
      orderBy: {
        status: "asc",
      },
    });

    return deliveries;
  }

  public static async addDrivers(orderId: string, userIds: string[]) {
    if (userIds.length <= 0) {
      throw new HttpError({
        statusCode: 404,
        message: "ต้องมีคนขนส่งอย่างน้อย 1 คน",
        type: "fail",
      });
    }

    const existingDelivery = await db.delivery.findUnique({
      where: { orderId },
      select: { orderId: true, status: true },
    });

    if (!existingDelivery) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบข้อมูลการขนส่ง",
        type: "fail",
      });
    }

    if (existingDelivery.status !== "PENDING") {
      throw new HttpError({
        statusCode: 404,
        message: "บิลนี้ถูกจัดส่งแล้ว",
        type: "fail",
      });
    }

    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds,
        },
        role: "TRANSPORTER",
      },
      select: {
        id: true,
      },
    });

    const validUserIds = users.map((user) => user.id);
    const invalidUserIds = userIds.filter(
      (id) => !validUserIds.includes(id)
    );

    if (invalidUserIds.length > 0) {
      throw new HttpError({
        statusCode: 404,
        message: `ไม่พบผู้ใช้: ${invalidUserIds.join(", ")}`,
        type: "fail",
      });
    }

    await db.deliveryDriver.createMany({
      data: validUserIds.map((userId) => ({
        deliveryId: orderId,
        userId,
      })),
    });
  }

  public static async deliveryDone(
    orderId: string,
    options: { slipImage?: File }
  ) {
    const delivery = await db.delivery.findUnique({
      where: { orderId },
      select: { status: true },
    });

    if (!delivery) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบข้อมูลการขนส่ง",
        type: "fail",
      });
    }

    if (delivery.status === "DELIVERED") {
      throw new HttpError({
        statusCode: 400,
        message: "ขนส่งนี้เสร็จสิ้นแล้ว ไม่สามารถเปลี่ยนสถานะได้",
        type: "fail",
      });
    }

    const order = await db.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        type: true,
        totalPrice: true,
        status: true,
      },
    });

    if (!order) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบบิลนี้",
        type: "fail",
      });
    }

    if (order.type === "DEPOSITED" && order.status !== "COMPLETED") {
      if (!options.slipImage) {
        throw new HttpError({
          statusCode: 400,
          message: "ไม่มีหลักฐานการชำระเงิน",
          type: "fail",
        });
      }
      const paymentOrder = await db.paymentOrder.findUnique({
        where: { orderId: orderId },
        select: { deposit: true, amountRecevied: true },
      });

      if (!paymentOrder) {
        throw new HttpError({
          statusCode: 404,
          message: "ไม่พบการชำระเงินบิลนี้",
          type: "fail",
        });
      }

      let amountRecevied: number;

      if (
        order.type === "DEPOSITED" &&
        order.totalPrice &&
        paymentOrder.deposit
      ) {
        amountRecevied = order.totalPrice - paymentOrder.deposit;
      } else {
        throw new HttpError({
          message: "เกิดข้อผิดพลาดบางอย่าง...",
          statusCode: 400,
          type: "fail",
        });
      }

      const afterPayment = await db.paymentOrder.update({
        where: { orderId: orderId },
        data: {
          amountRecevied: amountRecevied,
          paidAt: new Date(),
        },
        select: { orderId: true, amountRecevied: true },
      });

      const pathImage = await new ImageFileHandler(
        filePathConfig.SLIP_IMAGE
      ).uploadFile(options.slipImage);

      await db.paymentOrderSlip.create({
        data: {
          paymentOrderId: orderId,
          imageUrl: pathImage,
        },
        select: { id: true },
      });

      if (
        afterPayment.amountRecevied &&
        afterPayment.amountRecevied + paymentOrder.deposit ===
          order.totalPrice
      ) {
        await db.order.update({
          where: { id: orderId },
          data: { status: "COMPLETED" },
          select: { id: true },
        });
      }

      //   console.log("Have payment...");
    }

    await db.delivery.update({
      where: { orderId: orderId },
      data: {
        status: "DELIVERED",
        completedAt: new Date(),
      },
      select: { orderId: true },
    });
  }

  public static async listActiveDrivers(branchId: string) {
    const drivers = await db.deliveryDriver.findMany({
      where: {
        delivery: {
          status: { not: "DELIVERED" },
        },
        user: {
          branchId: branchId,
          role: "TRANSPORTER",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            phoneNumber: true,
          },
        },
        delivery: {
          select: {
            trackNumber: true,
            status: true,
          },
        },
      },
    });

    return drivers;
  }

  public static async listAvailableDrivers(branchId: string) {
    const drivers = await db.user.findMany({
      where: {
        branchId: branchId,
        role: "TRANSPORTER",
        DeliveryDriver: {
          none: {
            delivery: {
              status: { not: "DELIVERED" },
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phoneNumber: true,
      },
    });

    return drivers;
  }
}
