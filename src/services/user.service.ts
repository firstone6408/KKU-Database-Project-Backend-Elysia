import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { generateToken } from "../utils/crypto.utils";

const db = kkuDB.kkuPrismaClient;

export class UserService {
  public static async create(data: {
    username: string;
    password: string;
    email: string;
    fullName: string;
    role: "ADMIN" | "CASHIER" | "MANAGER" | "STAFF";
    image?: string | undefined;
    phoneNumber?: string | undefined;
    branchId?: number | undefined;
  }) {
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });
    if (existingUser) {
      throw new HttpError({
        statusCode: 400,
        message: "Username หรือ Email นี้มีอยู่ในระบบแล้ว",
        type: "fail",
      });
    }
    const hashedPassword = await generateToken("");
    const newData = {
      username: data.username,
      password: hashedPassword,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      image: data.image ?? undefined,
      phoneNumber: data.phoneNumber ?? undefined,
      branchId: data.branchId ?? undefined,
    };
    return await db.user.create({ data: newData });
  }
}
