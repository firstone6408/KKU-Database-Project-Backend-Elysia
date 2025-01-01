import { UserRole } from "../../prisma/generated/kku_client";
import { kkuDB } from "../database/prisma/kku.prisma";
import { Jwt } from "../schemas/lib.schema";
import { HttpError } from "./error.middleware";

export const verifyAuth = async (token: string, user: JwtPayload, jwt: Jwt, request: Request) =>
{
  // const token = headers.get("Authorization");
  const _token = request.headers.get("Authorization");
  if (_token)
  {
    token = _token.split(" ")[1];
  }

  // console.log("Token:", token)

  if (!token || token === "")
  {
    throw new HttpError(
      {
        statusCode: 401,
        message: "ไม่สามารถยีนยันตัวตนได้",
        type: "fail"
      }
    )
  }

  // console.log("token:", token);

  const userInfo = await jwt.verify(token) as JwtPayload;
  if (!userInfo)
  {
    throw new HttpError(
      {
        statusCode: 401,
        message: "ไม่สามารถยีนยันตัวตนได้",
        type: "fail"
      }
    )
  }

  const existingUser = await kkuDB.kkuPrismaClient.user.findFirst(
    {
      where:
      {
        OR: [
          { username: userInfo.username },
          { email: userInfo.email }
        ]
      },
      select:
      {
        id: true,
        username: true,
        email: true,
        role: true,
        branchId: true
      }
    }
  )

  if (!existingUser)
  {
    throw new HttpError(
      {
        statusCode: 401,
        message: "ไม่สามารถยีนยันตัวตนได้",
        type: "fail"
      }
    )
  }

  // กำหนดแบบ object ไม่ได้ ต้องกำหนดแบบนี้
  user.id = existingUser.id;
  user.username = existingUser.username;
  user.email = existingUser.email;
  user.role = existingUser.role;
  user.branchId = existingUser.branchId

  //console.log(userInfo)
  //console.log(user)

  //console.log("verifyAuth")

};

export const verifyRole = async (roles: UserRole[], user: JwtPayload) =>
{
  const roleCheck = await kkuDB.kkuPrismaClient.user.findFirst(
    {
      where: { id: user.id },
      select: { role: true }
    }
  );

  //console.log(user)

  if (!roleCheck)
  {
    throw new HttpError(
      {
        statusCode: 401,
        message: "ไม่สามารถยีนยันตัวตนได้",
        type: "fail"
      }
    );
  }

  // ตรวจสอบว่าบทบาทของผู้ใช้ตรงกับบทบาทใดๆ ในอาร์เรย์ที่ส่งเข้ามา
  if (!roles.includes(roleCheck.role))
  {
    throw new HttpError({
      statusCode: "Unauthorized",
      message: "คุณไม่มีสิทธิ์เข้าถึง...",
      type: "fail"
    });
  }

  // console.log("verifyRole")

}
