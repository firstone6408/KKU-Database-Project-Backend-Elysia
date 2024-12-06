import { StatusMap } from "elysia";

/**
 * `HttpError` เป็นคลาสที่ใช้เพื่อสร้างข้อผิดพลาดที่เกี่ยวข้องกับ HTTP ที่สามารถกำหนด `statusCode`, `message` และ `type` ได้
 * คลาสนี้จะช่วยในการสร้างข้อผิดพลาดที่สามารถจับและจัดการได้ในแอปพลิเคชันเพื่อจัดการกับ response ที่ไม่ปกติ
 *
 * @param statusCode - รหัสสถานะของ HTTP เช่น 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error) หรือค่าจาก `StatusMap`
 * @param message - ข้อความที่อธิบายข้อผิดพลาด
 * @param type - ประเภทของข้อผิดพลาด เช่น `"error"` หรือ `"fail"` (ค่าดีฟอลต์เป็น `"error"`)
 *
 * ### ตัวอย่างการใช้งาน:
 *
 * ```typescript
 * // การใช้ HttpError เพื่อสร้างข้อผิดพลาด HTTP 404
 * throw new HttpError({
 *   statusCode: 404,
 *   message: "User not found",
 *   type: "error",
 * });
 *
 * // การใช้ HttpError เพื่อสร้างข้อผิดพลาด HTTP 400
 * throw new HttpError({
 *   statusCode: 400,
 *   message: "Invalid input",
 *   type: "fail",
 * });
 * ```
 */
export class HttpError extends Error {
  public statusCode: number | keyof StatusMap;
  public type: "error" | "fail";
  constructor({
    statusCode,
    message,
    type = "error",
  }: {
    statusCode: number | keyof StatusMap;
    message: string;
    type?: "error" | "fail";
  }) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.type = type;
  }
}

export function globalErrorHandler(error: unknown, set: any) {
  let statusCode: number | keyof StatusMap = 500;
  let message = "";
  let type = "Error";

  if (error instanceof HttpError) {
    console.log("status", error.statusCode, error.message);
    statusCode = error.statusCode;
    type = error.type;
  }

  if (error instanceof Error) {
    console.error(`ERROR: ${error.name} ${error.message}`);
    message = error.message;
  } else {
    console.error("ERROR: An unknown error occurred");
    message = `An unknown error occurred, ${String(error)}`;
  }

  // console.error("error type", type);

  set.status = statusCode;

  console.log(process.env.BUN_DEV);

  return {
    message,
    type,
    ok: false,
    payload: null,
    traceStack:
      process.env.BUN_DEV === "development" && error instanceof Error
        ? error.stack
        : undefined,
  };
}
