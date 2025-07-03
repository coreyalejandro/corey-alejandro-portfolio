
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { collaborativeSpacesTable } from '../db/schema';
import { getCollaborativeSpaces } from '../handlers/get_collaborative_spaces';

describe('getCollaborativeSpaces', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no spaces exist', async () => {
    const result = await getCollaborativeSpaces();
    expect(result).toEqual([]);
  });

  it('should return all collaborative spaces', async () => {
    // Create test spaces
    await db.insert(collaborativeSpacesTable)
      .values([
        {
          name: 'Main Conference Room',
          description: 'Primary meeting space for team discussions',
          space_type: 'meeting_room',
          max_participants: 12,
          is_active: true
        },
        {
          name: 'Feedback Lounge',
          description: 'Casual space for collecting feedback',
          space_type: 'feedback_space',
          max_participants: 8,
          is_active: true
        },
        {
          name: 'Presentation Theater',
          description: 'Formal presentation area',
          space_type: 'presentation_area',
          max_participants: 50,
          is_active: false
        }
      ])
      .execute();

    const result = await getCollaborativeSpaces();

    expect(result).toHaveLength(3);
    
    // Check first space
    const meetingRoom = result.find(space => space.name === 'Main Conference Room');
    expect(meetingRoom).toBeDefined();
    expect(meetingRoom!.description).toEqual('Primary meeting space for team discussions');
    expect(meetingRoom!.space_type).toEqual('meeting_room');
    expect(meetingRoom!.max_participants).toEqual(12);
    expect(meetingRoom!.is_active).toBe(true);
    expect(meetingRoom!.id).toBeDefined();
    expect(meetingRoom!.created_at).toBeInstanceOf(Date);
    expect(meetingRoom!.updated_at).toBeInstanceOf(Date);

    // Check second space
    const feedbackSpace = result.find(space => space.name === 'Feedback Lounge');
    expect(feedbackSpace).toBeDefined();
    expect(feedbackSpace!.space_type).toEqual('feedback_space');
    expect(feedbackSpace!.max_participants).toEqual(8);
    expect(feedbackSpace!.is_active).toBe(true);

    // Check third space
    const presentationArea = result.find(space => space.name === 'Presentation Theater');
    expect(presentationArea).toBeDefined();
    expect(presentationArea!.space_type).toEqual('presentation_area');
    expect(presentationArea!.max_participants).toEqual(50);
    expect(presentationArea!.is_active).toBe(false);
  });

  it('should include both active and inactive spaces', async () => {
    // Create one active and one inactive space
    await db.insert(collaborativeSpacesTable)
      .values([
        {
          name: 'Active Room',
          description: 'Currently available',
          space_type: 'meeting_room',
          max_participants: 6,
          is_active: true
        },
        {
          name: 'Inactive Room',
          description: 'Under maintenance',
          space_type: 'meeting_room',
          max_participants: 4,
          is_active: false
        }
      ])
      .execute();

    const result = await getCollaborativeSpaces();

    expect(result).toHaveLength(2);
    
    const activeSpace = result.find(space => space.name === 'Active Room');
    const inactiveSpace = result.find(space => space.name === 'Inactive Room');
    
    expect(activeSpace!.is_active).toBe(true);
    expect(inactiveSpace!.is_active).toBe(false);
  });
});
