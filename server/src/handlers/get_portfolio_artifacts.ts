
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { type PortfolioArtifact } from '../schema';

export const getPortfolioArtifacts = async (): Promise<PortfolioArtifact[]> => {
  try {
    const results = await db.select()
      .from(portfolioArtifactsTable)
      .execute();

    // Convert numeric fields back to numbers and parse JSON fields
    return results.map(artifact => ({
      ...artifact,
      position_x: parseFloat(artifact.position_x),
      position_y: parseFloat(artifact.position_y),
      position_z: parseFloat(artifact.position_z),
      rotation_x: parseFloat(artifact.rotation_x),
      rotation_y: parseFloat(artifact.rotation_y),
      rotation_z: parseFloat(artifact.rotation_z),
      scale: parseFloat(artifact.scale),
      tags: artifact.tags as string[] // JSONB field
    }));
  } catch (error) {
    console.error('Portfolio artifacts fetch failed:', error);
    throw error;
  }
};
