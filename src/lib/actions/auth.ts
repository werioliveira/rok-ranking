'use server';

import bcrypt from "bcrypt";
import { getPrismaClient } from "@/lib/prisma";
const kvkId = process.env.KVK_DB_VERSION || "1";

const prisma = getPrismaClient(kvkId);

export async function signUp(email: string, password: string, name?: string) {
  if (!email || !password) {
    throw new Error("Email e senha são obrigatórios");
  }

  const exists = await prisma.user.findUnique({
    where: { email },
  });

  if (exists) {
    throw new Error("Email já cadastrado");
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
    },
  });
}
