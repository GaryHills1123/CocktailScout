import { pgTable, text, varchar, real, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cafes = pgTable("cafes", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  neighborhood: text("neighborhood").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  rating: real("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  priceLevel: text("price_level").notNull(), // $, $$, $$$, $$$$
  imageUrl: text("image_url"),
  tags: json("tags").$type<string[]>().notNull().default([]),
  vibeScore: real("vibe_score").notNull(),
  yelpId: text("yelp_id"),
  phone: text("phone"),
  website: text("website"),
  openingHours: json("opening_hours").$type<Record<string, string>>().default({}),
});

export const insertCafeSchema = createInsertSchema(cafes).omit({
  vibeScore: true, // calculated
});

export type InsertCafe = z.infer<typeof insertCafeSchema>;
export type Cafe = typeof cafes.$inferSelect;

// Keep existing user schema for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
