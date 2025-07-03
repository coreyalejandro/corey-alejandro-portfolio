
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { type UpdatePortfolioArtifactInput, type PortfolioArtifact } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePortfolioArtifact = async (input: UpdatePortfolioArtifactInput): Promise<PortfolioArtifact | null> => {
  try {
    // Extract id from input for WHERE clause
    const { id, ...updateData } = input;
    
    // Build update object, converting numeric fields to strings
    const updateValues: any = {};
    
    // Handle all possible fields that could be updated
    if (updateData.title !== undefined) updateValues.title = updateData.title;
    if (updateData.description !== undefined) updateValues.description = updateData.description;
    if (updateData.category !== undefined) updateValues.category = updateData.category;
    if (updateData.tags !== undefined) updateValues.tags = updateData.tags;
    if (updateData.thumbnail_url !== undefined) updateValues.thumbnail_url = updateData.thumbnail_url;
    if (updateData.model_url !== undefined) updateValues.model_url = updateData.model_url;
    if (updateData.demo_url !== undefined) updateValues.demo_url = updateData.demo_url;
    if (updateData.github_url !== undefined) updateValues.github_url = updateData.github_url;
    if (updateData.is_featured !== undefined) updateValues.is_featured = updateData.is_featured;
    
    // Handle numeric fields - convert to strings for database storage
    if (updateData.position_x !== undefined) updateValues.position_x = updateData.position_x.toString();
    if (updateData.position_y !== undefined) updateValues.position_y = updateData.position_y.toString();
    if (updateData.position_z !== undefined) updateValues.position_z = updateData.position_z.toString();
    if (updateData.rotation_x !== undefined) updateValues.rotation_x = updateData.rotation_x.toString();
    if (updateData.rotation_y !== undefined) updateValues.rotation_y = updateData.rotation_y.toString();
    if (updateData.rotation_z !== undefined) updateValues.rotation_z = updateData.rotation_z.toString();
    if (updateData.scale !== undefined) updateValues.scale = updateData.scale.toString();
    
    // Always update the updated_at timestamp
    updateValues.updated_at = new Date();
    
    // Return null if no fields to update
    if (Object.keys(updateValues).length === 1) { // Only updated_at
      return null;
    }
    
    // Update the portfolio artifact
    const result = await db.update(portfolioArtifactsTable)
      .set(updateValues)
      .where(eq(portfolioArtifactsTable.id, id))
      .returning()
      .execute();
    
    // Return null if no rows were updated (artifact not found)
    if (result.length === 0) {
      return null;
    }
    
    // Convert numeric fields back to numbers before returning
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
