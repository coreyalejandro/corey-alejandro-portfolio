
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { type PortfolioArtifact } from '../schema';
import { eq } from 'drizzle-orm';

export const getFeaturedArtifacts = async (): Promise<PortfolioArtifact[]> => {
  try {
    const results = await db.select()
      .from(portfolioArtifactsTable)
      .where(eq(portfolioArtifactsTable.is_featured, true))
      .execute();

    // Convert numeric fields back to numbers for proper typing
    return results.map(artifact => ({
      ...artifact,
      position_x: parseFloat(artifact.position_x),
      position_y: parseFloat(artifact.position_y),
      position_z: parseFloat(artifact.position_z),
      rotation_x: parseFloat(artifact.rotation_x),
      rotation_y: parseFloat(artifact.rotation_y),
      rotation_z: parseFloat(artifact.rotation_z),
      scale: parseFloat(artifact.scale),
      tags: artifact.tags as string[] // Cast jsonb to string array
    }));
  } catch (error) {
    console.error('Failed to fetch featured artifacts:', error);
    throw error;
  }
};
