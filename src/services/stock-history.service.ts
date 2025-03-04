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
        canceledByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return stockInHistories;
  }

  public static async cancelStockInHistory(
    branchId: string,
    stockInHistoryId: string,
    userId: string,
    cancelNote: string
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

    // check stock in
    const existingStockIn = await db.stockInHistory.findUnique({
      where: {
        id: stockInHistoryId,
        branchId: branchId,
        isCanceled: false,
      },
      select: {
        id: true,
        StockInItem: true,
      },
    });

    if (!existingStockIn) {
      throw new HttpError({
        message: "ไม่พบบิลนำเข้า",
        statusCode: 404,
        type: "fail",
      });
    }

    const stockInItems = existingStockIn.StockInItem;

    for (let i = 0; i < stockInItems.length; i += 1) {
      const item = stockInItems[i];
      await db.stock.update({
        where: {
          productId_branchId: {
            productId: item.productId,
            branchId: branchId,
          },
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
        select: {
          id: true,
        },
      });
    }

    await db.stockInHistory.update({
      where: {
        id: stockInHistoryId,
      },
      data: {
        isCanceled: true,
        canceledBy: userId,
        cancelNote: cancelNote,
        canceledAt: new Date(),
      },
      select: { id: true },
    });
  }
}
