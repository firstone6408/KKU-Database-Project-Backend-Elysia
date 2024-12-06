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

class ApiRequestHandler<
  RequestQuery extends z.ZodTypeAny,
  RequestParams extends z.ZodTypeAny,
  RequestBody extends z.ZodTypeAny
> {
  private requestSchema: {
    params?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    body?: z.ZodTypeAny;
  } = {};
  private filter?: z.ZodTypeAny;

  public query<Query extends z.ZodTypeAny>(requestSchema: Query) {
    this.requestSchema.query = requestSchema;
    return this as unknown as ApiRequestHandler<
      Query,
      RequestParams,
      RequestBody
    >;
  }

  public body<Body extends z.ZodTypeAny>(requestSchema: Body) {
    this.requestSchema.body = requestSchema;
    return this as unknown as ApiRequestHandler<
      RequestQuery,
      RequestParams,
      Body
    >;
  }

  public params<Params extends z.ZodTypeAny>(requestSchema: Params) {
    this.requestSchema.params = requestSchema;
    return this as unknown as ApiRequestHandler<
      RequestQuery,
      Params,
      RequestBody
    >;
  }

  public applyFilter<Filter extends z.ZodTypeAny>(filter: Filter) {
    this.filter = filter;
    return this;
  }

  private handleZodError(error: unknown) {
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

  public async validateAndProcessRequest<T>(
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

      if (this.requestSchema.query) {
        //  console.log("123");
        try {
          validatedParams = this.requestSchema.query.parse(context.query);
        } catch (error) {
          this.handleZodError(error);
        }
      }
      if (this.requestSchema.params) {
        // console.log("1234");
        try {
          validatedQuery = this.requestSchema.params.parse(context.params);
        } catch (error) {
          this.handleZodError(error);
        }
      }
      if (this.requestSchema.body) {
        // console.log("1235");
        try {
          validatedBody = this.requestSchema.body.parse(context.body);
        } catch (error) {
          this.handleZodError(error);
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

      let payload = result.payload;
      // filter payload
      if (this.filter) {
        try {
          payload = this.filter.parse(payload);
        } catch (error) {
          this.handleZodError(error);
        }
      }

      return {
        ok: result.ok ?? true,
        message: result.message ?? "Call API Success",
        payload: payload,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const apiRequestHandler = new ApiRequestHandler();
