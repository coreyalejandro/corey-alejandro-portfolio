
import { serial, text, pgTable, timestamp, numeric, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Define enums
export const artifactCategoryEnum = pgEnum('artifact_category', ['ai_project', 'data_engineering', 'visualization', 'research', 'collaboration']);
export const interactionTypeEnum = pgEnum('interaction_type', ['voice', 'text', 'gesture']);
export const spaceTypeEnum = pgEnum('space_type', ['meeting_room', 'feedback_space', 'presentation_area']);
export const changeTypeEnum = pgEnum('change_type', ['feature', 'bugfix', 'improvement', 'content']);
export const impactLevelEnum = pgEnum('impact_level', ['low', 'medium', 'high']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  bio: text('bio'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Portfolio artifacts table for 3D gallery
export const portfolioArtifactsTable = pgTable('portfolio_artifacts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: artifactCategoryEnum('category').notNull(),
  tags: jsonb('tags').notNull(), // Array of strings
  thumbnail_url: text('thumbnail_url'),
  model_url: text('model_url'), // 3D model file URL
  demo_url: text('demo_url'),
  github_url: text('github_url'),
  position_x: numeric('position_x', { precision: 10, scale: 3 }).notNull(),
  position_y: numeric('position_y', { precision: 10, scale: 3 }).notNull(),
  position_z: numeric('position_z', { precision: 10, scale: 3 }).notNull(),
  rotation_x: numeric('rotation_x', { precision: 10, scale: 3 }).notNull(),
  rotation_y: numeric('rotation_y', { precision: 10, scale: 3 }).notNull(),
  rotation_z: numeric('rotation_z', { precision: 10, scale: 3 }).notNull(),
  scale: numeric('scale', { precision: 10, scale: 3 }).notNull(),
  is_featured: boolean('is_featured').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// AI curator interactions table
export const aiCuratorInteractionsTable = pgTable('ai_curator_interactions', {
  id: serial('id').primaryKey(),
  session_id: text('session_id').notNull(),
  user_input: text('user_input').notNull(),
  curator_response: text('curator_response').notNull(),
  interaction_type: interactionTypeEnum('interaction_type').notNull(),
  context_artifact_id: integer('context_artifact_id'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Collaborative spaces table
export const collaborativeSpacesTable = pgTable('collaborative_spaces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  space_type: spaceTypeEnum('space_type').notNull(),
  max_participants: integer('max_participants').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Progress tracker table
export const progressTrackersTable = pgTable('progress_trackers', {
  id: serial('id').primaryKey(),
  project_name: text('project_name').notNull(),
  current_phase: text('current_phase').notNull(),
  completion_percentage: integer('completion_percentage').notNull(),
  milestones: jsonb('milestones').notNull(), // Array of milestone objects
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Daily change log table
export const dailyChangeLogsTable = pgTable('daily_change_logs', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  changes: jsonb('changes').notNull(), // Array of change objects
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Design system theme table
export const designSystemThemesTable = pgTable('design_system_themes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  colors: jsonb('colors').notNull(), // Color palette object
  typography: jsonb('typography').notNull(), // Typography settings object
  spacing: jsonb('spacing').notNull(), // Spacing scale object
  animations: jsonb('animations').notNull(), // Animation settings object
  is_active: boolean('is_active').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  portfolioArtifacts: portfolioArtifactsTable,
  aiCuratorInteractions: aiCuratorInteractionsTable,
  collaborativeSpaces: collaborativeSpacesTable,
  progressTrackers: progressTrackersTable,
  dailyChangeLogs: dailyChangeLogsTable,
  designSystemThemes: designSystemThemesTable
};
