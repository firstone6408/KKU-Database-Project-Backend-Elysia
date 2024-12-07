import { StatusMap, ValidationError } from "elysia";
import { Set } from "../schemas/lib.schema";

export class HttpError extends Error
{
  public statusCode: number | keyof StatusMap;
  public type: "error" | "fail";
  constructor(
    {
      statusCode,
      message,
      type = "error",
    }:
      {
        statusCode: number | keyof StatusMap;
        message: string;
        type?: "error" | "fail";
      }
  )
  {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.type = type;
  }
}

export function globalErrorHandler(error: unknown, set: Set)
{
  let statusCode: number | keyof StatusMap = 500;
  let message = "";
  let type = "Error";

  if (error instanceof HttpError)
  {
    console.error("status", error.statusCode, error.message);
    statusCode = error.statusCode;
    type = error.type;
    message = error.message;
  }
  else if (error instanceof ValidationError)
  {
    const errorMessages = error.all.map((item) =>
    {
      return item.summary ? `${item.path.split("/")[1]}: ${item.message}` : item.summary
    }).join(", ")
    // console.log(errorMessages)
    console.error("status", error.status, errorMessages);
    message = errorMessages;
    statusCode = error.status;
    type = "fail";
  }
  else if (error instanceof Error)
  {
    console.error(`ERROR: ${error.name} ${error.message}`);
    message = error.message;
  }
  else
  {
    console.error("ERROR: An unknown error occurred:", String(error));
    message = `An unknown error occurred, ${String(error)}`;
  }

  // console.error("error type", type);
  // console.error('ok')

  set.status = statusCode;

  // console.log(process.env.BUN_DEV);

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
