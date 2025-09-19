// Clean Fragment Utility Component
// Prevents browser extensions and external tools from injecting invalid props
// into React.Fragment components, which causes console warnings

import React from 'react';

interface CleanFragmentProps {
  children: React.ReactNode;
  fragmentKey?: string;
  [key: string]: any; // Allow any props to be passed
}

/**
 * A wrapper around React.Fragment that filters out invalid props 
 * that might be injected by browser extensions or external tools.
 * 
 * This prevents console warnings like:
 * "Warning: Invalid prop `data-lov-id` supplied to `React.Fragment`"
 * 
 * Usage:
 * ```tsx
 * <CleanFragment fragmentKey="some-key">
 *   <div>Content</div>
 * </CleanFragment>
 * ```
 */
export const CleanFragment: React.FC<CleanFragmentProps> = (props) => {
  // Extract only the props that React.Fragment accepts
  const { children, fragmentKey, ...otherProps } = props;
  
  // Log filtered props for debugging  
  const filteredPropCount = Object.keys(otherProps).length;
  if (filteredPropCount > 0) {
    console.debug('CleanFragment filtered out props:', Object.keys(otherProps));
  }
  
  // Return React.Fragment with ONLY the key and children props
  // This prevents any browser extension props from being passed through
  if (fragmentKey !== undefined) {
    return <React.Fragment key={fragmentKey}>{children}</React.Fragment>;
  }
  
  return <React.Fragment>{children}</React.Fragment>;
};

export default CleanFragment;