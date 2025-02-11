import { ProductUnit } from "../../prisma/generated/kku_client";
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
            model?: string;
            size?: string;
            description?: string;
            image?: File;
            barcode: string;
            productCode: string;
            name: string;
            categoryId: string;
            unit: ProductUnit;
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
                        { name: options.name },
                        { barcode: options.barcode }
                    ]
                },
                select: { id: true }
            }
        );

        if (existingProduct)
        {
            throw new HttpError(
                {
                    message: "มีรหัส หรือ บาร์โค้ด หรือ ชื่อสินค้านี้อยู่ในระบบแล้ว",
                    statusCode: 400,
                    type: "fail"
                }
            );
        }

        const { image, ...restData } = options;

        const data: any = { ...restData };

        if (image)
        {
            const pathImage = await new ImageFileHandler(filePathConfig.PRODUCT_IMAGE)
                .saveFile(image);
            data.image = pathImage;
        }
        // create product
        const productCreated = await db.product.create(
            {
                data: data,
                select: { productCode: true, name: true }
            }
        );

        return productCreated
    }

    public static async updateProduct(id: string, options:
        {
            description?: string;
            model?: string;
            size?: string;
            image?: File;
            name: string;
            barcode: string;
            productCode: string;
            categoryId: string;
            isDeleted: boolean;
            unit: ProductUnit;
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

        if (isDeleted !== undefined)
        {
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
                            Stock:
                            {
                                where:
                                {
                                    branchId: branchId
                                },
                                select:
                                {
                                    id: true,
                                    quantity: true,
                                    createdAt: true,
                                    updatedAt: true
                                }
                            }
                        }
                    },
                },
                orderBy: { createdAt: "desc" }
            }
        );

        return products;
    }

    public static async listUnstockedProductsByBranchId(branchId: string)
    {
        const unstockedProducts = await db.product.findMany(
            {
                where:
                {
                    AND: [
                        { isDeleted: false },
                        {
                            NOT:
                            {
                                ProductSaleBranch:
                                {
                                    some: { branchId: branchId }
                                }
                            }
                        }
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

        return unstockedProducts;
    }
}