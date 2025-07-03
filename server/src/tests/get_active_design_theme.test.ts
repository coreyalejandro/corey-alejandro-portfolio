
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { designSystemThemesTable } from '../db/schema';
import { getActiveDesignTheme } from '../handlers/get_active_design_theme';

describe('getActiveDesignTheme', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no active theme exists', async () => {
    const result = await getActiveDesignTheme();
    expect(result).toBeNull();
  });

  it('should return the active design theme', async () => {
    // Create a test theme
    const testTheme = {
      name: 'Studio Ghibli Theme',
      colors: {
        primary: '#4A90E2',
        secondary: '#7ED321',
        accent: '#F5A623',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: '#2C3E50',
        text_secondary: '#7F8C8D'
      },
      typography: {
        font_family_primary: 'Inter',
        font_family_secondary: 'Roboto Mono',
        font_sizes: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
          xxl: 24
        }
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48
      },
      animations: {
        transition_duration: 300,
        easing_function: 'ease-in-out'
      },
      is_active: true
    };

    await db.insert(designSystemThemesTable)
      .values(testTheme)
      .execute();

    const result = await getActiveDesignTheme();

    expect(result).toBeDefined();
    expect(result!.name).toEqual('Studio Ghibli Theme');
    expect(result!.colors).toEqual(testTheme.colors);
    expect(result!.typography).toEqual(testTheme.typography);
    expect(result!.spacing).toEqual(testTheme.spacing);
    expect(result!.animations).toEqual(testTheme.animations);
    expect(result!.is_active).toBe(true);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return only the active theme when multiple themes exist', async () => {
    // Create inactive theme
    await db.insert(designSystemThemesTable)
      .values({
        name: 'Inactive Theme',
        colors: {
          primary: '#000000',
          secondary: '#111111',
          accent: '#222222',
          background: '#333333',
          surface: '#444444',
          text: '#555555',
          text_secondary: '#666666'
        },
        typography: {
          font_family_primary: 'Arial',
          font_family_secondary: 'Times',
          font_sizes: { sm: 14 }
        },
        spacing: { sm: 8 },
        animations: {
          transition_duration: 200,
          easing_function: 'linear'
        },
        is_active: false
      })
      .execute();

    // Create active theme
    const activeTheme = {
      name: 'Active Theme',
      colors: {
        primary: '#4A90E2',
        secondary: '#7ED321',
        accent: '#F5A623',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: '#2C3E50',
        text_secondary: '#7F8C8D'
      },
      typography: {
        font_family_primary: 'Inter',
        font_family_secondary: 'Roboto Mono',
        font_sizes: { md: 16 }
      },
      spacing: { md: 16 },
      animations: {
        transition_duration: 300,
        easing_function: 'ease-in-out'
      },
      is_active: true
    };

    await db.insert(designSystemThemesTable)
      .values(activeTheme)
      .execute();

    const result = await getActiveDesignTheme();

    expect(result).toBeDefined();
    expect(result!.name).toEqual('Active Theme');
    expect(result!.is_active).toBe(true);
  });

  it('should handle JSONB data structures correctly', async () => {
    const themeWithNestedData = {
      name: 'Complex Theme',
      colors: {
        primary: '#4A90E2',
        secondary: '#7ED321',
        accent: '#F5A623',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: '#2C3E50',
        text_secondary: '#7F8C8D'
      },
      typography: {
        font_family_primary: 'Inter',
        font_family_secondary: 'Roboto Mono',
        font_sizes: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20
        }
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      animations: {
        transition_duration: 300,
        easing_function: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      is_active: true
    };

    await db.insert(designSystemThemesTable)
      .values(themeWithNestedData)
      .execute();

    const result = await getActiveDesignTheme();

    expect(result).toBeDefined();
    expect(result!.colors).toEqual(themeWithNestedData.colors);
    expect(result!.typography).toEqual(themeWithNestedData.typography);
    expect(result!.spacing).toEqual(themeWithNestedData.spacing);
    expect(result!.animations).toEqual(themeWithNestedData.animations);
    
    // Verify nested structure access
    expect((result!.colors as any).primary).toEqual('#4A90E2');
    expect((result!.typography as any).font_sizes.md).toEqual(16);
    expect((result!.spacing as any).lg).toEqual(24);
    expect((result!.animations as any).transition_duration).toEqual(300);
  });

  it('should preserve exact JSONB structure from database', async () => {
    // Create theme with specific structure to test JSONB preservation
    const testTheme = {
      name: 'JSONB Test Theme',
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#45B7D1',
        background: '#F7F9FC',
        surface: '#FFFFFF',
        text: '#2D3748',
        text_secondary: '#718096'
      },
      typography: {
        font_family_primary: 'Poppins',
        font_family_secondary: 'Source Code Pro',
        font_sizes: {
          tiny: 10,
          small: 12,
          base: 14,
          medium: 16,
          large: 18,
          huge: 24
        }
      },
      spacing: {
        micro: 2,
        tiny: 4,
        small: 8,
        medium: 16,
        large: 32,
        huge: 64
      },
      animations: {
        transition_duration: 250,
        easing_function: 'ease-out'
      },
      is_active: true
    };

    await db.insert(designSystemThemesTable)
      .values(testTheme)
      .execute();

    const result = await getActiveDesignTheme();

    expect(result).toBeDefined();
    expect(result!.name).toEqual('JSONB Test Theme');
    
    // Test that all nested properties are preserved
    expect(result!.colors).toEqual(testTheme.colors);
    expect(result!.typography).toEqual(testTheme.typography);
    expect(result!.spacing).toEqual(testTheme.spacing);
    expect(result!.animations).toEqual(testTheme.animations);
    
    // Test specific nested values
    expect((result!.colors as any).primary).toEqual('#FF6B6B');
    expect((result!.typography as any).font_family_primary).toEqual('Poppins');
    expect((result!.typography as any).font_sizes.base).toEqual(14);
    expect((result!.spacing as any).micro).toEqual(2);
    expect((result!.animations as any).transition_duration).toEqual(250);
  });
});
