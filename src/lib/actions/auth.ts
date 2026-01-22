'use server';

import bcrypt from "bcrypt";
import { getPrismaClient } from "@/lib/prisma";
const kvkId = process.env.KVK_DB_VERSION || "1";

const prisma = getPrismaClient(kvkId);


export async function signUp(email: string, password: string, name?: string) {
  try {
    if (!email || !password) {
      return { error: "Email e senha são obrigatórios" };
    }

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return { error: "Este e-mail já está em uso" };
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        // Se este for o primeiro usuário, você pode querer setar como ADMIN automaticamente
        role: "USER" 
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Erro no cadastro:", err);
    return { error: "Ocorreu um erro inesperado ao criar a conta" };
  }
}