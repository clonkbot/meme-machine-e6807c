import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  memes: defineTable({
    userId: v.id("users"),
    topText: v.string(),
    bottomText: v.string(),
    imageBase64: v.string(),
    prompt: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_created", ["createdAt"]),

  memeIdeas: defineTable({
    userId: v.id("users"),
    idea: v.string(),
    topText: v.string(),
    bottomText: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
