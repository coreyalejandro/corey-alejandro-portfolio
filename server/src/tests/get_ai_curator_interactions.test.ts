
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { aiCuratorInteractionsTable } from '../db/schema';
import { getAiCuratorInteractions } from '../handlers/get_ai_curator_interactions';

describe('getAiCuratorInteractions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array for non-existent session', async () => {
    const result = await getAiCuratorInteractions('non-existent-session');
    expect(result).toEqual([]);
  });

  it('should return interactions for a specific session', async () => {
    const sessionId = 'test-session-123';
    
    // Insert first interaction
    await db.insert(aiCuratorInteractionsTable)
      .values({
        session_id: sessionId,
        user_input: 'Hello, can you show me AI projects?',
        curator_response: 'I can show you several AI projects in the gallery.',
        interaction_type: 'text',
        context_artifact_id: null
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Insert second interaction
    await db.insert(aiCuratorInteractionsTable)
      .values({
        session_id: sessionId,
        user_input: 'Tell me about the neural network project',
        curator_response: 'This project demonstrates deep learning capabilities.',
        interaction_type: 'voice',
        context_artifact_id: 1
      })
      .execute();

    const result = await getAiCuratorInteractions(sessionId);

    expect(result).toHaveLength(2);
    expect(result[0].session_id).toEqual(sessionId);
    // Since we order by created_at DESC, the second (newer) interaction should be first
    expect(result[0].user_input).toEqual('Tell me about the neural network project');
    expect(result[0].curator_response).toEqual('This project demonstrates deep learning capabilities.');
    expect(result[0].interaction_type).toEqual('voice');
    expect(result[0].context_artifact_id).toEqual(1);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
  });

  it('should return interactions in reverse chronological order', async () => {
    const sessionId = 'test-session-456';
    
    // Insert interactions with slight delay to ensure different timestamps
    await db.insert(aiCuratorInteractionsTable)
      .values({
        session_id: sessionId,
        user_input: 'First interaction',
        curator_response: 'First response',
        interaction_type: 'text',
        context_artifact_id: null
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(aiCuratorInteractionsTable)
      .values({
        session_id: sessionId,
        user_input: 'Second interaction',
        curator_response: 'Second response',
        interaction_type: 'gesture',
        context_artifact_id: null
      })
      .execute();

    const result = await getAiCuratorInteractions(sessionId);

    expect(result).toHaveLength(2);
    // Should be ordered by created_at DESC (newest first)
    expect(result[0].user_input).toEqual('Second interaction');
    expect(result[1].user_input).toEqual('First interaction');
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
  });

  it('should only return interactions for the specified session', async () => {
    const sessionId1 = 'session-1';
    const sessionId2 = 'session-2';
    
    // Insert interactions for different sessions
    await db.insert(aiCuratorInteractionsTable)
      .values([
        {
          session_id: sessionId1,
          user_input: 'Session 1 interaction',
          curator_response: 'Response for session 1',
          interaction_type: 'text',
          context_artifact_id: null
        },
        {
          session_id: sessionId2,
          user_input: 'Session 2 interaction',
          curator_response: 'Response for session 2',
          interaction_type: 'voice',
          context_artifact_id: null
        }
      ])
      .execute();

    const result = await getAiCuratorInteractions(sessionId1);

    expect(result).toHaveLength(1);
    expect(result[0].session_id).toEqual(sessionId1);
    expect(result[0].user_input).toEqual('Session 1 interaction');
  });

  it('should handle sessions with interactions that have context artifacts', async () => {
    const sessionId = 'context-session';
    
    await db.insert(aiCuratorInteractionsTable)
      .values({
        session_id: sessionId,
        user_input: 'What is this artifact?',
        curator_response: 'This is a data visualization project.',
        interaction_type: 'text',
        context_artifact_id: 42
      })
      .execute();

    const result = await getAiCuratorInteractions(sessionId);

    expect(result).toHaveLength(1);
    expect(result[0].context_artifact_id).toEqual(42);
  });
});
