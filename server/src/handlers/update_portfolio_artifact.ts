
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { type UpdatePortfolioArtifactInput, type PortfolioArtifact } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePortfolioArtifact = async (input: UpdatePortfolioArtifactInput): Promise<PortfolioArtifact | null> => {
  try {
    // Check if artifact exists
    const existing = await db.select()
      .from(portfolioArtifactsTable)
      .where(eq(portfolioArtifactsTable.id, input.id))
      .execute();

    if (existing.length === 0) {
      return null;
    }

    // Build update values - only include fields that are provided
    const updateValues: any = {};
    
    if (input.title !== undefined) updateValues.title = input.title;
    if (input.description !== undefined) updateValues.description = input.description;
    if (input.category !== undefined) updateValues.category = input.category;
    if (input.tags !== undefined) updateValues.tags = input.tags;
    if (input.thumbnail_url !== undefined) updateValues.thumbnail_url = input.thumbnail_url;
    if (input.model_url !== undefined) updateValues.model_url = input.model_url;
    if (input.demo_url !== undefined) updateValues.demo_url = input.demo_url;
    if (input.github_url !== undefined) updateValues.github_url = input.github_url;
    if (input.position_x !== undefined) updateValues.position_x = input.position_x.toString();
    if (input.position_y !== undefined) updateValues.position_y = input.position_y.toString();
    if (input.position_z !== undefined) updateValues.position_z = input.position_z.toString();
    if (input.rotation_x !== undefined) updateValues.rotation_x = input.rotation_x.toString();
    if (input.rotation_y !== undefined) updateValues.rotation_y = input.rotation_y.toString();
    if (input.rotation_z !== undefined) updateValues.rotation_z = input.rotation_z.toString();
    if (input.scale !== undefined) updateValues.scale = input.scale.toString();
    if (input.is_featured !== undefined) updateValues.is_featured = input.is_featured;

    // Always update the updated_at timestamp
    updateValues.updated_at = new Date();

    // Update the artifact
    const result = await db.update(portfolioArtifactsTable)
      .set(updateValues)
      .where(eq(portfolioArtifactsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers
    const artifact = result[0];
    return {
      ...artifact,
      position_x: parseFloat(artifact.position_x),
      position_y: parseFloat(artifact.position_y),
      position_z: parseFloat(artifact.position_z),
      rotation_x: parseFloat(artifact.rotation_x),
      rotation_y: parseFloat(artifact.rotation_y),
      rotation_z: parseFloat(artifact.rotation_z),
      scale: parseFloat(artifact.scale),
      tags: artifact.tags as string[]
    };
  } catch (error) {
    console.error('Portfolio artifact update failed:', error);
    throw error;
  }
};
