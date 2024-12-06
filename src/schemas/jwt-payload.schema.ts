import Elysia from "elysia";

declare global {
  namespace Context {
    interface Request {
      user?: {
        username: string;
      };
    }
  }
}
