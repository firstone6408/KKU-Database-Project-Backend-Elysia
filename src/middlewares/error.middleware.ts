export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public type: "error" | "fail" = "error"
  ) {
    super(message);
    this.name = "HttpError";
    this.type = type;
  }
}

export function globalErrorHandler(error: Error, set: any) {
  let statusCode = 500;
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

  return {
    message,
    type,
    ok: false,
    payload: null,
    traceStack:
      process.env.NODE_DEV === "development" && error instanceof Error
        ? error.stack
        : undefined,
  };
}
