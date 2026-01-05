import type { InterpolationParams, ExtendedInterpolationParams, FormatterOptions } from '../types';

/**
 * Interpolate values into a translation string
 * Supports {{key}} syntax for interpolation
 */
export function interpolate(
  template: string,
  params: InterpolationParams = {}
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    
    if (value === undefined || value === null) {
      // In development, show the key for debugging
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn(`Missing interpolation value for key: ${key}`);
        return `[${key}]`;
      }
      return match; // Return original placeholder in production
    }
    
    return String(value);
  });
}

/**
 * Extract interpolation keys from a template string
 */
export function extractInterpolationKeys(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  
  return matches.map(match => match.replace(/\{\{|\}\}/g, ''));
}

/**
 * Validate that all required interpolation keys are provided
 */
export function validateInterpolationParams(
  template: string,
  params: InterpolationParams
): { isValid: boolean; missingKeys: string[] } {
  const requiredKeys = extractInterpolationKeys(template);
  const providedKeys = Object.keys(params);
  const missingKeys = requiredKeys.filter(key => !providedKeys.includes(key));
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}

/**
 * Escape HTML characters in interpolation values for security
 */
export function escapeHtml(value: string | number): string {
  const str = String(value);
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return str.replace(/[&<>"']/g, char => htmlEscapes[char] || char);
}

/**
 * Safe interpolation with HTML escaping
 */
export function safeInterpolate(
  template: string,
  params: InterpolationParams = {},
  escapeValues = true
): string {
  const processedParams = escapeValues
    ? Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, escapeHtml(value)])
      )
    : params;
    
  return interpolate(template, processedParams);
}

/**
 * Format numbers for interpolation based on locale
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format dates for interpolation based on locale
 */
export function formatDate(
  value: Date | string | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Advanced interpolation with formatting support
 */
export function advancedInterpolate(
  template: string,
  params: ExtendedInterpolationParams = {},
  locale: string = 'en-US'
): string {
  return template.replace(/\{\{(\w+)(?::(\w+)(?:\(([^)]*)\))?)?\}\}/g, (match, key, formatter, args) => {
    const value = params[key];
    
    if (value === undefined || value === null) {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn(`Missing interpolation value for key: ${key}`);
        return `[${key}]`;
      }
      return match;
    }
    
    // Apply formatter if specified
    if (formatter) {
      try {
        switch (formatter) {
          case 'number':
            if (typeof value === 'number') {
              const options = args ? JSON.parse(`{${args}}`) : undefined;
              return formatNumber(value, locale, options);
            }
            break;
          case 'date':
            if (value instanceof Date || typeof value === 'string' || typeof value === 'number') {
              const options = args ? JSON.parse(`{${args}}`) : undefined;
              return formatDate(value, locale, options);
            }
            break;
          case 'currency':
            if (typeof value === 'number') {
              return formatNumber(value, locale, { style: 'currency', currency: args || 'USD' });
            }
            break;
          case 'percent':
            if (typeof value === 'number') {
              return formatNumber(value / 100, locale, { style: 'percent' });
            }
            break;
          case 'upper':
            return String(value).toUpperCase();
          case 'lower':
            return String(value).toLowerCase();
          case 'capitalize':
            return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
        }
      } catch (error) {
        console.warn(`Error applying formatter ${formatter} to value ${value}:`, error);
      }
    }
    
    return String(value);
  });
}

/**
 * Check if template has advanced formatting syntax
 */
export function hasAdvancedFormatting(template: string): boolean {
  return /\{\{\w+:\w+/.test(template);
}

/**
 * Batch interpolation for multiple templates
 */
export function batchInterpolate(
  templates: Record<string, string>,
  params: InterpolationParams = {}
): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, template] of Object.entries(templates)) {
    result[key] = interpolate(template, params);
  }
  
  return result;
}