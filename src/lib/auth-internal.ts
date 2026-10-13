import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

/**
 * Çerez eklentisi olmayan iç kullanım örneği.
 * Seed script'i ve admin panelinden hoca oluşturma gibi
 * istek bağlamı dışında / oturum açılmaması gereken yerlerde kullanılır.
 */
export const authInternal = betterAuth({
  appName: "Ritim Stüdyo",
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
