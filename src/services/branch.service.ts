import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class BranchService
{
    public static async createBranch(option: { name: string })
    {
        const existingBranch = await db.branch.findUnique(
            {
                where:
                {
                    name: option.name
                }
            }
        )

        if (existingBranch)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "สาขานี้ถูกสร้างแล้ว",
                    type: "fail"
                }
            )
        }

        return await db.branch.create(
            {
                data:
                {
                    name: option.name
                }
            }
        )
    }

    public static async list()
    {
        return await db.branch.findMany();
    }

    public static async update(id: number, options: { name: string })
    {
        const existingBranch = await db.branch.findUnique(
            {
                where:
                {
                    name: options.name
                }
            }
        )

        if (existingBranch)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "มีชื่อสาขานี้อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น",
                    type: "fail"
                }
            )
        }

        const branch = await db.branch.update(
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
        )
        return branch
    }
}