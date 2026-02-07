"use client";

import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: string | null;
  isConfirmed: boolean;
  className?: string;
}

export function ConfidenceBadge({ confidence, isConfirmed, className }: ConfidenceBadgeProps) {
  // If confirmed, show info badge (overrides confidence)
  if (isConfirmed) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-info text-info-foreground",
        className
      )}>
        Confirmed
      </span>
    );
  }

  // Map Plaid confidence levels to colors
  if (!confidence) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground",
        className
      )}>
        Unknown
      </span>
    );
  }

  // Normalize confidence value: lowercase and replace all underscores with spaces
  const normalizedConf = String(confidence).toLowerCase().replace(/_/g, ' ').trim();
  const originalUpper = String(confidence).toUpperCase();
  
  // Check for "very high" first (must check before "high" to avoid false matches)
  // Handle formats: "VERY_HIGH", "very_high", "very high", "VERY HIGH"
  if (
    normalizedConf === 'very high' || 
    normalizedConf.startsWith('very high') ||
    originalUpper === 'VERY_HIGH' ||
    originalUpper === 'VERY HIGH'
  ) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-success text-success-foreground",
        className
      )}>
        Very High
      </span>
    );
  }
  
  // Check for "high" (exact match or uppercase format)
  // Handle formats: "HIGH", "high", "High"
  if (
    normalizedConf === 'high' ||
    originalUpper === 'HIGH'
  ) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-success/20 text-success border border-success/30",
        className
      )}>
        High
      </span>
    );
  }
  
  // Check for "medium"
  if (normalizedConf === 'medium' || normalizedConf.includes('medium')) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-warning text-warning-foreground",
        className
      )}>
        Medium
      </span>
    );
  }
  
  // Check for "low" (but not "very low" which should be handled separately if needed)
  if (normalizedConf === 'low' || (normalizedConf.includes('low') && !normalizedConf.includes('very'))) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-destructive text-destructive-foreground",
        className
      )}>
        Low
      </span>
    );
  }

  // Default for unknown confidence values
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground",
      className
    )}>
      {confidence}
    </span>
  );
}
