
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { getUserProfile } from '../handlers/get_user_profile';

describe('getUserProfile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no user exists', async () => {
    const result = await getUserProfile();
    expect(result).toBeNull();
  });

  it('should return user profile when user exists', async () => {
    // Insert test user
    await db.insert(usersTable)
      .values({
        name: 'Corey Alejandro',
        title: 'AI & Data Engineer',
        bio: 'Passionate about creating intelligent systems and beautiful data visualizations.',
        avatar_url: 'https://example.com/avatar.jpg'
      })
      .execute();

    const result = await getUserProfile();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Corey Alejandro');
    expect(result!.title).toEqual('AI & Data Engineer');
    expect(result!.bio).toEqual('Passionate about creating intelligent systems and beautiful data visualizations.');
    expect(result!.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return first user when multiple users exist', async () => {
    // Insert multiple test users
    await db.insert(usersTable)
      .values([
        {
          name: 'First User',
          title: 'First Title',
          bio: 'First bio',
          avatar_url: null
        },
        {
          name: 'Second User',
          title: 'Second Title',
          bio: 'Second bio',
          avatar_url: null
        }
      ])
      .execute();

    const result = await getUserProfile();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('First User');
    expect(result!.title).toEqual('First Title');
    expect(result!.bio).toEqual('First bio');
    expect(result!.avatar_url).toBeNull();
  });

  it('should handle user with null bio and avatar_url', async () => {
    // Insert user with null optional fields
    await db.insert(usersTable)
      .values({
        name: 'Test User',
        title: 'Test Title',
        bio: null,
        avatar_url: null
      })
      .execute();

    const result = await getUserProfile();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Test User');
    expect(result!.title).toEqual('Test Title');
    expect(result!.bio).toBeNull();
    expect(result!.avatar_url).toBeNull();
  });
});
