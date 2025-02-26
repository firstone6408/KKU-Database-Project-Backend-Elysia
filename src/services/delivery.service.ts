/** @format */

import {
  DeliveryStatus,
  DeliveryType,
} from "../../prisma/generated/kku_client";
import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

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
        message: "บิลนี้ได้มีการจัดทำขนส่งแล้ว",
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

  public static async updateStatusDelivery(
    orderId: string,
    status: DeliveryStatus
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

    await db.delivery.update({
      where: { orderId },
      data: {
        status,
        completedAt: status === "DELIVERED" ? new Date() : undefined,
      },
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
