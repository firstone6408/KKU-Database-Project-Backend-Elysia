import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class StockService
{
    public static async createOrIncrementStock(
        userId: string,
        options:
            {
                branchId: string;
                productId: string;
                quantity: number;
                refCode: string;
                note?: string | undefined;
                costPrice: number;
            }
    )
    {

        // check branch
        const existingBranch = await db.branch.findUnique(
            {
                where: { id: options.branchId },
                select: { id: true }
            }
        );

        if (!existingBranch)
        {
            throw new HttpError(
                {
                    message: "ไม่พบสาขาที่ระบุ",
                    statusCode: 404,
                    type: "fail"
                }
            );
        }

        // check product
        const existingProduct = await db.product.findFirst(
            {
                where:
                {
                    AND: [
                        { id: options.productId },
                        { isDeleted: false }
                    ]
                },
                select: { id: true }
            }
        );

        if (!existingProduct)
        {
            throw new HttpError(
                {
                    message: "ไม่พบสินค้าที่ระบุ",
                    statusCode: 404,
                    type: "fail"
                }
            );
        }


        // create stock if dose not exists
        const existingStock = await db.stock.findFirst(
            {
                where:
                {
                    AND: [
                        { branchId: options.branchId },
                        { productId: options.productId }
                    ]
                },
                select: { id: true }
            }
        );

        const existingRefCodeInHistory = await db.stockInHistory.findUnique(
            {
                where: { refCode: options.refCode },
                select: { id: true }
            }
        )


        if (existingRefCodeInHistory)
        {
            throw new HttpError(
                {
                    message: "มีเลขที่อ้างอิงนี้ในระบบแล้ว",
                    statusCode: 400,
                    type: "fail"
                }
            );
        }

        let stockId: string;

        if (existingStock)
        {
            //console.log("12334235434563")
            stockId = (await db.stock.update(
                {
                    where: { id: existingStock?.id },
                    data:
                    {
                        quantity:
                        {
                            increment: options.quantity
                        }
                    },
                    select: { id: true }
                }
            )).id;
        }
        else
        {
            stockId = (await db.stock.create(
                {
                    data:
                    {
                        quantity: options.quantity,
                        productId: existingProduct.id,
                        branchId: existingBranch.id
                    },
                    select: { id: true }
                }
            )).id;
        }

        // add stock in history
        await db.stockInHistory.create(
            {
                data:
                {
                    refCode: options.refCode,
                    costPrice: options.costPrice,
                    quantity: options.quantity,
                    type: "ORDER",
                    userId: userId,
                    note: options.note,
                    stockId: stockId
                },
                select: { id: true }
            }
        );
    }

    public static async listStocksWithStockInHistoryByBranchId(branchId: string)
    {
        const stocks = await db.stockInHistory.findMany(
            {
                where:
                {
                    stock: { branchId: branchId }
                },
                include:
                {
                    stock:
                    {
                        include:
                        {
                            product:
                            {
                                include:
                                {
                                    category:
                                    {
                                        select:
                                        {
                                            id: true,
                                            categoryCode: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    user:
                    {
                        select:
                        {
                            id: true,
                            username: true,
                            email: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" }
            }
        );

        return stocks;
    }

    public static async listStocksWithStockOutHistoryByBranchId(branchId: string)
    {

        const stocks = await db.stockOutHistory.findMany(
            {
                where:
                {
                    stock: { branchId: branchId }
                },
                include:
                {
                    stock:
                    {
                        include:
                        {
                            product:
                            {
                                include:
                                {
                                    category:
                                    {
                                        select:
                                        {
                                            id: true,
                                            categoryCode: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: "desc" }
            }
        );

        return stocks;
    }

}