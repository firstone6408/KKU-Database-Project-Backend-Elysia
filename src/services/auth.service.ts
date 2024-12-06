import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { Jwt } from "../schemas/lib.schema";
import { comparePassword } from '../utils/crypto.utils'

const db = kkuDB.kkuPrismaClient;

export abstract class AuthService {
    public static async login(options: {
        username: string,
        password: string
    }, jwt: Jwt) {
        const existingUser = await db.user.findUnique({
            where: {
                username: options.username
            },
        })
        if (!existingUser) {
            throw new HttpError({
                statusCode: 400,
                message: "บัญชีนี้ถูกสร้างแล้ว",
                type: "fail"
            })
        }

        // compare password
        const isCorrect = await comparePassword(options.password, existingUser.password);
        if (!isCorrect) {
            throw new HttpError({
                statusCode: 'Forbidden',
                message: "รหัสผ่านไม่ถูกต้อง",
                type: "fail"
            })
        }

        const userPayload = {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role,
            ...(existingUser.branchId !== null && { branchId: existingUser.branchId })
        }

        const token = await jwt.sign(userPayload);

        return token


    }

    public static async currentUser(user: JwtPayload) {
        return await db.user.findFirst({
            where: {
                OR: [
                    { username: user.username },
                    { email: user.email }
                ]
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                branchId: true
            }
        })
    }
}