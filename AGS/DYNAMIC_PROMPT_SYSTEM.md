# Dynamic Prompt Management System

## Overview

The Dynamic Prompt Management System is a comprehensive solution that addresses the limitations of static, hardcoded prompts by providing runtime prompt modification capabilities, Malaysian-specific expertise integration, and intelligent prompt selection based on context.

## Key Features

### 1. **Runtime Prompt Modification**
- Edit prompts after deployment without code changes
- Real-time prompt updates without system restart
- Version control and rollback capabilities
- A/B testing for prompt optimization

### 2. **Malaysian-Specific Expertise**
- MPOB (Malaysian Palm Oil Board) guidelines integration
- Regional climate and soil condition considerations
- Local supplier and fertilizer brand recommendations
- RSPO (Roundtable on Sustainable Palm Oil) compliance
- Malaysian Ringgit cost analysis

### 3. **Intelligent Prompt Selection**
- Context-aware template selection based on:
  - Sample type (soil/leaf)
  - User priorities (sustainability/cost/yield/balanced)
  - Budget constraints (high/medium/low)
  - Soil type (mineral/peat/coastal)
  - Palm variety (tenera/dura/pisifera)

### 4. **Enhanced Specificity and Constraints**
- High-specificity prompts with detailed constraints
- Scientific rigor levels (high/medium/low)
- Malaysian context integration
- Specificity levels (high/medium/low)

## System Architecture

### Database Schema

```sql
-- Enhanced prompt_templates table
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    category VARCHAR(50) NOT NULL CHECK (category IN ('soil', 'leaf', 'general', 'interpretation', 'recommendations', 'malaysian_specific')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    constraints TEXT[] DEFAULT '{}',
    examples TEXT[] DEFAULT '{}',
    context_rules TEXT[] DEFAULT '{}',
    specificity_level VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (specificity_level IN ('high', 'medium', 'low')),
    malaysian_context BOOLEAN NOT NULL DEFAULT false,
    scientific_rigor VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (scientific_rigor IN ('high', 'medium', 'low')),
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    usage_count INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(3,2) NOT NULL DEFAULT 0.80 CHECK (success_rate >= 0 AND success_rate <= 1),
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
```

### Core Components

#### 1. DynamicPromptManager (`lib/dynamic-prompt-manager.ts`)
- Manages prompt template lifecycle
- Implements intelligent prompt selection algorithm
- Handles context-specific modifications
- Provides analytics and usage tracking

#### 2. Enhanced LangChain Analyzer (`lib/langchain-analyzer.ts`)
- Integrates with DynamicPromptManager
- Applies context-specific modifications
- Handles template parsing and error recovery
- Enhanced RAG context integration

#### 3. Admin Interface (`src/app/admin/prompts/page.tsx`)
- Real-time prompt template management
- Analytics dashboard
- Template performance tracking
- A/B testing capabilities

## Usage Examples

### Creating a Malaysian-Specific Prompt

```typescript
const template = await dynamicPromptManager.createTemplate({
  name: 'Malaysian Peat Soil Expert',
  description: 'Specialized prompt for peat soil analysis in Malaysian oil palm plantations',
  template: `You are Dr. Ahmad bin Ismail, a senior agronomist with 25 years of experience...`,
  category: 'soil',
  priority: 'high',
  specificity_level: 'high',
  malaysian_context: true,
  scientific_rigor: 'high',
  constraints: [
    'Must reference MPOB guidelines',
    'Include peat soil subsidence considerations',
    'Provide local supplier recommendations'
  ],
  context_rules: [
    'Always consider regional weather patterns',
    'Reference local research institutions'
  ]
});
```

### Getting Optimal Prompt for Context

```typescript
const context: PromptContext = {
  sampleType: 'soil',
  userPriorities: {
    focus: 'sustainability',
    budget: 'medium',
    timeframe: 'long_term',
    language: 'en',
    plantationType: 'tenera',
    soilType: 'peat'
  },
  dataValues: soilData,
  referenceData: referenceStandards,
  nutrientBalance: calculatedBalance,
  benchmarking: regionalBenchmark,
  referenceContext: ragContext
};

const optimalPrompt = await dynamicPromptManager.getOptimalPrompt(context);
```

