import mysql, { ResultSetHeader } from "mysql2/promise";

import { readdirSync } from "fs";
import path from "path";

export const database = {
  pool: mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }),

  async createTableIfNotExist()
  {
    const modelsDir = path.join(__dirname, "models");
    const sqlFiles = readdirSync(modelsDir).filter((file) =>
      file.endsWith(".sql")
    );
    //console.log(sqlFiles.length);
    for (let i = 0; i < sqlFiles.length; i += 1)
    {
      const sqlPath = path.join(modelsDir, sqlFiles[i]);
      const sql = await Bun.file(sqlPath).text();
      //console.log(sqlPath);
      if (sql)
      {
        this.pool.query(sql);
        //console.log(sql);
      }
    }
  },

  async migrations()
  {
    const modelsDir = path.join(__dirname, "models/migrations");
    const sqlFiles = readdirSync(modelsDir).filter((file) =>
      file.endsWith(".sql")
    );

    //console.log(sqlFiles.length);
    for (let i = 0; i < sqlFiles.length; i += 1)
    {
      const sqlPath = path.join(modelsDir, sqlFiles[i]);
      const sql = await Bun.file(sqlPath).text();
      const migrateName = sqlFiles[i].split(".")[0];
      const [rows] = await this.pool.query(
        /*sql*/ `SELECT name FROM _migrations WHERE name = ?`,
        [migrateName]
      );

      interface Migrate
      {
        name: string;
      }

      const result: Migrate[] = rows as Migrate[];
      // console.log(result);
      // console.log(sql);

      if (sql && result.length <= 0)
      {
        await this.pool.query(sql);
        await this.pool.query(
          /*sql*/ `INSERT INTO _migrations(name) VALUES (?)`,
          [migrateName]
        );
        console.log(` - Database migrate ${migrateName} success`);
      }
    }
  },

  async testConnection(): Promise<void>
  {
    try
    {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      // console.log("[Database] Connection successful");
    } catch (error)
    {
      console.error("[Database] Connection failed:", error);
      throw error;
    }
  },

  async disconnect(): Promise<void>
  {
    try
    {
      await this.pool.end();
      console.log("[Database] Connection pool closed");
    } catch (error)
    {
      console.error("[Database] Failed to close connection pool:", error);
    }
  },
};
