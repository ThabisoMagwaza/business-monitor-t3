import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Professional color palettes for charts
const CHART_COLOR_PALETTES = {
  // Primary palette - vibrant and professional
  primary: [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
  ],
  // Secondary palette - softer tones
  secondary: [
    '#60A5FA', // Light Blue
    '#F87171', // Light Red
    '#34D399', // Light Green
    '#FBBF24', // Light Amber
    '#A78BFA', // Light Purple
    '#F472B6', // Light Pink
    '#22D3EE', // Light Cyan
    '#A3E635', // Light Lime
    '#FB923C', // Light Orange
    '#818CF8', // Light Indigo
  ],
  // Muted palette - subtle and elegant
  muted: [
    '#64748B', // Slate
    '#94A3B8', // Light Slate
    '#A1A1AA', // Zinc
    '#D1D5DB', // Light Gray
    '#6B7280', // Gray
    '#9CA3AF', // Light Gray
    '#374151', // Dark Gray
    '#6B7280', // Medium Gray
    '#9CA3AF', // Light Gray
    '#D1D5DB', // Very Light Gray
  ],
} as const;

// Color cache to ensure consistent colors for same categories
const colorCache = new Map<string, string>();

/**
 * Generates a consistent, professional color for chart data
 * @param identifier - Unique identifier (e.g., category name, subcategory name)
 * @param palette - Color palette to use ('primary', 'secondary', or 'muted')
 * @returns Hex color code
 */
export function generateChartColor(
  identifier: string,
  palette: keyof typeof CHART_COLOR_PALETTES = 'primary'
): string {
  // Check if we already have a color for this identifier
  const cacheKey = `${identifier}-${palette}`;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!;
  }

  // Generate a consistent hash from the identifier
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value to ensure positive index
  const colorIndex = Math.abs(hash) % CHART_COLOR_PALETTES[palette].length;
  const color = CHART_COLOR_PALETTES[palette][colorIndex];

  // Cache the color for future use
  colorCache.set(cacheKey, color!);
  return color!;
}

/**
 * Generates multiple colors for a list of items
 * @param items - Array of items with identifiers
 * @param palette - Color palette to use
 * @returns Array of items with colors assigned
 */
export function generateColorsForItems<T extends Record<string, unknown>>(
  items: T[],
  identifierKey: keyof T,
  palette: keyof typeof CHART_COLOR_PALETTES = 'primary'
): (T & { color: string })[] {
  return items.map((item) => ({
    ...item,
    color: generateChartColor(String(item[identifierKey]), palette),
  }));
}

/**
 * Clears the color cache (useful for testing or if you want to regenerate colors)
 */
export function clearColorCache(): void {
  colorCache.clear();
}

// Legacy function for backward compatibility (now uses the new system)
export function generateRandomColor(): string {
  return generateChartColor('random-' + Math.random().toString(36), 'primary');
}
