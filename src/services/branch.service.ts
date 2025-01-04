import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class BranchService
{

    public static async createBranch(options:
        {
            name: string;
            phoneNumber: string;
            branchCode: string;
            address: string;
        }
    )
    {
        const existingBranch = await db.branch.findFirst(
            {
                where:
                {
                    OR: [
                        { branchCode: options.branchCode },
                        { name: options.name }
                    ]
                },
                select: { id: true }
            }
        );

        if (existingBranch)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "รหัสสาขา หรือ ชื่อสาขานี้ถูกตั้งไปแล้ว",
                    type: "fail"
                }
            );
        }

        return await db.branch.create({ data: options, select: { id: true } })
    }

    public static async listBranches(userJwt: JwtPayload)
    {
        if (userJwt.role === "ADMIN")
        {
            return await db.branch.findMany({ orderBy: { createdAt: "desc" } });
        }
        return await db.branch.findMany({ where: { id: userJwt.branchId ?? "" }, orderBy: { createdAt: "desc" } });
    }

    public static async getBranchById(id: string)
    {
        return await db.branch.findUnique({ where: { id: id } });
    }

    public static async updateBranch(id: string, options:
        {
            name: string;
            phoneNumber: string;
            address: string;
            branchCode: string;
        }
    )
    {
        const existingBranch = await db.branch.findUnique(
            {
                where: { id: id },
                select:
                {
                    id: true,
                    branchCode: true
                }
            });

        if (!existingBranch)
        {
            throw new HttpError(
                {
                    statusCode: 404,
                    message: "ไม่พบสาขา",
                    type: "fail"
                }
            );
        }

        const branch = await db.branch.findFirst(
            {
                where:
                {
                    OR: [
                        { name: options.name },
                        { branchCode: options.branchCode }
                    ]
                },
                select: { branchCode: true, name: true }
            }
        );


        if (branch && (branch.name !== options.name && branch.branchCode !== options.branchCode))
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: `สาขาชื่อ ${branch.name} หรือรหัส ${branch.branchCode} ถูกสร้างแล้วในระบบ`,
                    type: "fail"
                }
            );
        }

        await db.branch.update(
            {
                where: { id: existingBranch.id, branchCode: existingBranch.branchCode },
                data: options
            }
        );
    }

    public static async removeBranchById(id: string)
    {
        return await db.branch.delete({ where: { id: id } });
    }

}