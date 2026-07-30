import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const interestedPeople = sqliteTable(
  "interested_people",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    interest: text("interest").notNull(),
    privacyConsent: integer("privacy_consent", { mode: "boolean" }).notNull(),
    communicationsConsent: integer("communications_consent", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("interested_people_email_idx").on(table.email)],
);

export const privacyRequests = sqliteTable("privacy_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  requestType: text("request_type").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
