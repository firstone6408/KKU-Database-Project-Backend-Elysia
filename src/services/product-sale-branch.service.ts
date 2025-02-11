/** @format */

import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class ProductSaleBranchService {
  public static async createOrUpdateProductSaleBranch(options: {
    productId: string;
    branchId: string;
    sellPrice: number;
  }) {
    const existingProduct = await db.product.findUnique({
      where: { id: options.productId },
      select: { id: true },
    });

    if (!existingProduct) {
      throw new HttpError({
        message: "ไม่พบสินค้าที่ระบุ",
        statusCode: 404,
        type: "fail",
      });
    }

    const existingBranch = await db.branch.findUnique({
      where: { id: options.branchId },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new HttpError({
        message: "ไม่พบสินค้าที่ระบุ",
        statusCode: 404,
        type: "fail",
      });
    }

    const existingProductSaleBranch =
      await db.productSaleBranch.findUnique({
        where: {
          productId_branchId: {
            productId: options.productId,
            branchId: options.branchId,
          },
        },
        select: { branchId: true },
      });

    let result;

    if (existingProductSaleBranch) {
      result = await db.productSaleBranch.update({
        where: {
          productId_branchId: {
            productId: options.productId,
            branchId: options.branchId,
          },
        },
        data: { sellPrice: options.sellPrice },
        select: {
          sellPrice: true,
          product: {
            select: { name: true },
          },
        },
      });
    } else {
      result = await db.productSaleBranch.create({
        data: {
          productId: options.productId,
          branchId: options.branchId,
          sellPrice: options.sellPrice,
        },
        select: {
          sellPrice: true,
          product: {
            select: { name: true },
          },
        },
      });
    }

    return result;
  }
}
