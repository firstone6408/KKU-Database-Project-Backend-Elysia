import { UserRole } from "../../prisma/generated/kku_client";
import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { hashPassword } from "../utils/crypto.utils";

const db = kkuDB.kkuPrismaClient;


export abstract class UserService
{
    public static async createUser(
        options:
            {
                profileImage?: string | undefined;
                phoneNumber?: string | undefined;
                branchId?: number | undefined;
                name: string;
                username: string;
                email: string;
                password: string;
                role: UserRole;
            }
    )
    {
        const userExisting = await db.user.findFirst(
            {
                where:
                {
                    OR: [
                        { username: options.username },
                        { email: options.email }
                    ]
                },
                select: { id: true }
            }
        );

        if (userExisting)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: "มีบัญชีนี้อยู่ในระบบแล้ว",
                    type: "fail"
                }
            );
        }

        const hasdedPassword = await hashPassword(options.password);

        options.password = hasdedPassword;

        return await db.user.create({ data: options, select: { id: true } });
    }

    public static async getById(id: number)
    {
        return await db.user.findUnique(
            {
                where: { id: id },
                select:
                {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    profileImage: true,
                    phoneNumber: true,
                    role: true,
                    status: true,
                    lastLogin: true,
                    branch: true
                }
            }
        );
    }

    public static async list()
    {
        return await db.user.findMany(
            {
                select:
                {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    profileImage: true,
                    phoneNumber: true,
                    role: true,
                    status: true,
                    lastLogin: true,
                    branch: true
                }
            }
        );
    }
}