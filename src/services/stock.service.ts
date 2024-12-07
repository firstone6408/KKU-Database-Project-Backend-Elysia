import { StockType } from "../../prisma/generated/kku_client";
import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class StockService
{
    public static async addStockToProduct(
        id: number,
        productId: number,
        options: {
            quantity: number,
            type: StockType
            note?: string
        },
        userId: number
    )
    {
        return await this.addOrRemoveStockToProduct(id, productId, options, userId, "ADD");
    }

    public static async removeStockToProduct(
        id: number,
        productId: number,
        options: {
            quantity: number,
            type: StockType
            note?: string
        },
        userId: number
    )
    {
        return await this.addOrRemoveStockToProduct(id, productId, options, userId, "REMOVE");
    }

    private static async addOrRemoveStockToProduct(
        id: number,
        productId: number,
        options: {
            quantity: number,
            type: StockType
            note?: string
        },
        userId: number,
        stockType: StockType
    )
    {
        const existingStockAndProduct = await db.stock.findFirst(
            {
                where:
                {
                    id: id,
                    productId: productId
                }
            }
        );

        if (!existingStockAndProduct)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "ไม่พบสินค้าใน Stock",
                    type: "fail"
                }
            );
        }

        let condition = {}
        let conditionNote: string = ""
        switch (stockType)
        {
            case "ADD":
                condition = { increment: options.quantity }
                conditionNote = "เพิ่มจำนวนสินค้า";
                break;
            case "REMOVE":
                const greaterThan = await db.stock.findFirst(
                    {
                        where:
                        {
                            AND: [
                                { id: id },
                                { quantity: { gte: options.quantity } }
                            ]
                        },
                    },
                )

                if (!greaterThan)
                {
                    throw new HttpError(
                        {
                            statusCode: 400,
                            message: "จำนวนที่ใส่มีมากกว่าจำนวนใน Stock",
                            type: "fail"
                        }
                    );
                }
                condition = { decrement: options.quantity }
                conditionNote = "ลดจำนวนสินค้า";
                break;
            default:
                throw new HttpError({
                    statusCode: 400,
                    message: `ประเภทสต็อก ${stockType} ไม่รองรับ`,
                    type: "fail",
                });
        }


        const stock = await db.stock.update(
            {
                where:
                {
                    id: id,
                    productId: productId
                },
                data: { quantity: condition }
            }
        );

        await db.stockHistory.create(
            {
                data:
                {
                    quantity: options.quantity,
                    type: options.type,
                    stockId: stock.id,
                    userId: userId,
                    note: options.note && options.note.trim() !== "" ? options.note : conditionNote
                }
            }
        );

        return stock;
    }

    public static async getStockWithHistoriesById(id: number)
    {
        return await db.stock.findFirst(
            {
                where: { id: id },
                include:
                {
                    stockHistories:
                    {
                        include:
                        {
                            user:
                            {
                                select:
                                {
                                    id: true,
                                    username: true,
                                    fullName: true,
                                    email: true,
                                }
                            }
                        }
                    }
                }
            }
        );
    }
}