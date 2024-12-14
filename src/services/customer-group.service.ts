import { kkuDB } from "../database/prisma/kku.prisma";
import { HttpError } from "../middlewares/error.middleware";

const db = kkuDB.kkuPrismaClient;

export abstract class CustomerGroupService
{

    public static async createCustomerGroup(options: { name: string })
    {
        const existingCustomerGroup = await db.customerGroup.findUnique(
            { where: { name: options.name } }
        );

        if (existingCustomerGroup)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: `ลูกค้ากลุ่ม ${options.name} ถูกสร้างแล้วในระบบ`,
                    type: "fail"
                }
            );
        }

        return await db.customerGroup.create({ data: options, select: { name: true } });
    }

    public static async updateCustomerGroup(id: number, options: { name: string })
    {
        const existingCustomerGroup = await db.customerGroup.findUnique(
            { where: { id: id }, select: { id: true } }
        )

        if (!existingCustomerGroup)
        {
            throw new HttpError(
                {
                    statusCode: 404,
                    message: `ไม่พบกลุ่มลูกค้านี้ในระบบ`,
                    type: "fail"
                }
            );
        }

        const customerGroup = await db.customerGroup.findUnique(
            { where: { name: options.name }, select: { name: true } }
        );

        if (customerGroup)
        {
            throw new HttpError(
                {
                    statusCode: 400,
                    message: `ลูกค้ากลุ่ม ${customerGroup.name} ถูกสร้างแล้วในระบบ`,
                    type: "fail"
                }
            );
        }

        return await db.customerGroup.update(
            {
                where: { id: id },
                data: options
            }
        );

    }

    public static async listCustomerGroup()
    {
        return await db.customerGroup.findMany();
    }
}