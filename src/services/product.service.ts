import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class ProductSerivce
{
    public static async getBySku(sku: string)
    {
        return await db.product.findUnique(
            {
                where: { sku: sku }
            }
        );
    }

    public static async create(options:
        {
            sku: string;
            name: string;
            description?: string;
            price: number;
            image?: string;
            categoryId?: number;
            branchId?: number;
            quantity?: number;
            note?: string
        },
        userId: number
    )
    {
        const existingProduct = await this.getBySku(options.sku);
        if (existingProduct)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "มีสินค้าชื่อนี้อยู่ในระบบแล้ว",
                    type: "fail"
                }
            );
        }

        // * เอา quantity, note ออก
        const { quantity, note, ...sanitizedOptions } = options;

        const product = await db.product.create(
            {
                data: sanitizedOptions
            }
        );

        // add stock
        const stock = await db.stock.create(
            {
                data:
                {
                    quantity: quantity ?? 0,
                    productId: product.id
                }
            }
        );

        // add stock history
        await db.stockHistory.create(
            {
                data:
                {
                    quantity: stock.quantity,
                    note: note && note.trim() !== "" ? note : "เพิ่มสินค้าเข้าระบบ",
                    type: "ADD",
                    stockId: stock.id,
                    userId: userId,
                    productId: product.id
                }
            }
        )

        return product;
    }

    public static async list()
    {
        return await db.product.findMany();
    }

    public static async listWithStock()
    {
        return await db.product.findMany(
            {
                include: { stock: true }
            }
        );
    }

    public static async getById(id: number)
    {
        return await db.product.findUnique(
            {
                where: { id: id }
            }
        );
    }

    public static async softRemove(id: number, sku: string)
    {
        const existingProduct = await this.getBySku(sku);
        if (!existingProduct)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: `ไม่พบสินค้า( SKU: ${sku} )ในระบบ`,
                    type: "fail"
                }
            );
        }

        return await db.product.update(
            {
                where:
                {
                    id: id,
                    sku: sku
                },
                data:
                {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            }
        )
    }

    public static async update(
        id: number,
        sku: string,
        options:
            {
                name: string;
                description?: string;
                price: number;
                image?: string;
                categoryId?: number;
            }
    )
    {
        const existingProduct = await this.getBySku(sku);
        if (!existingProduct)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: `ไม่พบสินค้า( SKU: ${sku} )ในระบบ`,
                    type: "fail"
                }
            );
        }

        return await db.product.update(
            {
                where:
                {
                    id: id,
                    sku: sku
                },
                data: options
            },
        )
    }
}