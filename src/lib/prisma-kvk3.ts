import { PrismaClient } from "@prisma/client";

import path from "path";

const prismaKvk3 = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), "prisma", "kvk3.db")}`,
    },
  },
  //log: ["query", "info", "warn", "error"],
});

export default prismaKvk3;