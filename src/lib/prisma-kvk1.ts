import { PrismaClient } from "@prisma/client";

import path from "path";

const prismaKvk1 = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), "prisma", "kvk1.db")}`,
    },
  },
  //log: ["query", "info", "warn", "error"],
});

export default prismaKvk1;