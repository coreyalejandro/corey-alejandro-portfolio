
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createPortfolioArtifactInputSchema,
  updatePortfolioArtifactInputSchema,
  createAiCuratorInteractionInputSchema,
  createProgressTrackerInputSchema,
  updateProgressTrackerInputSchema,
  createDailyChangeLogInputSchema
} from './schema';

// Import handlers
import { getUserProfile } from './handlers/get_user_profile';
import { getPortfolioArtifacts } from './handlers/get_portfolio_artifacts';
import { getFeaturedArtifacts } from './handlers/get_featured_artifacts';
import { createPortfolioArtifact } from './handlers/create_portfolio_artifact';
import { updatePortfolioArtifact } from './handlers/update_portfolio_artifact';
import { createAiCuratorInteraction } from './handlers/create_ai_curator_interaction';
import { getAiCuratorInteractions } from './handlers/get_ai_curator_interactions';
import { getCollaborativeSpaces } from './handlers/get_collaborative_spaces';
import { getProgressTrackers } from './handlers/get_progress_trackers';
import { createProgressTracker } from './handlers/create_progress_tracker';
import { updateProgressTracker } from './handlers/update_progress_tracker';
import { getDailyChangeLogs } from './handlers/get_daily_change_logs';
import { createDailyChangeLog } from './handlers/create_daily_change_log';
import { getActiveDesignTheme } from './handlers/get_active_design_theme';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // User profile endpoints
  getUserProfile: publicProcedure
    .query(() => getUserProfile()),
  
  // Portfolio artifact endpoints
  getPortfolioArtifacts: publicProcedure
    .query(() => getPortfolioArtifacts()),
  
  getFeaturedArtifacts: publicProcedure
    .query(() => getFeaturedArtifacts()),
  
  createPortfolioArtifact: publicProcedure
    .input(createPortfolioArtifactInputSchema)
    .mutation(({ input }) => createPortfolioArtifact(input)),
  
  updatePortfolioArtifact: publicProcedure
    .input(updatePortfolioArtifactInputSchema)
    .mutation(({ input }) => updatePortfolioArtifact(input)),
  
  // AI curator endpoints
  createAiCuratorInteraction: publicProcedure
    .input(createAiCuratorInteractionInputSchema)
    .mutation(({ input }) => createAiCuratorInteraction(input)),
  
  getAiCuratorInteractions: publicProcedure
    .input(z.string())
    .query(({ input }) => getAiCuratorInteractions(input)),
  
  // Collaborative spaces endpoints
  getCollaborativeSpaces: publicProcedure
    .query(() => getCollaborativeSpaces()),
  
  // Progress tracker endpoints
  getProgressTrackers: publicProcedure
    .query(() => getProgressTrackers()),
  
  createProgressTracker: publicProcedure
    .input(createProgressTrackerInputSchema)
    .mutation(({ input }) => createProgressTracker(input)),
  
  updateProgressTracker: publicProcedure
    .input(updateProgressTrackerInputSchema)
    .mutation(({ input }) => updateProgressTracker(input)),
  
  // Daily change log endpoints
  getDailyChangeLogs: publicProcedure
    .input(z.number().optional())
    .query(({ input }) => getDailyChangeLogs(input)),
  
  createDailyChangeLog: publicProcedure
    .input(createDailyChangeLogInputSchema)
    .mutation(({ input }) => createDailyChangeLog(input)),
  
  // Design system endpoints
  getActiveDesignTheme: publicProcedure
    .query(() => getActiveDesignTheme()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`🚀 Corey Alejandro's Portfolio API listening at port: ${port}`);
}

start();
