import { PrismaClient } from "@prisma/client";
import path from "path";

// Objeto para armazenar as instâncias já abertas (Singleton por banco)
const prismaInstances: Record<string, PrismaClient> = {};

export function getPrismaClient(kvkId: string) {
  const dbName = `kvk${kvkId}`;

  if (prismaInstances[dbName]) {
    return prismaInstances[dbName];
  }

  // AJUSTE AQUI: Adicionamos o caminho da pasta prisma antes do nome do arquivo
  // O prefixo 'file:./prisma/' garante que ele olhe na pasta correta a partir da raiz
  const dbUrl = `file:./prisma/${dbName}.db`; 
  
  console.log(`🔌 Conectando ao banco: ${dbUrl} para o KvK: ${kvkId}`);

  const newClient = new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
    log: ["error"], 
  });

  prismaInstances[dbName] = newClient;
  return newClient;
}