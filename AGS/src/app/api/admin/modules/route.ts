import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AnalysisModule {
  id: string;
  name: string;
  description: string;
  category: 'soil' | 'leaf' | 'environmental' | 'economic' | 'sustainability';
  version: string;
  isActive: boolean;
  config: {
    inputParams: Array<{
      name: string;
      type: 'number' | 'string' | 'boolean' | 'select';
      required: boolean;
      options?: string[];
      validation?: any;
    }>;
    outputFormat: any;
    algorithms: string[];
    dependencies: string[];
  };
  performance: {
    accuracy: number;
    processingTime: number;
    reliability: number;
  };
  malaysianContext: {
    regions: string[];
    soilTypes: string[];
    climaticZones: string[];
    certifications: string[];
  };
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'technical' | 'regulatory' | 'commercial';
  fileTypes: string[];
  processingRules: {
    extractionMethod: 'ocr' | 'text' | 'structured' | 'ai';
    embeddingModel: string;
    chunkSize: number;
    overlap: number;
    preprocessing: string[];
  };
  qualityMetrics: {
    malaysianRelevance: number;
    scientificRigor: number;
    practicalValue: number;
  };
  isActive: boolean;
}

interface ReferenceSource {
  id: string;
  name: string;
  description: string;
  type: 'database' | 'api' | 'file' | 'web';
  url?: string;
  accessConfig: any;
  updateFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'manual';
  dataFormat: string;
  trustScore: number;
  malaysianFocus: boolean;
  isActive: boolean;
}

// GET - Retrieve all modules, document types, and reference sources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const results: any = {};

    if (type === 'all' || type === 'modules') {
      const { data: modules } = await supabase
        .from('analysis_modules')
        .select('*')
        .order('created_at', { ascending: false });
      
      results.modules = modules?.map(module => ({
        id: module.id,
        name: module.name,
        description: module.description,
        category: module.category,
        version: module.version,
        isActive: module.is_active,
        config: module.config || {},
        performance: module.performance_metrics || {},
        malaysianContext: module.malaysian_context || {},
        createdAt: module.created_at,
        updatedAt: module.updated_at
      })) || [];
    }

    if (type === 'all' || type === 'document-types') {
      const { data: documentTypes } = await supabase
        .from('document_types')
        .select('*')
        .order('created_at', { ascending: false });
      
      results.documentTypes = documentTypes?.map(docType => ({
        id: docType.id,
        name: docType.name,
        description: docType.description,
        category: docType.category,
        fileTypes: docType.file_types || [],
        processingRules: docType.processing_rules || {},
        qualityMetrics: docType.quality_metrics || {},
        isActive: docType.is_active,
        createdAt: docType.created_at,
        updatedAt: docType.updated_at
      })) || [];
    }

    if (type === 'all' || type === 'reference-sources') {
      const { data: referenceSources } = await supabase
        .from('reference_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      results.referenceSources = referenceSources?.map(source => ({
        id: source.id,
        name: source.name,
        description: source.description,
        type: source.type,
        url: source.url,
        accessConfig: source.access_config || {},
        updateFrequency: source.update_frequency,
        dataFormat: source.data_format,
        trustScore: source.trust_score,
        malaysianFocus: source.malaysian_focus,
        isActive: source.is_active,
        createdAt: source.created_at,
        updatedAt: source.updated_at
      })) || [];
    }

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Modules API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

