/** @format */

import { UserRole, UserStatus } from "../../prisma/generated/kku_client";
import { filePathConfig } from "../config/file-path.config";
import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { hashPassword } from "../utils/crypto.utils";
import { ImageFileHandler } from "../utils/file.utils";

const db = kkuDB.kkuPrismaClient;

const standardResponse = {
  id: true,
  username: true,
  email: true,
  name: true,
  profileImage: true,
  phoneNumber: true,
  role: true,
  status: true,
  lastLogin: true,
  branch: true,
};

export abstract class UserService {
  public static async createUser(options: {
    profileImage?: File | undefined;
    phoneNumber?: string | undefined;
    name: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    branchId: string;
  }) {
    const userExisting = await db.user.findFirst({
      where: {
        OR: [{ username: options.username }, { email: options.email }],
      },
      select: { id: true },
    });

    if (userExisting) {
      throw new HttpError({
        statusCode: 400,
        message: "มีบัญชีนี้อยู่ในระบบแล้ว",
        type: "fail",
      });
    }

    const hasdedPassword = await hashPassword(options.password);

    options.password = hasdedPassword;

    const { profileImage, ...restData } = options;

    let data: any = { ...restData };

    if (profileImage) {
      const pathImage = await new ImageFileHandler(
        filePathConfig.USER_PROFILE
      ).uploadFile(profileImage);
      data.profileImage = pathImage;
    }

    return await db.user.create({ data: data, select: { id: true } });
  }

  public static async updateUserByUserId(
    userId: string,
    options: {
      password?: string;
      profileImage?: File;
      name: string;
      username: string;
      email: string;
      phoneNumber: string;
      role?: UserRole;
      status?: UserStatus;
    }
  ) {
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, profileImage: true },
    });

    if (!existingUser) {
      throw new HttpError({
        message: "ไม่พบผู้ใช้",
        type: "fail",
        statusCode: 404,
      });
    }

    // console.log("options", options);

    const { password, profileImage, ...data } = options;

    let updatedData: any = { ...data };

    if (password) {
      const hasdedPassword = await hashPassword(password);
      updatedData = { password: hasdedPassword, ...updatedData };
    }

    if (profileImage) {
      const imageFileHandler = await new ImageFileHandler(
        filePathConfig.USER_PROFILE
      );

      let filepath: string;
      if (existingUser.profileImage) {
        filepath = await imageFileHandler.replaceFile(
          existingUser.profileImage,
          profileImage
        );
      } else {
        filepath = await imageFileHandler.uploadFile(profileImage);
      }

      updatedData = { profileImage: filepath, ...updatedData };
    }

    // console.log("updatedData", updatedData);

    await db.user.update({
      where: { id: userId },
      data: updatedData,
      select: { id: true },
    });
  }

  public static async getById(id: string) {
    return await db.user.findUnique({
      where: { id: id },
      select: standardResponse,
    });
  }

  public static async list() {
    return await db.user.findMany({
      select: standardResponse,
      orderBy: { createdAt: "desc" },
    });
  }

  public static async listUsersByBranchId(branchId: string) {
    return await db.user.findMany({
      where: { branchId: branchId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        profileImage: true,
        phoneNumber: true,
        role: true,
        status: true,
        lastLogin: true,
        branch: true,
      },
      // orderBy: { createdAt: "desc" },
    });
  }
}
