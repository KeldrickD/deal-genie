import { relations, sql } from 'drizzle-orm';
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

// CRM Leads Table
export const CrmLeads = pgTable('crm_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  propertyId: text('property_id'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state'),
  zipcode: text('zipcode'),
  price: integer('price'),
  propertyType: text('property_type'),
  daysOnMarket: integer('days_on_market'),
  source: text('source').notNull().default('lead-genie'),
  status: text('status').notNull().default('new'),
  leadNotes: text('lead_notes'),
  listingUrl: text('listing_url'),
  keywordsMatched: text('keywords_matched'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define Users table schema for relations
export const Users = pgTable('users', {
  id: text('id').primaryKey(),
  // other fields would go here
});

// CRM Leads Relations
export const crmLeadsRelations = relations(CrmLeads, ({ one }) => ({
  user: one(Users, {
    fields: [CrmLeads.userId],
    references: [Users.id],
  }),
})); 