// POST - Create new module, document type, or reference source
export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'module':
        result = await createAnalysisModule(data);
        break;
      case 'document-type':
        result = await createDocumentType(data);
        break;
      case 'reference-source':
        result = await createReferenceSource(data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${type} created successfully`
    });

  } catch (error) {
    console.error('Modules API POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}

// PUT - Update existing module, document type, or reference source
export async function PUT(request: NextRequest) {
  try {
    const { type, id, data } = await request.json();

    if (!type || !id || !data) {
      return NextResponse.json(
        { error: 'Type, ID, and data are required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'module':
        result = await updateAnalysisModule(id, data);
        break;
      case 'document-type':
        result = await updateDocumentType(id, data);
        break;
      case 'reference-source':
        result = await updateReferenceSource(id, data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${type} updated successfully`
    });

  } catch (error) {
    console.error('Modules API PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

// DELETE - Remove module, document type, or reference source
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    let tableName;
    switch (type) {
      case 'module':
        tableName = 'analysis_modules';
        break;
      case 'document-type':
        tableName = 'document_types';
        break;
      case 'reference-source':
        tableName = 'reference_sources';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`
    });

  } catch (error) {
    console.error('Modules API DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}

// Helper functions for creating different types
async function createAnalysisModule(moduleData: AnalysisModule) {
  const { data, error } = await supabase
    .from('analysis_modules')
    .insert({
      name: moduleData.name,
      description: moduleData.description,
      category: moduleData.category,
      version: moduleData.version,
      is_active: moduleData.isActive,
      config: moduleData.config,
      performance_metrics: moduleData.performance,
      malaysian_context: moduleData.malaysianContext,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function createDocumentType(docTypeData: DocumentType) {
  const { data, error } = await supabase
    .from('document_types')
    .insert({
      name: docTypeData.name,
      description: docTypeData.description,
      category: docTypeData.category,
      file_types: docTypeData.fileTypes,
      processing_rules: docTypeData.processingRules,
      quality_metrics: docTypeData.qualityMetrics,
      is_active: docTypeData.isActive,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function createReferenceSource(sourceData: ReferenceSource) {
  const { data, error } = await supabase
    .from('reference_sources')
    .insert({
      name: sourceData.name,
      description: sourceData.description,
      type: sourceData.type,
      url: sourceData.url,
      access_config: sourceData.accessConfig,
      update_frequency: sourceData.updateFrequency,
      data_format: sourceData.dataFormat,
      trust_score: sourceData.trustScore,
      malaysian_focus: sourceData.malaysianFocus,
      is_active: sourceData.isActive,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateAnalysisModule(id: string, moduleData: Partial<AnalysisModule>) {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (moduleData.name) updateData.name = moduleData.name;
  if (moduleData.description) updateData.description = moduleData.description;
  if (moduleData.category) updateData.category = moduleData.category;
  if (moduleData.version) updateData.version = moduleData.version;
  if (moduleData.isActive !== undefined) updateData.is_active = moduleData.isActive;
  if (moduleData.config) updateData.config = moduleData.config;
  if (moduleData.performance) updateData.performance_metrics = moduleData.performance;
  if (moduleData.malaysianContext) updateData.malaysian_context = moduleData.malaysianContext;

  const { data, error } = await supabase
    .from('analysis_modules')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateDocumentType(id: string, docTypeData: Partial<DocumentType>) {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (docTypeData.name) updateData.name = docTypeData.name;
  if (docTypeData.description) updateData.description = docTypeData.description;
  if (docTypeData.category) updateData.category = docTypeData.category;
  if (docTypeData.fileTypes) updateData.file_types = docTypeData.fileTypes;
  if (docTypeData.processingRules) updateData.processing_rules = docTypeData.processingRules;
  if (docTypeData.qualityMetrics) updateData.quality_metrics = docTypeData.qualityMetrics;
  if (docTypeData.isActive !== undefined) updateData.is_active = docTypeData.isActive;

  const { data, error } = await supabase
    .from('document_types')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateReferenceSource(id: string, sourceData: Partial<ReferenceSource>) {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (sourceData.name) updateData.name = sourceData.name;
  if (sourceData.description) updateData.description = sourceData.description;
  if (sourceData.type) updateData.type = sourceData.type;
  if (sourceData.url) updateData.url = sourceData.url;
  if (sourceData.accessConfig) updateData.access_config = sourceData.accessConfig;
  if (sourceData.updateFrequency) updateData.update_frequency = sourceData.updateFrequency;
  if (sourceData.dataFormat) updateData.data_format = sourceData.dataFormat;
  if (sourceData.trustScore !== undefined) updateData.trust_score = sourceData.trustScore;
  if (sourceData.malaysianFocus !== undefined) updateData.malaysian_focus = sourceData.malaysianFocus;
  if (sourceData.isActive !== undefined) updateData.is_active = sourceData.isActive;

  const { data, error } = await supabase
    .from('reference_sources')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
} 