## Malaysian Expertise Integration

### MPOB Guidelines
- Critical nutrient levels for Tenera palms
- Soil classification standards
- Fertilizer application recommendations
- Yield optimization guidelines

### Regional Considerations
- Monsoon season timing
- Tropical climate impacts
- Regional pest and disease pressures
- Local soil conditions

### Sustainability Focus
- RSPO compliance requirements
- Carbon sequestration strategies
- Biodiversity conservation
- Water management practices

## Error Fixes Implemented

### 1. Template Parsing Error
**Issue**: `Single '}' in template` error due to unescaped curly braces
**Solution**: Added template escaping in `buildComprehensivePrompt` method

```typescript
const escapedDynamicPrompt = dynamicPrompt.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
```

### 2. Database Type Mismatch
**Issue**: `Returned type character varying(500) does not match expected type text`
**Solution**: Updated `search_document_embeddings` function return types

```sql
CREATE OR REPLACE FUNCTION search_document_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float,
  document_title varchar(500),
  document_source varchar(500),
  chunk_index int
)
```

### 3. Generic Response Prevention
**Issue**: Vague, non-specific analysis results
**Solution**: 
- High-specificity prompts with detailed constraints
- Malaysian context integration
- Scientific rigor requirements
- Specific cost analysis in Malaysian Ringgit

## Analytics and Monitoring

### Template Performance Metrics
- Usage count tracking
- Success rate calculation
- Category distribution analysis
- Most used template identification

### Real-time Analytics Dashboard
- Total templates count
- Active templates count
- Average success rate
- Category distribution visualization

## Deployment Instructions

### 1. Database Migration
```bash
# Run the migration to update schema
psql -d your_database -f supabase/migrations/20250111_add_dynamic_prompt_management.sql
```

### 2. Seed Default Templates
```bash
# Insert Malaysian-specific templates
psql -d your_database -f supabase/seed-prompts.sql
```

### 3. Environment Variables
Ensure the following environment variables are set:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Benefits

### 1. **Non-Generic Results**
- Malaysian-specific expertise integration
- Detailed constraints and context rules
- Scientific rigor requirements
- Local supplier and cost considerations

### 2. **Runtime Flexibility**
- Edit prompts without code deployment
- Real-time prompt optimization
- A/B testing capabilities
- Performance-based prompt selection

### 3. **Enhanced RAG Integration**
- Malaysian-specific document retrieval
- Scientific reference integration
- Context-aware search queries
- Enhanced relevance scoring

### 4. **Client Adaptation**
- Dynamic prompt evolution
- Client-specific customization
- Performance tracking and optimization
- Continuous improvement capabilities

## Future Enhancements

### 1. **Machine Learning Integration**
- Automated prompt optimization
- Performance prediction models
- Dynamic constraint adjustment
- Intelligent prompt generation

### 2. **Advanced Analytics**
- Detailed performance metrics
- User satisfaction tracking
- ROI analysis for prompt changes
- Predictive analytics for prompt effectiveness

### 3. **Multi-Language Support**
- Bahasa Malaysia prompts
- Regional dialect considerations
- Cultural context integration
- Localized constraint sets

## Conclusion

The Dynamic Prompt Management System transforms the static, hardcoded prompt approach into a flexible, intelligent, and Malaysian-specific solution that provides:

- **Unique, non-generic analysis results** through high-specificity prompts and Malaysian expertise integration
- **Runtime prompt modification** without requiring code changes or system restarts
- **Intelligent prompt selection** based on context and user preferences
- **Enhanced RAG integration** with Malaysian-specific document retrieval
- **Continuous improvement** through analytics and performance tracking

This system ensures that the AI assistant provides truly valuable, context-specific recommendations that reflect deep understanding of Malaysian oil palm cultivation practices, regulations, and local conditions. 