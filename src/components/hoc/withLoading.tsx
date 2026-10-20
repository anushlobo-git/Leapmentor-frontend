/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Import only the React type used to describe a component.
import type { ComponentType } from "react";
// Reuse the application's existing loading spinner.
import Loader from "@components/shared/Loader";

// These are the extra props added by the loading HOC.
export interface WithLoadingProps {
  // True means the wrapped component is still waiting for data.
  isLoading: boolean;
  // Optional text shown below the loading spinner.
  loadingMessage?: string;
}

// Keep the component type and allow a readable DevTools name.
type NamedComponent<Props> = ComponentType<Props> & {
  // React DevTools uses this name when showing the component tree.
  displayName?: string;
};

/**
 * Create a new component that adds a shared loading state.
 *
 * The original component is not changed. Its own props are passed through
 * after loading finishes. The HOC consumes its own loading props.
 */
const withLoading = <Props extends object>(
  // Receive the component that needs a loading state.
  WrappedComponent: ComponentType<Props>,
  // Return the original props plus the HOC loading props.
): ComponentType<Props & WithLoadingProps> => {
  // Create the enhanced component returned by this HOC.
  const EnhancedComponent = (({
    // Take the loading flag out of the props.
    isLoading,
    // Take the optional loading message out of the props.
    loadingMessage,
    // Keep every prop that belongs to the original component.
    ...componentProps
  }: Props & WithLoadingProps) => {
    // If data is still loading, do not render the original component yet.
    if (isLoading) {
      // Show the shared loader and the optional message.
      return <Loader message={loadingMessage} minHeight="160px" />;
    }

    // Loading is finished, so render the original component with its props.
    return <WrappedComponent {...(componentProps as Props)} />;
    // Tell TypeScript that this function also has a displayName property.
  }) as NamedComponent<Props & WithLoadingProps>;

  // Read the original component name when one is available.
  const wrappedName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  // Give the enhanced component a useful name in React DevTools.
  EnhancedComponent.displayName = `withLoading(${wrappedName})`;

  // Give the new loading-aware component back to the caller.
  return EnhancedComponent;
};

// Export the HOC so other files can use it.
export default withLoading;
