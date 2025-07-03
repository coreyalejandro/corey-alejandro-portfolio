
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { type CreatePortfolioArtifactInput, type PortfolioArtifact } from '../schema';

export const createPortfolioArtifact = async (input: CreatePortfolioArtifactInput): Promise<PortfolioArtifact> => {
  try {
    // Insert portfolio artifact record
    const result = await db.insert(portfolioArtifactsTable)
      .values({
        title: input.title,
        description: input.description,
        category: input.category,
        tags: input.tags,
        thumbnail_url: input.thumbnail_url,
        model_url: input.model_url,
        demo_url: input.demo_url,
        github_url: input.github_url,
        position_x: input.position_x.toString(), // Convert number to string for numeric column
        position_y: input.position_y.toString(),
        position_z: input.position_z.toString(),
        rotation_x: input.rotation_x.toString(),
        rotation_y: input.rotation_y.toString(),
        rotation_z: input.rotation_z.toString(),
        scale: input.scale.toString(),
        is_featured: input.is_featured
      })
      .returning()
      .execute();

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
    console.error('Portfolio artifact creation failed:', error);
    throw error;
  }
};
