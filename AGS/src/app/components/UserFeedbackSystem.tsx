'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Send,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  DollarSign,
  Leaf,
  X
} from 'lucide-react';

interface Recommendation {
  id: string;
  recommendation: string;
  reasoning?: string;
  estimatedImpact?: string;
  priority?: 'High' | 'Medium' | 'Low';
  investmentLevel?: string;
  category?: 'nutrition' | 'disease' | 'yield' | 'sustainability' | 'cost';
}

interface FeedbackData {
  recommendationId: string;
  rating: number;
  helpful: boolean | null;
  comment: string;
  category: 'accuracy' | 'usefulness' | 'clarity' | 'completeness' | 'other';
  improvementSuggestions: string[];
  implemented: boolean;
  results?: string;
}

interface UserFeedbackSystemProps {
  recommendations: Recommendation[];
  analysisId: string;
  onFeedbackSubmit: (feedback: FeedbackData) => void;
  allowAnonymous?: boolean;
}

const FEEDBACK_CATEGORIES = [
  { id: 'accuracy', label: 'Accuracy', icon: Target, color: 'blue' },
  { id: 'usefulness', label: 'Usefulness', icon: TrendingUp, color: 'green' },
  { id: 'clarity', label: 'Clarity', icon: MessageSquare, color: 'purple' },
  { id: 'completeness', label: 'Completeness', icon: CheckCircle, color: 'orange' },
  { id: 'other', label: 'Other', icon: AlertCircle, color: 'gray' }
];

const IMPROVEMENT_SUGGESTIONS = [
  'More specific quantities/measurements',
  'Additional cost-benefit analysis',
  'Timeline for implementation',
  'Alternative approaches',
  'Local supplier recommendations',
  'Seasonal considerations',
  'Risk mitigation strategies',
  'Expected results timeline'
];

