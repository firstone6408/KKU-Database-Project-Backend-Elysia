import { StatusMap } from "elysia";

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
