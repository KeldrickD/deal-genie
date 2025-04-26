import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export async function up(db) {
  // Create CRM leads table
  await db.schema.createTable('crm_leads').ifNotExists()
    .addColumn('id', uuid('id').primaryKey().defaultRandom())
    .addColumn('user_id', text('user_id').notNull())
    .addColumn('property_id', text('property_id'))
    .addColumn('address', text('address').notNull())
    .addColumn('city', text('city').notNull())
    .addColumn('state', text('state'))
    .addColumn('zipcode', text('zipcode'))
    .addColumn('price', integer('price'))
    .addColumn('property_type', text('property_type'))
    .addColumn('days_on_market', integer('days_on_market'))
    .addColumn('source', text('source').notNull().default(sql`'lead-genie'`))
    .addColumn('status', text('status').notNull().default(sql`'new'`))
    .addColumn('lead_notes', text('lead_notes'))
    .addColumn('listing_url', text('listing_url'))
    .addColumn('keywords_matched', text('keywords_matched'))
    .addColumn('created_at', timestamp('created_at').defaultNow().notNull())
    .addColumn('updated_at', timestamp('updated_at').defaultNow().notNull())
    .execute();
    
  // Add index for user_id for faster lookups
  await db.schema.createIndex('idx_crm_leads_user_id')
    .on('crm_leads')
    .column('user_id')
    .execute();
    
  // Add index for property_id to check duplicates efficiently
  await db.schema.createIndex('idx_crm_leads_property_id')
    .on('crm_leads')
    .column('property_id')
    .execute();
}

export async function down(db) {
  // Drop the indexes first
  await db.schema.dropIndex('idx_crm_leads_property_id').ifExists().execute();
  await db.schema.dropIndex('idx_crm_leads_user_id').ifExists().execute();
  
  // Drop the table
  await db.schema.dropTable('crm_leads').ifExists().execute();
} 