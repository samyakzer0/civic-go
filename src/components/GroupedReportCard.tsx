/**
 * Grouped Report Card Component for CivicGo
 * 
 * A reusable card component for displaying summary information about
 * grouped reports. Can be used in admin dashboard, report lists, and
 * other places where grouped report information needs to be shown.
 */

import React from 'react';
import { ReportGroup } from '../services/ReportGroupingService';
import { GeoCoordinate } from '../services/GeospatialUtils';

/**
 * Props for the GroupedReportCard component
 */
interface GroupedReportCardProps {
  group: ReportGroup;
  onClick?: (groupId: string) => void;
  onViewReport?: (reportId: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Utility functions for styling
 */
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'duplicate': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatLocation = (location?: GeoCoordinate): string => {
  if (!location) return 'No location';
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * GroupedReportCard component
 */
const GroupedReportCard: React.FC<GroupedReportCardProps> = ({
  group,
  onClick,
  onViewReport,
  showActions = true,
  compact = false,
  className = ''
}) => {
  const handleCardClick = () => {
    onClick?.(group.id);
  };

  const handleViewPrimaryReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewReport?.(group.metadata.primaryReportId);
  };

  const confidencePercentage = Math.round(group.confidence * 100);
  const isHighConfidence = group.confidence >= 0.8;
  const requiresReview = group.confidence < 0.9 && group.confidence >= 0.6;

  return (
    <div 
      className={`
        bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${compact ? 'p-3' : 'p-4'}
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {group.title}
          </h3>
          {!compact && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {requiresReview && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              Review
            </span>
          )}
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(group.priority)}`}>
            {group.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className={`flex items-center justify-between ${compact ? 'text-xs' : 'text-sm'} text-gray-600 mb-3`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-gray-400 mr-1">📊</span>
            <span>{group.reportCount} reports</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-400 mr-1">🎯</span>
            <span className={isHighConfidence ? 'text-green-600 font-medium' : ''}>
              {confidencePercentage}% confidence
            </span>
          </div>
          
          {group.location && (
            <div className="flex items-center">
              <span className="text-gray-400 mr-1">📍</span>
              <span className="truncate max-w-32">{formatLocation(group.location)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
            {group.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Grouping Reasons */}
      {!compact && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {group.metadata.groupingReasons.map((reason, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category and Time */}
      <div className={`flex items-center justify-between ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
        <div className="flex items-center">
          <span className="font-medium text-gray-700">{group.category}</span>
          {group.metadata.spatialRadius && (
            <span className="ml-2">• ~{Math.round(group.metadata.spatialRadius)}m radius</span>
          )}
        </div>
        
        <div className="text-right">
          <div>Updated {formatRelativeTime(group.updatedAt)}</div>
          {!compact && (
            <div className="text-xs">Created {formatRelativeTime(group.createdAt)}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && !compact && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={handleViewPrimaryReport}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Primary Report
            </button>
            
            {onClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(group.id);
                }}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                View All Reports
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400">
            ID: {group.id}
          </div>
        </div>
      )}

      {/* Compact Actions */}
      {showActions && compact && (
        <div className="flex justify-end mt-2">
          <button
            onClick={handleViewPrimaryReport}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            View →
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupedReportCard;