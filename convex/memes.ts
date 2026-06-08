import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("memes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("memes")
      .withIndex("by_created")
      .order("desc")
      .take(20);
  },
});

export const create = mutation({
  args: {
    topText: v.string(),
    bottomText: v.string(),
    imageBase64: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("memes", {
      userId,
      topText: args.topText,
      bottomText: args.bottomText,
      imageBase64: args.imageBase64,
      prompt: args.prompt,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("memes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const meme = await ctx.db.get(args.id);
    if (!meme || meme.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const saveIdea = mutation({
  args: {
    idea: v.string(),
    topText: v.string(),
    bottomText: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("memeIdeas", {
      userId,
      idea: args.idea,
      topText: args.topText,
      bottomText: args.bottomText,
      createdAt: Date.now(),
    });
  },
});

export const listIdeas = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("memeIdeas")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});
