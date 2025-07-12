import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Generic validation wrapper for API routes
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      let data: unknown;

      // Get data based on HTTP method
      if (req.method === 'GET' || req.method === 'DELETE') {
        // For GET/DELETE, validate query parameters
        const url = new URL(req.url);
        data = Object.fromEntries(url.searchParams.entries());
      } else {
        // For POST/PUT/PATCH, validate request body
        data = await req.json();
      }

      // Validate the data
      const validatedData = schema.parse(data);

      // Call the original handler with validated data
      return await handler(req, validatedData);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }

      console.error('API validation error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Validation for multipart form data
export function withFormValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T, formData: FormData) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const formData = await req.formData();
      
      // Convert FormData to plain object
      const data: { [key: string]: any } = {};
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (key.endsWith('[]')) {
          // Handle array fields
          const arrayKey = key.slice(0, -2);
          if (!data[arrayKey]) data[arrayKey] = [];
          data[arrayKey].push(value);
        } else if (data[key]) {
          // Convert to array if multiple values with same key
          if (Array.isArray(data[key])) {
            data[key].push(value);
          } else {
            data[key] = [data[key], value];
          }
        } else {
          // Convert string numbers to numbers
          if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) {
            data[key] = parseFloat(value);
          } else if (typeof value === 'string' && /^(true|false)$/i.test(value)) {
            data[key] = value.toLowerCase() === 'true';
          } else {
            data[key] = value;
          }
        }
      });

      // Validate the data
      const validatedData = schema.parse(data);

      // Call the original handler with validated data
      return await handler(req, validatedData, formData);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      console.error('Form validation error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Query parameter validation helper
export function validateQueryParams<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): T {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return schema.parse(params);
}

// Request body validation helper
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}

// File upload validation
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    requiredFields?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], requiredFields = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

// Response validation (useful for ensuring API consistency)
export function validateResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  return schema.parse(data);
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .slice(0, 1000); // Limit length
}

export function sanitizeNumber(input: string | number): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? null : num;
}

export function sanitizeBoolean(input: string | boolean): boolean {
  if (typeof input === 'boolean') return input;
  return input === 'true' || input === '1';
}

// Rate limiting validation
export function createRateLimitKey(req: NextRequest, suffix: string = ''): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return `rate_limit:${ip}:${suffix}`;
}

// Common validation patterns
export const commonPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  slug: /^[a-z0-9\-]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  url: /^https?:\/\/.+/,
};

// Validation error formatter
export function formatValidationError(error: z.ZodError): {
  message: string;
  fields: { [key: string]: string };
} {
  const fields: { [key: string]: string } = {};
  
  error.errors.forEach(err => {
    const fieldPath = err.path.join('.');
    fields[fieldPath] = err.message;
  });

  return {
    message: `Validation failed for ${Object.keys(fields).length} field(s)`,
    fields,
  };
} 