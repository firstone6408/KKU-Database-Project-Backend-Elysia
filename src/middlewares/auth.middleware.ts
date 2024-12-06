import { kkuDB } from "../database/prisma/kku.prisma";
import { Jwt } from "../schemas/lib.schema";
import { HttpError } from "./error.middleware";

export const verifyAuth = async (headers: Headers, user: JwtPayload, jwt: Jwt) =>
{
  const token = headers.get("Authorization");
  if (!token)
  {
    throw new HttpError(
      {
        statusCode: 401,
        message: "ไม่สามารถยีนยันตัวตนได้",
        type: "fail"
      }
    )
  }
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
};
