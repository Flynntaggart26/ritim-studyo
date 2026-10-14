import { createRequire } from "node:module";
import { PrismaClient } from "@prisma/client";

const require = createRequire(`${process.cwd()}/package.json`);
const { PrismaClient: SqlitePrismaClient } = require("./node_modules/.prisma/sqlite-client");

const sqliteUrl = process.env.SQLITE_DATABASE_URL;
const postgresUrl = process.env.DATABASE_URL;

if (!sqliteUrl?.startsWith("file:")) {
  throw new Error("SQLITE_DATABASE_URL, file:./dev.db gibi bir SQLite URL'si olmalı.");
}
if (!postgresUrl || !/^postgres(ql)?:\/\//.test(postgresUrl)) {
  throw new Error("DATABASE_URL bir PostgreSQL bağlantısı olmalı.");
}

const source = new SqlitePrismaClient({ datasourceUrl: sqliteUrl });
const target = new PrismaClient({ datasourceUrl: postgresUrl });

async function migrate() {
  const [users, sessions, accounts, verifications, teacherProfiles, lessonTypes, availabilities, blockedDates, bookings] =
    await Promise.all([
      source.user.findMany(),
      source.session.findMany(),
      source.account.findMany(),
      source.verification.findMany(),
      source.teacherProfile.findMany(),
      source.lessonType.findMany(),
      source.availability.findMany(),
      source.blockedDate.findMany(),
      source.booking.findMany(),
    ]);

  const sourceCount = users.length + sessions.length + accounts.length + verifications.length +
    teacherProfiles.length + lessonTypes.length + availabilities.length + blockedDates.length + bookings.length;
  if (sourceCount === 0) throw new Error("SQLite veritabanı boş; aktarılacak kayıt bulunamadı.");

  const targetCounts = await Promise.all([
    target.user.count(),
    target.session.count(),
    target.account.count(),
    target.verification.count(),
    target.teacherProfile.count(),
    target.lessonType.count(),
    target.availability.count(),
    target.blockedDate.count(),
    target.booking.count(),
  ]);
  if (targetCounts.some((count) => count !== 0)) {
    throw new Error("PostgreSQL hedef veritabanı boş değil. Hiçbir kayıt aktarılmadı.");
  }

  await target.$transaction(async (tx) => {
    if (users.length) await tx.user.createMany({ data: users });
    if (sessions.length) await tx.session.createMany({ data: sessions });
    if (accounts.length) await tx.account.createMany({ data: accounts });
    if (verifications.length) await tx.verification.createMany({ data: verifications });
    if (teacherProfiles.length) await tx.teacherProfile.createMany({ data: teacherProfiles });
    if (lessonTypes.length) await tx.lessonType.createMany({ data: lessonTypes });
    if (availabilities.length) await tx.availability.createMany({ data: availabilities });
    if (blockedDates.length) await tx.blockedDate.createMany({ data: blockedDates });
    if (bookings.length) await tx.booking.createMany({ data: bookings });
  }, { maxWait: 10_000, timeout: 60_000 });

  console.log("SQLite kayıtları PostgreSQL'e aktarıldı:");
  console.log(`Kullanıcılar: ${users.length}, hoca profilleri: ${teacherProfiles.length}, dersler: ${lessonTypes.length}`);
  console.log(`Randevular: ${bookings.length}, müsaitlikler: ${availabilities.length}, kapalı günler: ${blockedDates.length}`);
  console.log("Oturumlar, hesaplar ve doğrulamalar da aktarıldı. SQLite kaynak dosyası değiştirilmedi.");
}

migrate()
  .catch((error: unknown) => {
    console.error("SQLite aktarımı başarısız oldu:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([source.$disconnect(), target.$disconnect()]);
  });
