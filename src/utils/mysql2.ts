import mysql2 from "mysql2/promise";
import { database } from "../database/mysql2/connect.db";
import { z } from "zod";

interface IQueryResponse<T = unknown>
{
  queryResult: T;
}

type Handler<TQueryResult extends z.ZodTypeAny> = (context:
  {
    queryResult: z.infer<TQueryResult>;
  }
) => Promise<IQueryResponse>;

class DatabaseQueryExecutor<QueryResult extends z.ZodTypeAny>
{
  private readonly db: mysql2.Pool;
  private sqlCommand: string = "";
  private queryValues?: any;
  private queryResultSchema?: z.ZodTypeAny;

  constructor()
  {
    this.db = database.pool;
  }

  public query(sql: string)
  {
    this.sqlCommand = sql;
    return this;
  }

  public setResultSchema<Result extends z.ZodTypeAny>(result: Result)
  {
    this.queryResultSchema = result;
    return this as unknown as DatabaseQueryExecutor<Result>;
  }

  public values(values: any)
  {
    this.queryValues = values;
    return this;
  }

  public handler(handler: Handler<QueryResult>)
  {
    try
    {
      return async () =>
      {
        const [rows, fields] = await this.db.query(
          this.sqlCommand,
          this.queryValues
        );
        if (this.queryResultSchema)
        {
          const validatedRows = this.queryResultSchema.safeParse(rows);
          if (!validatedRows.success)
          {
            throw new Error("Validate Failed");
          }
          const result = await handler(
            {
              queryResult: validatedRows.data,
            }
          );
          return result;
        }
        throw new Error("Query result schema is not defined");
      };
    }
    catch (error)
    {
      throw Error(String(error));
    }
  }

  public async run(): Promise<IQueryResponse<z.infer<QueryResult>>>
  {
    try
    {
      const [rows] = await this.db.query(
        this.sqlCommand,
        this.queryValues
      );
      if (this.queryResultSchema)
      {
        const validatedRows = this.queryResultSchema.safeParse(rows);
        if (!validatedRows.success)
        {
          const formattedErrors = validatedRows.error.errors
            .map(
              (err) => `Path: ${err.path.join(".")[1]} - ${err.message}`
            )
            .join(", ");

          throw new Error(`Validation Failed: ${formattedErrors}`);
        }
        return { queryResult: validatedRows.data };
      }
      return { queryResult: "Query result schema is not defined" };
      // throw new Error("Query result schema is not defined");
    } catch (error)
    {
      throw new Error(String(error));
    }
  }
}

export const dbQueryExecutor = new DatabaseQueryExecutor();
