import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.SECERT_KEY);

export const generateToken = async (payload: any) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  return token;
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return undefined;
  }
};

export const hashPassword = async (password: string) => {
  return await Bun.password.hash(password);
};

export const verifyPassword = async (
  password: string,
  hasdPassword: string
) => {
  return await Bun.password.verify(password, hasdPassword);
};
