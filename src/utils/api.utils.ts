import { Context, StatusMap } from "elysia";
import { z } from "zod";
import { HttpError } from "../middlewares/error.middleware";

export type MaybePromise<T> = T | Promise<T>;

interface IResponse<T> {
  ok?: boolean;
  message?: string;
  payload: {
    data: T;
  };
  statusCode?: number | keyof StatusMap;
}

type TypeHandler<
  TQuery extends z.ZodTypeAny,
  TParams extends z.ZodTypeAny,
  TBody extends z.ZodTypeAny,
  T
> = (context: {
  query: z.infer<TQuery>;
  params: z.infer<TParams>;
  body: z.infer<TBody>;
}) => MaybePromise<IResponse<T>>;

class ApiHandler<
  RequestQuery extends z.ZodTypeAny,
  RequestParams extends z.ZodTypeAny,
  RequestBody extends z.ZodTypeAny
> {
  private request: {
    params?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    body?: z.ZodTypeAny;
  } = {};

  public query<Query extends z.ZodTypeAny>(request: Query) {
    this.request.query = request;
    return this as unknown as ApiHandler<
      Query,
      RequestParams,
      RequestBody
    >;
  }

  public body<Body extends z.ZodTypeAny>(request: Body) {
    this.request.body = request;
    return this as unknown as ApiHandler<
      RequestQuery,
      RequestParams,
      Body
    >;
  }

  public params<Params extends z.ZodTypeAny>(request: Params) {
    this.request.params = request;
    return this as unknown as ApiHandler<
      RequestQuery,
      Params,
      RequestBody
    >;
  }

  private zodThrowError(error: unknown) {
    if (error instanceof z.ZodError) {
      console.log(error.errors);
      const errorMessages = error.errors
        .map((err) => {
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

  public async withHandling<T>(
    context: Context,
    handler: TypeHandler<RequestQuery, RequestParams, RequestBody, T>
  ) {
    try {
      // const context = params1.context;

      let validatedParams = context.params;
      let validatedQuery = context.query;
      let validatedBody = context.body;

      // console.log(context.body);

      // console.log("ok");

      if (this.request.query) {
        //  console.log("123");
        try {
          validatedParams = this.request.query.parse(context.query);
        } catch (error) {
          this.zodThrowError(error);
        }
      }
      if (this.request.params) {
        // console.log("1234");
        try {
          validatedQuery = this.request.params.parse(context.params);
        } catch (error) {
          this.zodThrowError(error);
        }
      }
      if (this.request.body) {
        // console.log("1235");
        try {
          validatedBody = this.request.body.parse(context.body);
        } catch (error) {
          this.zodThrowError(error);
        }
      }

      const result = await handler({
        params: validatedParams,
        query: validatedQuery,
        body: validatedBody,
      });

      if (result.statusCode) {
        context.set.status = result.statusCode;
      } else {
        context.set.status = 200;
      }

      return {
        ok: result.ok ?? true,
        message: result.message ?? "Call API Success",
        payload: result.payload,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const apiHandler = new ApiHandler();
