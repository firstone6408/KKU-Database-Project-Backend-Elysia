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
            return await db.branch.findMany();
        }
        return await db.branch.findMany({ where: { id: userJwt.branchId ?? "" } });
    }

    public static async getBranchById(id: string)
    {
        return await db.branch.findMany({ where: { id: id } });
    }

    public static async updateBranch(id: string, options:
        {
            name: string;
            phoneNumber: string;
            address: string;
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

        const branch = await db.branch.findUnique(
            {
                where: { name: options.name },
                select: { name: true }
            }
        );


        if (branch)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: `สาขาชื่อ ${branch.name} ถูกสร้างแล้วในระบบ`,
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
}