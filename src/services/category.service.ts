import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class CategoryService
{
    public static async create(options: { name: string })
    {
        const existingCategory = await db.category.findUnique(
            {
                where:
                {
                    name: options.name
                }
            }
        );

        if (existingCategory)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "ประเภทสินค้านี้อยู่ในระบบแล้ว",
                    type: "fail"
                }
            )
        }

        return await db.category.create(
            {
                data:
                {
                    name: options.name
                }
            }
        );
    }

    public static async list()
    {
        return await db.category.findMany();
    }

    public static async update(id: number, options: { name: string })
    {
        const existingCategory = await db.category.findUnique(
            {
                where:
                {
                    name: options.name
                }
            }
        );

        if (existingCategory)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "ประเภทสินค้านี้อยู่ในระบบแล้ว",
                    type: "fail"
                }
            );
        }

        return await db.category.update(
            {
                where:
                {
                    id: id
                },
                data:
                {
                    name: options.name
                }
            }
        );
    }

    public static async remove(id: number)
    {
        const existingCategory = await db.category.findUnique(
            {
                where:
                {
                    id: id
                }
            }
        );

        if (!existingCategory)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "ไม่พบประเภทสินค้าที่จะลบ",
                    type: "fail"
                }
            );
        }

        return await db.category.delete(
            {
                where:
                {
                    id: id
                }
            }
        )
    }
}