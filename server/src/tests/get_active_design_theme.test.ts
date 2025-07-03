
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
    // Create a Studio Ghibli-inspired theme
    const themeData = {
      name: 'Studio Ghibli Forest',
      colors: {
        primary: '#4A7C59',
        secondary: '#8FBC8F',
        accent: '#FFD700',
        background: '#F5F5DC',
        surface: '#FFFFFF',
        text: '#2F4F2F',
        text_secondary: '#696969'
      },
      typography: {
        font_family_primary: 'Nunito',
        font_family_secondary: 'Merriweather',
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
        easing_function: 'ease-in-out'
      },
      is_active: true
    };

    // Insert the theme
    await db.insert(designSystemThemesTable)
      .values(themeData)
      .execute();

    const result = await getActiveDesignTheme();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Studio Ghibli Forest');
    expect(result!.colors.primary).toEqual('#4A7C59');
    expect(result!.colors.accent).toEqual('#FFD700');
    expect(result!.typography.font_family_primary).toEqual('Nunito');
    expect(result!.typography.font_sizes['md']).toEqual(16);
    expect(result!.spacing['md']).toEqual(16);
    expect(result!.animations.transition_duration).toEqual(300);
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
          font_sizes: { md: 16 }
        },
        spacing: { md: 16 },
        animations: { 
          transition_duration: 200,
          easing_function: 'linear'
        },
        is_active: false
      })
      .execute();

    // Create active theme
    await db.insert(designSystemThemesTable)
      .values({
        name: 'Active Forest Theme',
        colors: { 
          primary: '#4A7C59',
          secondary: '#8FBC8F',
          accent: '#FFD700',
          background: '#F5F5DC',
          surface: '#FFFFFF',
          text: '#2F4F2F',
          text_secondary: '#696969'
        },
        typography: { 
          font_family_primary: 'Nunito',
          font_family_secondary: 'Merriweather',
          font_sizes: { md: 16 }
        },
        spacing: { md: 16 },
        animations: { 
          transition_duration: 300,
          easing_function: 'ease-in-out'
        },
        is_active: true
      })
      .execute();

    const result = await getActiveDesignTheme();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Active Forest Theme');
    expect(result!.is_active).toBe(true);
  });

  it('should handle jsonb data structures correctly', async () => {
    // Create theme with proper structure matching schema
    const themeData = {
      name: 'Ghibli Nature Theme',
      colors: {
        primary: '#4A7C59',
        secondary: '#8FBC8F',
        accent: '#FFD700',
        background: '#F5F5DC',
        surface: '#FFFFFF',
        text: '#2F4F2F',
        text_secondary: '#696969'
      },
      typography: {
        font_family_primary: 'Nunito',
        font_family_secondary: 'Merriweather',
        font_sizes: {
          heading_large: 32,
          heading_medium: 24,
          heading_small: 20,
          body_large: 18,
          body_medium: 16,
          body_small: 14
        }
      },
      spacing: {
        card_padding: 24,
        button_padding: 16,
        section_margin: 64,
        container_padding: 32
      },
      animations: {
        transition_duration: 300,
        easing_function: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      },
      is_active: true
    };

    await db.insert(designSystemThemesTable)
      .values(themeData)
      .execute();

    const result = await getActiveDesignTheme();

    expect(result).not.toBeNull();
    expect(result!.colors.primary).toEqual('#4A7C59');
    expect(result!.typography.font_sizes['heading_large']).toEqual(32);
    expect(result!.spacing['card_padding']).toEqual(24);
    expect(result!.animations.easing_function).toEqual('cubic-bezier(0.25, 0.46, 0.45, 0.94)');
  });
});
