
import { db } from '../db';
import { aiCuratorInteractionsTable } from '../db/schema';
import { type CreateAiCuratorInteractionInput, type AiCuratorInteraction } from '../schema';

export const createAiCuratorInteraction = async (input: CreateAiCuratorInteractionInput): Promise<AiCuratorInteraction> => {
  try {
    // Generate a contextual curator response based on input
    const curatorResponse = generateCuratorResponse(input.user_input, input.interaction_type);

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

function generateCuratorResponse(userInput: string, interactionType: 'voice' | 'text' | 'gesture'): string {
  const input = userInput.toLowerCase();
  
  // Generate contextual responses based on interaction type and content
  // Check for specific topics first, then general greetings
  if (interactionType === 'voice') {
    if (input.includes('ai') || input.includes('artificial intelligence')) {
      return "Excellent choice! Let me guide you to Corey's AI projects. These showcase his expertise in machine learning, natural language processing, and intelligent systems.";
    }
    if (input.includes('data') || input.includes('engineering')) {
      return "Great! I'll take you through Corey's data engineering projects. These demonstrate his skills in building robust data pipelines and scalable architectures.";
    }
    if (input.includes('help') || input.includes('what can you do')) {
      return "I can help you navigate through the 3D gallery, explain projects in detail, and answer questions about Corey's work. Try saying 'show me AI projects' or 'tell me about data engineering'.";
    }
    if (input.includes('hello') || input.includes('hi') || input.includes('start')) {
      return "Welcome to Corey's portfolio! I'm your AI curator. I can guide you through his projects using voice commands. What would you like to explore?";
    }
    return "I understand you're interested in exploring the portfolio. Let me provide you with a guided tour of the most relevant projects.";
  }
  
  if (interactionType === 'text') {
    if (input.includes('visualization') || input.includes('visual')) {
      return "Perfect! Corey's visualization projects combine technical expertise with creative design. Let me highlight the key interactive experiences.";
    }
    if (input.includes('research') || input.includes('academic')) {
      return "Corey's research work demonstrates his analytical approach and contribution to the field. I'll show you his most impactful research projects.";
    }
    if (input.includes('help') || input.includes('commands')) {
      return "You can ask me about specific project categories, request detailed explanations, or ask for recommendations. Try typing 'show visualization projects' or 'what's featured?'";
    }
    if (input.includes('hello') || input.includes('hi') || input.includes('start')) {
      return "Hi there! I'm the AI curator for this portfolio. Type your questions or interests, and I'll help you discover relevant projects.";
    }
    return "Thanks for your interest! I'll help you find the most relevant projects based on your query.";
  }
  
  if (interactionType === 'gesture') {
    return "I notice your gesture interaction! The 3D space responds to your movements. I'll provide contextual information about the projects you're focusing on.";
  }
  
  return "Thank you for your interest! Let me guide you through this project portfolio.";
}
