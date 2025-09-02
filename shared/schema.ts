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

// Extended café details for detail view
export const cafeDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  neighborhood: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  rating: z.number(),
  reviewCount: z.number(),
  priceLevel: z.string(),
  vibeScore: z.number(),
  imageUrl: z.string().nullable(),
  photos: z.array(z.object({
    id: z.string(),
    url: z.string(),
    width: z.number(),
    height: z.number()
  })).default([]),
  tags: z.array(z.string()),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  openingHours: z.record(z.string()).default({}),
  description: z.string().nullable(),
  reviews: z.array(z.object({
    text: z.string(),
    date: z.string()
  })).default([]),
  hours: z.object({
    display: z.string().optional(),
    openNow: z.boolean().optional(),
    periods: z.array(z.object({
      day: z.number(),
      open: z.string(),
      close: z.string()
    })).optional()
  }).nullable()
});

export type CafeDetails = z.infer<typeof cafeDetailsSchema>;

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
