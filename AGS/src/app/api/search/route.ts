import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Search request schema
const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().array().optional(),
  status: z.string().array().optional(),
  location: z.string().optional(),
  tags: z.string().array().optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  sortBy: z.string().default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  tables: z.string().array().optional(), // Which tables to search
});

// Inline validation function
function validateQueryParams(req: NextRequest, schema: z.ZodSchema<any>) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return schema.parse(params);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Validate query parameters
    const params = validateQueryParams(request, searchSchema);
    
    // Parse comma-separated arrays from query params
    if (typeof params.category === 'string') {
      params.category = params.category.split(',').filter(Boolean);
    }
    if (typeof params.status === 'string') {
      params.status = params.status.split(',').filter(Boolean);
    }
    if (typeof params.tags === 'string') {
      params.tags = params.tags.split(',').filter(Boolean);
    }
    if (typeof params.tables === 'string') {
      params.tables = params.tables.split(',').filter(Boolean);
    }

    // Default tables to search if not specified
    const searchTables = params.tables || [
      'analyses',
      'reference_documents',
      'user_feedback',
      'prompt_templates',
    ];

    const results: any[] = [];
    const facets = {
      categories: {} as { [key: string]: number },
      locations: {} as { [key: string]: number },
      tags: {} as { [key: string]: number },
      statuses: {} as { [key: string]: number },
    };

    // Search each table
    for (const table of searchTables) {
      const tableResults = await searchTable(supabase, table, params);
      results.push(...tableResults);
      
      // Update facets
      tableResults.forEach((result: any) => {
        // Category facets
        if (result.category) {
          facets.categories[result.category] = (facets.categories[result.category] || 0) + 1;
        }
        
        // Location facets
        if (result.location) {
          facets.locations[result.location] = (facets.locations[result.location] || 0) + 1;
        }
        
        // Status facets
        if (result.status) {
          facets.statuses[result.status] = (facets.statuses[result.status] || 0) + 1;
        }
        
        // Tag facets
        if (result.tags && Array.isArray(result.tags)) {
          result.tags.forEach((tag: string) => {
            facets.tags[tag] = (facets.tags[tag] || 0) + 1;
          });
        }
      });
    }

    // Sort results
    const sortedResults = sortResults(results, params.sortBy, params.sortOrder);
    
    // Apply pagination
    const paginatedResults = sortedResults.slice(params.offset, params.offset + params.limit);
    
    // Generate suggestions for empty results
    const suggestions = results.length === 0 && params.query 
      ? await generateSuggestions(supabase, params.query)
      : [];

    return NextResponse.json({
      results: paginatedResults,
      total: results.length,
      facets,
      suggestions,
      query: params,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function searchTable(supabase: any, table: string, params: any) {
  let query = supabase.from(table).select('*');
  
  // Apply text search if query provided
  if (params.query) {
    switch (table) {
      case 'analyses':
        query = query.or(`analysis_type.ilike.%${params.query}%,recommendations.ilike.%${params.query}%,notes.ilike.%${params.query}%`);
        break;
      case 'reference_documents':
        query = query.or(`filename.ilike.%${params.query}%,original_name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
        break;
      case 'user_feedback':
        query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
        break;
      case 'prompt_templates':
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%,template.ilike.%${params.query}%`);
        break;
      default:
        // Generic search for other tables
        query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,name.ilike.%${params.query}%`);
    }
  }

  // Apply category filter
  if (params.category && params.category.length > 0) {
    if (table === 'reference_documents') {
      query = query.in('category', params.category);
    } else if (table === 'analyses') {
      query = query.in('analysis_type', params.category);
    } else if (table === 'prompt_templates') {
      query = query.in('category', params.category);
    }
  }

  // Apply status filter
  if (params.status && params.status.length > 0) {
    if (table === 'analyses') {
      query = query.in('status', params.status);
    } else if (table === 'reference_documents') {
      query = query.in('upload_status', params.status);
    }
  }

  // Apply location filter
  if (params.location) {
    if (table === 'analyses') {
      query = query.ilike('location', `%${params.location}%`);
    }
  }

  // Apply date range filter
  if (params.dateRange) {
    query = query
      .gte('created_at', params.dateRange.start)
      .lte('created_at', params.dateRange.end);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error(`Error searching ${table}:`, error);
    return [];
  }

  // Transform results to common format
  return (data || []).map((item: any) => transformResult(item, table, params.query));
}

function transformResult(item: any, table: string, query?: string): any {
  const baseResult = {
    id: item.id,
    table,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    relevanceScore: query ? calculateRelevanceScore(item, query, table) : 1,
  };

  switch (table) {
    case 'analyses':
      return {
        ...baseResult,
        title: `${item.analysis_type} Analysis - ${item.sample_location || 'Unknown Location'}`,
        description: item.recommendations || item.notes,
        category: item.analysis_type,
        location: item.sample_location,
        status: item.status,
        tags: item.tags || [],
        data: item,
      };

    case 'reference_documents':
      return {
        ...baseResult,
        title: item.original_name || item.filename,
        description: item.description,
        category: item.category,
        location: null,
        status: item.upload_status,
        tags: item.tags || [],
        data: item,
      };

    case 'user_feedback':
      return {
        ...baseResult,
        title: item.title,
        description: item.description,
        category: item.type,
        location: null,
        status: item.status || 'pending',
        tags: [item.category],
        data: item,
      };

    case 'prompt_templates':
      return {
        ...baseResult,
        title: item.name,
        description: item.description,
        category: item.category,
        location: null,
        status: item.is_active ? 'active' : 'inactive',
        tags: item.variables || [],
        data: item,
      };

    default:
      return {
        ...baseResult,
        title: item.title || item.name || `${table} #${item.id}`,
        description: item.description || item.notes,
        category: item.category || table,
        location: item.location,
        status: item.status,
        tags: item.tags || [],
        data: item,
      };
  }
}

function calculateRelevanceScore(item: any, query: string, table: string): number {
  const searchableFields = getSearchableFields(item, table);
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  let score = 0;
  let totalPossibleScore = 0;

  searchableFields.forEach(({ field, weight = 1 }) => {
    if (field) {
      const fieldText = String(field).toLowerCase();
      queryTerms.forEach(term => {
        totalPossibleScore += weight;
        if (fieldText.includes(term)) {
          // Exact match gets full weight
          if (fieldText === term) {
            score += weight;
          }
          // Partial match gets partial weight
          else {
            score += weight * 0.5;
          }
        }
      });
    }
  });

  return totalPossibleScore > 0 ? score / totalPossibleScore : 0;
}

function getSearchableFields(item: any, table: string): Array<{ field: string; weight: number }> {
  switch (table) {
    case 'analyses':
      return [
        { field: item.analysis_type, weight: 3 },
        { field: item.sample_location, weight: 2 },
        { field: item.recommendations, weight: 2 },
        { field: item.notes, weight: 1 },
      ];
    case 'reference_documents':
      return [
        { field: item.original_name, weight: 3 },
        { field: item.filename, weight: 2 },
        { field: item.description, weight: 2 },
        { field: item.category, weight: 1 },
      ];
    case 'user_feedback':
      return [
        { field: item.title, weight: 3 },
        { field: item.description, weight: 2 },
        { field: item.type, weight: 1 },
      ];
    case 'prompt_templates':
      return [
        { field: item.name, weight: 3 },
        { field: item.description, weight: 2 },
        { field: item.template, weight: 1 },
      ];
    default:
      return [
        { field: item.title || item.name, weight: 3 },
        { field: item.description, weight: 2 },
      ];
  }
}

function sortResults(results: any[], sortBy: string, sortOrder: 'asc' | 'desc') {
  return results.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'relevance':
        aValue = a.relevanceScore || 0;
        bValue = b.relevanceScore || 0;
        break;
      case 'created_at':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'updated_at':
        aValue = new Date(a.updatedAt || a.createdAt).getTime();
        bValue = new Date(b.updatedAt || b.createdAt).getTime();
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        aValue = a.relevanceScore || 0;
        bValue = b.relevanceScore || 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
}

async function generateSuggestions(supabase: any, query: string): Promise<string[]> {
  // Simple suggestion generation based on existing data
  const suggestions: string[] = [];
  
  try {
    // Get common terms from analyses
    const { data: analyses } = await supabase
      .from('analyses')
      .select('analysis_type, sample_location')
      .limit(100);

    // Get common terms from documents
    const { data: documents } = await supabase
      .from('reference_documents')
      .select('original_name, category')
      .limit(100);

    // Extract terms and find similar ones
    const allTerms = new Set<string>();
    
    analyses?.forEach((item: any) => {
      if (item.analysis_type) allTerms.add(item.analysis_type.toLowerCase());
      if (item.sample_location) allTerms.add(item.sample_location.toLowerCase());
    });

    documents?.forEach((item: any) => {
      if (item.category) allTerms.add(item.category.toLowerCase());
      if (item.original_name) {
        // Extract words from filename
        const words = item.original_name.toLowerCase().split(/[\s_-]+/);
        words.forEach((word: string) => {
          if (word.length > 3) allTerms.add(word);
        });
      }
    });

    // Find similar terms using simple string matching
    const queryLower = query.toLowerCase();
    Array.from(allTerms)
      .filter(term => 
        term.includes(queryLower) || 
        queryLower.includes(term) ||
        levenshteinDistance(term, queryLower) <= 2
      )
      .slice(0, 5)
      .forEach(term => suggestions.push(term));

  } catch (error) {
    console.error('Error generating suggestions:', error);
  }

  return suggestions;
}

// Simple Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
} 