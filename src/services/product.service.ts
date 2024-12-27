import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class ProductService
{

    public static async createProduct(options:
        {
            description?: string | undefined;
            image?: string | undefined;
            name: string;
            productCode: string;
            categoryId: string;
        }
    )
    {

        // check product in db
        const existingProduct = await db.product.findFirst(
            {
                where:
                {
                    OR: [
                        { productCode: options.productCode },
                        { name: options.name }
                    ]
                },
                select: { id: true }
            }
        );

        if (existingProduct)
        {
            throw new HttpError(
                {
                    message: "มีรหัสหรือชื่อสินค้านี้อยู่ในระบบแล้ว",
                    statusCode: 400,
                    type: "fail"
                }
            );
        }

        // create product
        const productCreated = await db.product.create(
            {
                data: options,
                select: { productCode: true, name: true }
            }
        );

        return productCreated
    }

    public static async updateProduct(id: string, options:
        {
            description?: string | undefined;
            name?: string | undefined;
            image?: string | undefined;
            categoryId?: string | undefined;
        }
    )
    {
        // check product in db
        const existingProduct = await db.product.findFirst(
            {
                where:
                {
                    AND: [
                        { id: id },
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
                    message: `ไม่พบสินค้ารหัส ${id} ในระบบ`,
                    statusCode: 404,
                    type: "fail"
                }
            );
        }

        // check name
        if (options.name)
        {
            // check category in db
            const existingProductName = await db.product.findUnique(
                {
                    where: { name: options.name },
                    select: { id: true }
                }
            );

            if (existingProductName)
            {
                throw new HttpError(
                    {
                        message: `ชื่อสินค้า ${options.name} มีอยู่ในระบบแล้ว`,
                        statusCode: 400,
                        type: "fail"
                    }
                );
            }
        }

        // check categoryId
        if (options.categoryId)
        {

            // check category in db
            const existingCategory = await db.category.findUnique(
                {
                    where: { id: options.categoryId },
                    select: { id: true }
                }
            );

            if (!existingCategory)
            {
                throw new HttpError(
                    {
                        message: `ไม่พบหมวดหมู่สินค้ารหัส ${options.categoryId} ในระบบ`,
                        statusCode: 404,
                        type: "fail"
                    }
                );
            }
        }

        // update product
        const updated = await db.product.update(
            {
                where: { id: existingProduct.id },
                data: options,
                select: { productCode: true }
            }
        );

        return updated;


    }

    public static async softRemoveProduct(id: string)
    {
        const existingProduct = await db.product.findUnique(
            {
                where: { id: id },
                select: { id: true }
            }
        );

        if (!existingProduct)
        {
            throw new HttpError(
                {
                    message: `ไม่พบสินค้ารหัส ${id} ในระบบ`,
                    statusCode: 404,
                    type: "fail"
                }
            );
        }

        await db.product.update(
            {
                where: { id: id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            }
        );
    }

    public static async listProducts()
    {
        const products = await db.product.findMany(
            {
                where:
                {
                    isDeleted: false
                },
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
        );

        return products
    }

    public static async getProductById(id: string)
    {
        const product = await db.product.findFirst(
            {
                where:
                {
                    AND: [
                        { id: id },
                        { isDeleted: false }
                    ]
                },
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
        );

        return product;
    }
}