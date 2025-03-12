/** @format */

import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
) {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
}
