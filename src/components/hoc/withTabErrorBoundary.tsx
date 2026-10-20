/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Import only the React type used to describe a component.
import type { ComponentType } from "react";
// Reuse the error boundary already used by the application.
import ErrorBoundary from "@components/shared/ErrorBoundary";

// Keep the normal component type and also allow a DevTools display name.
type NamedComponent<Props> = ComponentType<Props> & {
  // React DevTools uses this name when showing the component tree.
  displayName?: string;
};

/**
 * Create a new component that protects a dashboard tab from render errors.
 *
 * The original tab is not changed. The new component uses the same props and
 * places the existing ErrorBoundary around the tab.
 */
const withTabErrorBoundary = <Props extends object>(
  // Receive the component that we want to protect.
  WrappedComponent: ComponentType<Props>,
  // Return a new component with the same props.
): ComponentType<Props> => {
  // Create the enhanced component returned by this HOC.
  const EnhancedTab = ((props: Props) => (
    // Catch errors thrown while the tab is rendering.
    <ErrorBoundary>
      {/* Render the original tab and pass all its props to it. */}
      <WrappedComponent {...props} />
    </ErrorBoundary>
    // Tell TypeScript that this function also has a displayName property.
  )) as NamedComponent<Props>;

  // Read the original component name when one is available.
  const wrappedName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  // Give the enhanced component a useful name in React DevTools.
  EnhancedTab.displayName = `withTabErrorBoundary(${wrappedName})`;

  // Give the new protected component back to the caller.
  return EnhancedTab;
};

// Export the HOC so other files can use it.
export default withTabErrorBoundary;
