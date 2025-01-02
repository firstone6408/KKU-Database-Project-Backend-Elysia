import { filePathConfig } from "../config/file-path.config";
import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { ImageFileHandler } from "../utils/file.utils";

const db = kkuDB.kkuPrismaClient;

const standardResponse = {
    category:
    {
        select:
        {
            id: true,
            categoryCode: true,
            name: true
        }
    },
    ProductSaleBranch:
    {
        select: { sellPrice: true }
    }
}

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
            image?: File | undefined;
            categoryId?: string | undefined;
            productCode: string;
            isDeleted: boolean;
        }
    )
    {
        // check product in db
        const existingProduct = await db.product.findFirst(
            {
                where: { id: id },
                select: { id: true, image: true, isDeleted: true }
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

        // // check name
        // if (options.name)
        // {
        //     // check category in db
        //     const existingProductName = await db.product.findUnique(
        //         {
        //             where: { name: options.name },
        //             select: { id: true }
        //         }
        //     );

        //     if (existingProductName)
        //     {
        //         throw new HttpError(
        //             {
        //                 message: `ชื่อสินค้า ${options.name} มีอยู่ในระบบแล้ว`,
        //                 statusCode: 400,
        //                 type: "fail"
        //             }
        //         );
        //     }
        // }

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

        const { image: imageUpload, isDeleted, ...restData } = options;

        let data: any = { ...restData };

        if (isDeleted && !existingProduct.isDeleted)
        {
            //console.log("กำลังลบ")
            this.softRemoveProduct(id);
        }
        if (!isDeleted && existingProduct.isDeleted)
        {
            //console.log("กำลังคืน")
            this.cancelsoftRemoveProduct(id);
        }

        if (imageUpload)
        {
            let pathImage: string;
            const imageHandler = new ImageFileHandler(filePathConfig.PRODUCT_IMAGE);
            if (existingProduct.image)
            {
                pathImage = await imageHandler.updateFile(existingProduct.image, imageUpload);
            }
            else
            {
                pathImage = await imageHandler.saveFile(imageUpload);
            }
            data.image = pathImage;
        }



        // update product
        const updated = await db.product.update(
            {
                where: { id: existingProduct.id },
                data: data,
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

    public static async cancelsoftRemoveProduct(id: string)
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
                    isDeleted: false
                }
            }
        );
    }

    public static async listProducts()
    {
        const { category } = standardResponse;
        const products = await db.product.findMany(
            {
                include: { category: category },
                orderBy: { createdAt: "desc" }

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
                include: standardResponse
            }
        );

        return product;
    }

    public static async listProductsByBranchId(branchId: string)
    {
        const products = await db.productSaleBranch.findMany(
            {
                where:
                {
                    AND: [
                        { branchId: branchId },
                        {
                            product:
                            {
                                isDeleted: false
                            }
                        }
                    ]
                },
                select:
                {
                    sellPrice: true,
                    createdAt: true,
                    updatedAt: true,
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
                            },
                        }
                    },
                },
                orderBy: { createdAt: "desc" }
            }
        );

        return products;
    }
}