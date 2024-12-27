/** @format */

import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { Jwt } from "../schemas/lib.schema";
import { comparePassword } from "../utils/crypto.utils";

const db = kkuDB.kkuPrismaClient;

export abstract class AuthService
{
  public static async login(
    options: {
      username: string;
      password: string;
    },
    jwt: Jwt
  )
  {
    const userExsting = await db.user.findUnique({
      where: { username: options.username },
      select: {
        password: true,
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        branchId: true,
        profileImage: true,
        status: true,
      },
    });

    if (!userExsting)
    {
      throw new HttpError({
        statusCode: 400,
        message: "ไม่พบผู้ใช้บัญชีนี้",
        type: "fail",
      });
    }

    const isMatch = await comparePassword(
      options.password,
      userExsting.password
    );

    if (!isMatch)
    {
      throw new HttpError({
        statusCode: "Forbidden",
        message: "รหัสผ่านไม่ถูกต้อง",
        type: "fail",
      });
    }

    const userPayload = {
      id: userExsting.id,
      username: userExsting.username,
      email: userExsting.email,
      role: userExsting.role,
      ...(userExsting.branchId !== null && {
        branchId: userExsting.branchId,
      }),
    };

    const token = await jwt.sign(userPayload);

    // update last login
    await db.user.update({
      where: { id: userExsting.id },
      data: { lastLogin: new Date() },
    });

    const { password, username, ...userWithOutPassword } = userExsting;

    return { token, user: userWithOutPassword };
  }

  public static async loginWithProvider(
    options: { email: string },
    jwt: Jwt
  )
  {
    const userExsting = await db.user.findUnique({
      where: { email: options.email },
      select: {
        password: true,
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        branchId: true,
        profileImage: true,
        status: true,
      },
    });

    if (!userExsting)
    {
      throw new HttpError({
        statusCode: 400,
        message: "ไม่พบผู้ใช้บัญชีนี้",
        type: "fail",
      });
    }

    const userPayload = {
      id: userExsting.id,
      username: userExsting.username,
      email: userExsting.email,
      role: userExsting.role,
      ...(userExsting.branchId !== null && {
        branchId: userExsting.branchId,
      }),
    };

    const token = await jwt.sign(userPayload);

    // update last login
    await db.user.update({
      where: { id: userExsting.id },
      data: { lastLogin: new Date() },
    });

    const { password, username, ...userWithOutPassword } = userExsting;

    return { token, user: userWithOutPassword };
  }

  public static async currentUser(user: JwtPayload)
  {
    return await db.user.findFirst({
      where: {
        OR: [{ username: user.username }, { email: user.email }],
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        branchId: true,
      },
    });
  }
}