export default function UserFeedbackSystem({ 
  recommendations, 
  analysisId, 
  onFeedbackSubmit,
  allowAnonymous = true 
}: UserFeedbackSystemProps) {
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<Record<string, Partial<FeedbackData>>>({});
  const [submittedFeedback, setSubmittedFeedback] = useState<Set<string>>(new Set());

  const initializeFeedback = (recommendationId: string): FeedbackData => ({
    recommendationId,
    rating: 0,
    helpful: null,
    comment: '',
    category: 'usefulness',
    improvementSuggestions: [],
    implemented: false,
    results: ''
  });

  const updateFeedback = (recommendationId: string, updates: Partial<FeedbackData>) => {
    setFeedbackData(prev => ({
      ...prev,
      [recommendationId]: {
        ...initializeFeedback(recommendationId),
        ...prev[recommendationId],
        ...updates
      }
    }));
  };

  const submitFeedback = async (recommendationId: string) => {
    const feedback = feedbackData[recommendationId];
    if (!feedback || feedback.rating === 0) return;

    try {
      // Submit to API
      const response = await fetch('/api/user-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          ...feedback
        })
      });

      if (response.ok) {
        setSubmittedFeedback(prev => new Set([...Array.from(prev), recommendationId]));
        setActiveFeedback(null);
        onFeedbackSubmit(feedback as FeedbackData);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = FEEDBACK_CATEGORIES.find(cat => cat.id === category);
    return categoryData?.icon || AlertCircle;
  };

  const getCategoryColor = (category: string) => {
    const categoryData = FEEDBACK_CATEGORIES.find(cat => cat.id === category);
    return categoryData?.color || 'gray';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (category?: string) => {
    switch (category) {
      case 'nutrition': return Leaf;
      case 'disease': return AlertCircle;
      case 'yield': return TrendingUp;
      case 'cost': return DollarSign;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
          Rate & Improve Recommendations
        </h3>
        <p className="text-gray-600 mb-6">
          Your feedback helps improve our AI system for better future recommendations.
        </p>

        <div className="space-y-6">
          {recommendations.map((recommendation, index) => {
            const feedbackId = `${analysisId}-${index}`;
            const currentFeedback = feedbackData[feedbackId];
            const isSubmitted = submittedFeedback.has(feedbackId);
            const isActive = activeFeedback === feedbackId;
            const RecommendationIcon = getRecommendationIcon(recommendation.category);

            return (
              <motion.div
                key={feedbackId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border-2 rounded-xl p-6 transition-all ${
                  isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white/50'
                }`}
              >
                {/* Recommendation Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <RecommendationIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">
                        {recommendation.recommendation}
                      </h4>
                      {recommendation.reasoning && (
                        <p className="text-gray-700 text-sm mb-2">
                          <strong>Reasoning:</strong> {recommendation.reasoning}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {recommendation.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            getPriorityColor(recommendation.priority)
                          }`}>
                            {recommendation.priority} Priority
                          </span>
                        )}
                        {recommendation.estimatedImpact && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {recommendation.estimatedImpact}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isSubmitted ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Feedback Submitted</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveFeedback(isActive ? null : feedbackId)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {isActive ? 'Cancel' : 'Rate'}
                    </button>
                  )}
                </div>

                {/* Feedback Form */}
                <AnimatePresence>
                  {isActive && !isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 pt-6 mt-6"
                    >
                      {/* Star Rating */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          Overall Rating
                        </label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => updateFeedback(feedbackId, { rating: star })}
                              className="transition-colors"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= (currentFeedback?.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Helpful Buttons */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          Was this recommendation helpful?
                        </label>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => updateFeedback(feedbackId, { helpful: true })}
                            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                              currentFeedback?.helpful === true
                                ? 'bg-green-100 border-green-300 text-green-800'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Yes, helpful
                          </button>
                          <button
                            onClick={() => updateFeedback(feedbackId, { helpful: false })}
                            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                              currentFeedback?.helpful === false
                                ? 'bg-red-100 border-red-300 text-red-800'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50'
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Needs improvement
                          </button>
                        </div>
                      </div>

                      {/* Feedback Category */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          Feedback Category
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {FEEDBACK_CATEGORIES.map((category) => {
                            const Icon = category.icon;
                            const isSelected = currentFeedback?.category === category.id;
                            return (
                              <button
                                key={category.id}
                                onClick={() => updateFeedback(feedbackId, { category: category.id as any })}
                                className={`flex items-center p-3 rounded-lg border transition-colors ${
                                  isSelected
                                    ? `bg-${category.color}-100 border-${category.color}-300 text-${category.color}-800`
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <Icon className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">{category.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Improvement Suggestions */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          How can we improve this recommendation? (Select all that apply)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {IMPROVEMENT_SUGGESTIONS.map((suggestion) => (
                            <label key={suggestion} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={currentFeedback?.improvementSuggestions?.includes(suggestion) || false}
                                onChange={(e) => {
                                  const suggestions = currentFeedback?.improvementSuggestions || [];
                                  const updated = e.target.checked
                                    ? [...suggestions, suggestion]
                                    : suggestions.filter(s => s !== suggestion);
                                  updateFeedback(feedbackId, { improvementSuggestions: updated });
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{suggestion}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          Additional Comments
                        </label>
                        <textarea
                          value={currentFeedback?.comment || ''}
                          onChange={(e) => updateFeedback(feedbackId, { comment: e.target.value })}
                          placeholder="Share your thoughts, suggestions, or results if you've implemented this recommendation..."
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Implementation Status */}
                      <div className="mb-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentFeedback?.implemented || false}
                            onChange={(e) => updateFeedback(feedbackId, { implemented: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            I have implemented this recommendation
                          </span>
                        </label>
                        
                        {currentFeedback?.implemented && (
                          <div className="mt-3">
                            <textarea
                              value={currentFeedback?.results || ''}
                              onChange={(e) => updateFeedback(feedbackId, { results: e.target.value })}
                              placeholder="What results did you observe after implementation?"
                              rows={3}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setActiveFeedback(null)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => submitFeedback(feedbackId)}
                          disabled={!currentFeedback?.rating}
                          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Feedback
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submitted Feedback Summary */}
                {isSubmitted && currentFeedback && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (currentFeedback.rating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {currentFeedback.rating}/5
                          </span>
                        </div>
                        {currentFeedback.helpful !== null && (
                          <span className={`text-sm ${
                            currentFeedback.helpful ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {currentFeedback.helpful ? '👍 Helpful' : '👎 Needs improvement'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">Thank you for your feedback!</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 