import { StatusMap } from "elysia";
import { Set } from "../schemas/lib.schema";
import { z } from 'zod';
import { HttpError } from "../middlewares/error.middleware";

type MaybePromise<T> = T | Promise<T>;

interface IResponse<T>
{
  ok?: boolean;
  message?: string;
  payload: {
    data: T;
  };
  statusCode?: number | keyof StatusMap;
}

function handleZodError(error: unknown)
{
  if (error instanceof z.ZodError)
  {
    console.log(error.errors);
    const errorMessages = error.errors
      .map((err) =>
      {
        return `${err.path}: ${err.message}`;
      })
      .join(", ");
    throw new HttpError({
      statusCode: 400,
      message: errorMessages,
      type: "fail",
    });
  }
}

/**
 * ฟังก์ชันสำหรับจัดการการร้องขอและการตอบกลับ พร้อมกับตรวจสอบข้อมูลใน payload
 * 
 * @param params1 พารามิเตอร์ประกอบด้วย set สำหรับการตั้งค่าต่างๆ และ responseFilterSchema สำหรับการตรวจสอบข้อมูล
 * @param fn ฟังก์ชันที่ทำงานจริงและส่งคืนผลลัพธ์เป็น IResponse
 * @returns ข้อมูลที่ผ่านการตรวจสอบแล้วพร้อมกับสถานะการตอบกลับ
 * 
 * @example
 * ตัวอย่างการใช้งาน
 * 
 * 1. กรณีการใช้ฟังก์ชันกับ responseFilterSchema
 * ```typescript
 * app.get("/", async ({ set }) => {
 *   return withRequestHandling(
 *     {
 *       set,
 *       responseFilterSchema: z.object(
 *          {
 *            data: z.array(z.object(
 *              {
 *                username: z.string(),
 *                password: z.string(),
 *              }
 *            )),
 *          }
 *      ),
 *     }, async () =>
 *     {
 *       const result = await UserService.list();
 *       return { payload: { data: result } };
 *     });
 * });
 * ```
 * - ในกรณีนี้ข้อมูลใน payload จะถูกตรวจสอบโดย schema `responseFilterSchema`
 * - ถ้าผ่านการตรวจสอบ ข้อมูลจะถูกส่งกลับพร้อมสถานะ 200
 * - ถ้าไม่ผ่านการตรวจสอบ จะมีข้อผิดพลาดที่ส่งกลับไปพร้อมกับสถานะ 400
 * 
 * 2. กรณีการไม่ใช้ responseFilterSchema
 * ```typescript
 * app.get("/no-filter", async ({ set }) => {
 *   return withRequestHandling({ set }, async () =>
 *    {
 *       const result = await UserService.list();
 *       return { payload: { data: result } };
 *    }
 *   );
 * });
 * ```
 * - ในกรณีนี้ไม่มีการตรวจสอบข้อมูลใน payload
 * - ข้อมูลจะถูกส่งกลับโดยไม่มีการตรวจสอบ
 */
export async function withRequestHandling<T>(
  params1: { set: Set, responseFilterSchema?: z.ZodTypeAny },
  fn: (...args: any[]) => MaybePromise<IResponse<T>>
)
{
  try
  {
    const { set, responseFilterSchema } = params1
    const result = await fn();
    //console.log(result)
    set.status = result.statusCode ?? 200;

    let validatedPayload = result.payload
    // filter
    if (responseFilterSchema)
    {
      try
      {
        const parsed = responseFilterSchema.parse(validatedPayload);
        validatedPayload = parsed;
      }
      catch (error)
      {
        handleZodError(error);
      }
    }

    return {
      ok: result.ok ?? true,
      message: result.message ?? "Call api success",
      payload: validatedPayload
    }
  }
  catch (error)
  {
    throw error;
  }
}
