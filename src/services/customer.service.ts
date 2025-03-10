/** @format */

import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";
import { QeuryParams } from "../schemas/request.schema";

const db = kkuDB.kkuPrismaClient;

export abstract class CustomerService {
  public static async createCustomer(options: {
    name: string;
    customerCode: string;
    customerGroupId: string;
    phoneNumber: string;
    address?: string | undefined;
    branchId: string;
    userId: string;
  }) {
    const existingBranch = await db.branch.findUnique({
      where: { id: options.branchId },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบสาขา",
        type: "fail",
      });
    }

    const existingCustomerGroup = await db.customerGroup.findUnique({
      where: { id: options.customerGroupId },
      select: { id: true },
    });

    if (!existingCustomerGroup) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบกลุ่มลูกค้า",
        type: "fail",
      });
    }

    const existingCustomer = await db.customer.findFirst({
      where: {
        AND: [
          { customerCode: options.customerCode },
          { branchId: options.branchId },
        ],
      },
      select: { id: true },
    });

    if (existingCustomer) {
      throw new HttpError({
        statusCode: 400,
        message: `มีลูกค้ารหัส ${options.customerCode} อยู่ในสาขาแล้ว`,
        type: "fail",
      });
    }

    return await db.customer.create({
      data: options,
      select: { name: true },
    });
  }

  public static async listCustomersByBranchId(
    branchId: string,
    search?: {
      name?: string;
      customerGroupId?: string;
      customerCode?: string;
    }
  ) {
    const existingBranch = await db.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบสาขา",
        type: "fail",
      });
    }

    const whereConditions: any = {
      branchId: branchId,
    };

    if (search?.name) {
      whereConditions.name = {
        contains: search.name, // ใช้ contains เพื่อค้นหาชื่อที่มีคำค้น
      };
    }

    if (search?.customerGroupId) {
      whereConditions.customerGroupId = search.customerGroupId;
    }

    if (search?.customerCode) {
      whereConditions.customerCode = {
        contains: search.customerCode, // ใช้ contains หากต้องการค้นหาชิ้นส่วนของ customerCode
        // หรือใช้ startsWith หากต้องการให้ค้นหาเริ่มต้นด้วย customerCode
        // startsWith: search.customerCode,
      };
    }

    return await db.customer.findMany({
      where: whereConditions,
      include: {
        customerGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public static async listCustomersById(customerId: string) {
    return await db.customer.findUnique({
      where: { id: customerId },
      include: {
        customerGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  public static async listCustomersByBranchIdAndUserId(
    branchId: string,
    userId: string
  ) {
    const existingBranch = await db.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบสาขา",
        type: "fail",
      });
    }

    return await db.customer.findMany({
      where: {
        AND: [{ branchId: branchId }, { userId: userId }],
      },
      include: {
        customerGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  public static async updateCustomerById(
    id: string,
    options: {
      address?: string | undefined;
      name: string;
      customerGroupId: string;
      phoneNumber: string;
    }
  ) {
    const existingCustomer = await db.customer.findUnique({
      where: { id: id },
      select: { id: true },
    });

    if (!existingCustomer) {
      throw new HttpError({
        statusCode: 404,
        message: "ไม่พบลูกค้า",
        type: "fail",
      });
    }

    return await db.customer.update({
      where: { id: existingCustomer.id },
      data: options,
      select: { customerCode: true },
    });
  }
}
