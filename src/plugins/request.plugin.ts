import { StatusMap } from "elysia";
import { ElysiaCookie } from "elysia/dist/cookies";
import { HTTPHeaders } from "elysia/dist/types";

type MaybePromise<T> = T | Promise<T>;

interface IResponse<T> {
  ok?: boolean;
  message?: string;
  payload: {
    data: T;
  };
  statusCode?: number | keyof StatusMap;
}

export async function withRequestHandling<T>(
  params1: {
    set: {
      headers: HTTPHeaders;
      status?: number | keyof StatusMap;
      redirect?: string;
      cookie?: Record<string, ElysiaCookie>;
    }
  },
  fn: (...args: any[]) => MaybePromise<IResponse<T>>
) {
  try {
    const { set } = params1
    const result = await fn();
    //console.log(result)
    set.status = result.statusCode ?? 200;
    return {
      ok: result.ok ?? true,
      message: result.message ?? "Call api success",
      payload: result.payload
    }
  } catch (error) {
    throw error;
  }
}
