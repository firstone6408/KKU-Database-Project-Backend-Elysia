/** @format */

import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class PaymentMethodService {
  public static async createPaymentMethod(options: { name: string }) {
    const existingPaymentMethod = await db.paymentMethod.findUnique({
      where: { name: options.name },
      select: { id: true },
    });

    if (existingPaymentMethod) {
      throw new HttpError({
        message: "มีชื่อนี้อยู่ในระบบแล้ว",
        statusCode: 400,
        type: "fail",
      });
    }

    const created = await db.paymentMethod.create({
      data: options,
      select: { name: true },
    });

    return created;
  }

  public static async updatePaymentMethod(
    id: string,
    options: { name: string }
  ) {
    const existingPaymentMethod = await db.paymentMethod.findUnique({
      where: { name: options.name },
      select: { id: true },
    });

    if (existingPaymentMethod) {
      throw new HttpError({
        message: "มีชื่อนี้อยู่ในระบบแล้ว",
        statusCode: 400,
        type: "fail",
      });
    }

    await db.paymentMethod.update({
      where: { id: id },
      data: { name: options.name },
      select: { id: true },
    });
  }

  public static async removePaymentMethod(id: string) {
    await db.paymentMethod
      .delete({ where: { id: id }, select: { id: true } })
      .catch((_) => {
        throw new HttpError({
          message: "ไม่สามารถลบได้",
          statusCode: 400,
          type: "fail",
        });
      });
  }

  public static async listPaymentMethods() {
    const paymentMethods = await db.paymentMethod.findMany();
    return paymentMethods;
  }
}
