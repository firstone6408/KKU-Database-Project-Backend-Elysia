import { PrismaClient } from "../../../prisma/generated/kku_client";

export const kkuDB = {
  kkuPrismaClient: new PrismaClient(),

  async testConnection()
  {
    try
    {
      await this.kkuPrismaClient.$connect();
      // console.log("[Database] Connection successful");
    }
    catch (error)
    {
      console.error("[KKU Database] Connection failed:", error);
      throw error;
    }
  },

  async disconnect(): Promise<void>
  {
    try
    {
      await this.kkuPrismaClient.$disconnect();
      console.log("[KKU Database] Connection pool closed");
    }
    catch (error)
    {
      console.error(
        "[KKU Database] Failed to close connection pool:",
        error
      );
    }
  },
};
