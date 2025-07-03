
import { z } from 'zod';

// User schema for Corey Alejandro's profile
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  title: z.string(),
  bio: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Portfolio artifact schema for 3D gallery items
export const portfolioArtifactSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['ai_project', 'data_engineering', 'visualization', 'research', 'collaboration']),
  tags: z.array(z.string()),
  thumbnail_url: z.string().nullable(),
  model_url: z.string().nullable(), // 3D model file URL
  demo_url: z.string().nullable(),
  github_url: z.string().nullable(),
  position_x: z.number(), // 3D gallery position
  position_y: z.number(),
  position_z: z.number(),
  rotation_x: z.number(),
  rotation_y: z.number(),
  rotation_z: z.number(),
  scale: z.number(),
  is_featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PortfolioArtifact = z.infer<typeof portfolioArtifactSchema>;

// AI curator interaction schema
export const aiCuratorInteractionSchema = z.object({
  id: z.number(),
  session_id: z.string(),
  user_input: z.string(),
  curator_response: z.string(),
  interaction_type: z.enum(['voice', 'text', 'gesture']),
  context_artifact_id: z.number().nullable(),
  created_at: z.coerce.date()
});

export type AiCuratorInteraction = z.infer<typeof aiCuratorInteractionSchema>;

// Collaborative space schema
export const collaborativeSpaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  space_type: z.enum(['meeting_room', 'feedback_space', 'presentation_area']),
  max_participants: z.number().int(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type CollaborativeSpace = z.infer<typeof collaborativeSpaceSchema>;

// Progress tracker schema
export const progressTrackerSchema = z.object({
  id: z.number(),
  project_name: z.string(),
  current_phase: z.string(),
  completion_percentage: z.number().min(0).max(100),
  milestones: z.array(z.object({
    name: z.string(),
    completed: z.boolean(),
    due_date: z.coerce.date().nullable()
  })),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ProgressTracker = z.infer<typeof progressTrackerSchema>;

// Daily change log schema
export const dailyChangeLogSchema = z.object({
  id: z.number(),
  date: z.coerce.date(),
  changes: z.array(z.object({
    type: z.enum(['feature', 'bugfix', 'improvement', 'content']),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high'])
  })),
  created_at: z.coerce.date()
});

export type DailyChangeLog = z.infer<typeof dailyChangeLogSchema>;

// Design system theme schema
export const designSystemThemeSchema = z.object({
  id: z.number(),
  name: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    text_secondary: z.string()
  }),
  typography: z.object({
    font_family_primary: z.string(),
    font_family_secondary: z.string(),
    font_sizes: z.record(z.string(), z.number())
  }),
  spacing: z.record(z.string(), z.number()),
  animations: z.object({
    transition_duration: z.number(),
    easing_function: z.string()
  }),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type DesignSystemTheme = z.infer<typeof designSystemThemeSchema>;

// Input schemas for creation
export const createPortfolioArtifactInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(['ai_project', 'data_engineering', 'visualization', 'research', 'collaboration']),
  tags: z.array(z.string()),
  thumbnail_url: z.string().nullable(),
  model_url: z.string().nullable(),
  demo_url: z.string().nullable(),
  github_url: z.string().nullable(),
  position_x: z.number(),
  position_y: z.number(),
  position_z: z.number(),
  rotation_x: z.number(),
  rotation_y: z.number(),
  rotation_z: z.number(),
  scale: z.number(),
  is_featured: z.boolean()
});

export type CreatePortfolioArtifactInput = z.infer<typeof createPortfolioArtifactInputSchema>;

export const createAiCuratorInteractionInputSchema = z.object({
  session_id: z.string(),
  user_input: z.string(),
  interaction_type: z.enum(['voice', 'text', 'gesture']),
  context_artifact_id: z.number().nullable()
});

export type CreateAiCuratorInteractionInput = z.infer<typeof createAiCuratorInteractionInputSchema>;

export const createProgressTrackerInputSchema = z.object({
  project_name: z.string(),
  current_phase: z.string(),
  completion_percentage: z.number().min(0).max(100),
  milestones: z.array(z.object({
    name: z.string(),
    completed: z.boolean(),
    due_date: z.coerce.date().nullable()
  }))
});

export type CreateProgressTrackerInput = z.infer<typeof createProgressTrackerInputSchema>;

export const createDailyChangeLogInputSchema = z.object({
  date: z.coerce.date(),
  changes: z.array(z.object({
    type: z.enum(['feature', 'bugfix', 'improvement', 'content']),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high'])
  }))
});

export type CreateDailyChangeLogInput = z.infer<typeof createDailyChangeLogInputSchema>;

// Update schemas
export const updatePortfolioArtifactInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['ai_project', 'data_engineering', 'visualization', 'research', 'collaboration']).optional(),
  tags: z.array(z.string()).optional(),
  thumbnail_url: z.string().nullable().optional(),
  model_url: z.string().nullable().optional(),
  demo_url: z.string().nullable().optional(),
  github_url: z.string().nullable().optional(),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  position_z: z.number().optional(),
  rotation_x: z.number().optional(),
  rotation_y: z.number().optional(),
  rotation_z: z.number().optional(),
  scale: z.number().optional(),
  is_featured: z.boolean().optional()
});

export type UpdatePortfolioArtifactInput = z.infer<typeof updatePortfolioArtifactInputSchema>;

export const updateProgressTrackerInputSchema = z.object({
  id: z.number(),
  project_name: z.string().optional(),
  current_phase: z.string().optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  milestones: z.array(z.object({
    name: z.string(),
    completed: z.boolean(),
    due_date: z.coerce.date().nullable()
  })).optional()
});

export type UpdateProgressTrackerInput = z.infer<typeof updateProgressTrackerInputSchema>;
