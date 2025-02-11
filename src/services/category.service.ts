/** @format */

import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class CategoryService {
  public static async createCategory(options: {
    categoryCode: string;
    name: string;
  }) {
    const exstingCategory = await db.category.findFirst({
      where: {
        OR: [
          { categoryCode: options.categoryCode },
          { name: options.name },
        ],
      },
      select: { id: true },
    });

    if (exstingCategory) {
      throw new HttpError({
        statusCode: 400,
        message: "รหัสหรือชื่อนี้ถูกตั้งแล้วในระบบ",
        type: "fail",
      });
    }

    return await db.category.create({ data: options });
  }

  public static async updateCategory(
    id: string,
    options: { categoryCode: string; name: string }
  ) {
    const exstingCategory = await db.category.findUnique({
      where: { id: id },
      select: { id: true },
    });

    if (!exstingCategory) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบหมวดหมู่นี้",
        type: "fail",
      });
    }

    const category = await db.category.findFirst({
      where: {
        AND: [
          { name: options.name },
          { categoryCode: options.categoryCode },
        ],
      },
      select: { name: true },
    });

    if (category) {
      throw new HttpError({
        statusCode: 400,
        message: `หมวดหมู่ ${category.name} ถูกสร้างแล้วในระบบ`,
        type: "fail",
      });
    }

    return await db.category.update({
      where: { id: id },
      data: options,
    });
  }

  public static async deleteCategory(id: string) {
    const exstingCategory = await db.category.findUnique({
      where: { id: id },
      select: { id: true },
    });

    if (!exstingCategory) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบหมวดหมู่นี้",
        type: "fail",
      });
    }

    return await db.category.delete({
      where: { id: id },
      select: { name: true },
    });
  }

  public static async listCategories() {
    return await db.category.findMany({ orderBy: { createdAt: "desc" } });
  }
}
