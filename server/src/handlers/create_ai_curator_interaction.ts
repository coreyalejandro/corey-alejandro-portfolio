
import { db } from '../db';
import { aiCuratorInteractionsTable } from '../db/schema';
import { type CreateAiCuratorInteractionInput, type AiCuratorInteraction } from '../schema';

export const createAiCuratorInteraction = async (input: CreateAiCuratorInteractionInput): Promise<AiCuratorInteraction> => {
  try {
    // Generate a contextual curator response based on input
    const curatorResponse = generateCuratorResponse(input);

    // Insert AI curator interaction record
    const result = await db.insert(aiCuratorInteractionsTable)
      .values({
        session_id: input.session_id,
        user_input: input.user_input,
        curator_response: curatorResponse,
        interaction_type: input.interaction_type,
        context_artifact_id: input.context_artifact_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('AI curator interaction creation failed:', error);
    throw error;
  }
};

// Helper function to generate contextual curator responses
function generateCuratorResponse(input: CreateAiCuratorInteractionInput): string {
  const { interaction_type, user_input, context_artifact_id } = input;
  
  // Generate response based on interaction type and context
  if (context_artifact_id) {
    // Contextual response when viewing a specific artifact
    switch (interaction_type) {
      case 'voice':
        return `I can hear you're interested in this project. Let me share some details about what makes this work special.`;
      case 'gesture':
        return `I see you're exploring this artifact. Here's what you should know about the technology behind it.`;
      case 'text':
        return `Great question about this project! Here's some insight into the development process and key features.`;
      default:
        return `Thank you for your interest in this project. Let me guide you through its key components.`;
    }
  } else {
    // General response for portfolio exploration
    switch (interaction_type) {
      case 'voice':
        return `Welcome to Corey's portfolio! I'm here to help you explore his work. What would you like to know about?`;
      case 'gesture':
        return `I notice you're browsing the gallery. Feel free to interact with any project that catches your eye.`;
      case 'text':
        return `Hello! I'm the AI curator for this portfolio. I can help you discover projects that match your interests.`;
      default:
        return `Welcome! I'm here to guide you through Corey's portfolio and answer any questions you might have.`;
    }
  }
}
