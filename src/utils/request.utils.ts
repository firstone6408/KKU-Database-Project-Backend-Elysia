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
  // statusCode?: number | keyof StatusMap;
}

interface IUtilParams
{
  test123: string
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

export async function withRequestHandling<T>(
  fn: (...args: IUtilParams[]) => MaybePromise<IResponse<T>>,
  params1?: { options?: { responseFilterSchema?: z.ZodTypeAny } }
)
{
  try
  {
    const result = await fn();
    let validatedPayload = result.payload
    if (params1?.options)
    {
      const { responseFilterSchema } = params1.options

      //console.log(result)
      // if (set)
      // {
      //   set.status = result.statusCode ?? 200;
      // }

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
    }

    return {
      ok: result.ok ?? true,
      message: result.message ?? "Success",
      payload: validatedPayload
    }
  }
  catch (error)
  {
    throw error;
  }
}
