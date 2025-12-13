import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const repositoryInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  fullName: z.string(),
  description: z.string().nullable(),
  private: z.boolean(),
  htmlUrl: z.string(),
  defaultBranch: z.string(),
  pushedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type RepositoryInfo = z.infer<typeof repositoryInfoSchema>;

export const pagesInfoSchema = z.object({
  url: z.string().nullable(),
  status: z.string().nullable(),
  cname: z.string().nullable(),
  custom404: z.boolean(),
  httpsCertificate: z.object({
    state: z.string(),
    description: z.string(),
  }).nullable().optional(),
  source: z.object({
    branch: z.string(),
    path: z.string(),
  }).nullable(),
  buildType: z.string().nullable(),
});

export type PagesInfo = z.infer<typeof pagesInfoSchema>;

export const buildInfoSchema = z.object({
  url: z.string(),
  status: z.string(),
  error: z.object({
    message: z.string().nullable(),
  }).nullable(),
  pusher: z.object({
    login: z.string(),
    avatarUrl: z.string(),
  }).nullable(),
  commit: z.string().nullable(),
  duration: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BuildInfo = z.infer<typeof buildInfoSchema>;

export const issueSchema = z.object({
  id: z.string(),
  severity: z.enum(["critical", "warning", "info"]),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  suggestedFix: z.string().nullable(),
  canAutoFix: z.boolean(),
});

export type Issue = z.infer<typeof issueSchema>;

export const diagnosticReportSchema = z.object({
  repository: repositoryInfoSchema.nullable(),
  pages: pagesInfoSchema.nullable(),
  latestBuild: buildInfoSchema.nullable(),
  issues: z.array(issueSchema),
  siteReachable: z.boolean(),
  lastChecked: z.string(),
});

export type DiagnosticReport = z.infer<typeof diagnosticReportSchema>;

export const fileContentSchema = z.object({
  path: z.string(),
  content: z.string(),
  sha: z.string(),
});

export type FileContent = z.infer<typeof fileContentSchema>;

export const commitResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  commitSha: z.string().nullable(),
});

export type CommitResult = z.infer<typeof commitResultSchema>;

export const repositoryInputSchema = z.object({
  owner: z.string().min(1, "Owner is required"),
  repo: z.string().min(1, "Repository name is required"),
});

export type RepositoryInput = z.infer<typeof repositoryInputSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
