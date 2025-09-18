import { PrismaClient } from "@prisma/client";

import path from "path";

const prismaKvk2 = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), "prisma", "kvk2.db")}`,
    },
  },
  //log: ["query", "info", "warn", "error"],
});

export default prismaKvk2;