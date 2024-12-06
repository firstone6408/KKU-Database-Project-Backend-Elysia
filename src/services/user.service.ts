import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { hashPassword } from "../utils/crypto.utils";
import { Jwt } from "../schemas/lib.schema";

const db = kkuDB.kkuPrismaClient;

export class UserService
{
  public static async create(options:
    {
      username: string;
      password: string;
      email: string;
      fullName: string;
      role: "ADMIN" | "CASHIER" | "MANAGER" | "STAFF";
      image?: string | undefined;
      phoneNumber?: string | undefined;
      branchId?: number | undefined;
    }
  )
  {
    const existingUser = await db.user.findFirst(
      {
        where:
        {
          OR:
            [
              {
                username: options.username
              },
              {
                email: options.email
              }
            ],
        },
      }
    );

    if (existingUser)
    {
      throw new HttpError(
        {
          statusCode: 400,
          message: "Username หรือ Email นี้มีอยู่ในระบบแล้ว",
          type: "fail",
        }
      );
    }

    const hashedPassword = await hashPassword(options.password);

    const newData =
    {
      username: options.username,
      password: hashedPassword,
      email: options.email,
      fullName: options.fullName,
      role: options.role,
      image: options.image ?? undefined,
      phoneNumber: options.phoneNumber ?? undefined,
      branchId: options.branchId ?? undefined,
    };

    return await db.user.create({ data: newData });
  }

  public static async list()
  {
    return await db.user.findMany()
  }

  public static async getById(id: number)
  {
    return await db.user.findUnique(
      {
        where:
        {
          id: id
        }
      }
    )
  }
}
