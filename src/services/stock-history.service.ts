/** @format */

import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class StockHistoryService {
  public static async listStockInHistories(branchId: string) {
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

    const stockInHistories = await db.stockInHistory.findMany({
      where: { branchId: branchId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
        StockInItem: {
          include: {
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

    return stockInHistories;
  }
}
