/** @format */

import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class StockService {
  public static async createOrIncrementStock(
    userId: string,
    options: {
      note?: string;
      branchId: string;
      refCode: string;
      distributor: string;
      stockInItems: {
        productId: string;
        costPrice: number;
        quantity: number;
      }[];
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

    const stockInItems = options.stockInItems;

    if (stockInItems.length <= 0) {
      throw new HttpError({
        message: "ไม่มีรายละเอียดสินค้า",
        statusCode: 400,
        type: "fail",
      });
    }

    // calculate total price
    const totalPrice = stockInItems.reduce(
      (sum, orderItem) => sum + orderItem.costPrice * orderItem.quantity,
      0
    );

    const p = await db.product.findFirst({ select: { id: true } });

    if (!p) {
      throw new HttpError({
        message: "ไม่สามารถเพิ่ม Stock ได้เนื่องจากไม่มีสินค้าในระบบ",
        statusCode: 404,
      });
    }

    // create stock in history
    const stockInHistoryId = (
      await db.stockInHistory.create({
        data: {
          refCode: options.refCode,
          distributor: options.distributor,
          totalPrice: totalPrice,
          note: options.note,
          type: "ORDER",
          userId: userId,
          branchId: options.branchId,
        },
        select: { id: true },
      })
    ).id;

    const newStockInItems: {
      productId: string;
      quantity: number;
      costPrice: number;
      stockId: string;
      stockInHistoryId: string;
    }[] = [];

    for (let i = 0; i < stockInItems.length; i += 1) {
      const item = stockInItems[i];

      // check product
      const existingProduct = await db.product.findUnique({
        where: { id: item.productId },
        select: { id: true },
      });

      if (!existingProduct) {
        throw new HttpError({
          message: "ไม่พบสินค้าในระบบ",
          statusCode: 400,
          type: "fail",
        });
      }

      // create or add stock
      const existingStock = await db.stock.findUnique({
        where: {
          productId_branchId: {
            productId: item.productId,
            branchId: options.branchId,
          },
        },
        select: { id: true },
      });

      let stockId: string;

      if (existingStock) {
        stockId = (
          await db.stock.update({
            where: {
              productId_branchId: {
                productId: item.productId,
                branchId: options.branchId,
              },
            },
            data: { quantity: { increment: item.quantity } },
            select: { id: true },
          })
        ).id;
      } else {
        stockId = (
          await db.stock.create({
            data: {
              productId: item.productId,
              branchId: options.branchId,
              quantity: item.quantity,
            },
            select: { id: true },
          })
        ).id;
      }

      newStockInItems.push({
        productId: item.productId,
        quantity: item.quantity,
        costPrice: item.costPrice,
        stockId: stockId,
        stockInHistoryId: stockInHistoryId,
      });
    }

    // create stock in history items
    await db.stockInItem.createMany({ data: newStockInItems });

    //return newStockInItems;
  }

  // public static async listStocksWithStockOutHistoryByBranchId(branchId: string)
  // {

  //     const stocks = await db.stockOutHistory.findMany(
  //         {
  //             where:
  //             {
  //                 stock: { branchId: branchId }
  //             },
  //             include:
  //             {
  //                 stock:
  //                 {
  //                     include:
  //                     {
  //                         product:
  //                         {
  //                             include:
  //                             {
  //                                 category:
  //                                 {
  //                                     select:
  //                                     {
  //                                         id: true,
  //                                         categoryCode: true,
  //                                         name: true
  //                                     }
  //                                 }
  //                             }
  //                         }
  //                     }
  //                 }
  //             },
  //             orderBy: { createdAt: "desc" }
  //         }
  //     );

  //     return stocks;
  // }
}
