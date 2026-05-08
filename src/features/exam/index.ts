// Export all types
export * from "./types.exam";

// Export all API functions
export * from "./api.exam";

// Export all hooks
export * from "./hooks.exam";

// Default export for convenient importing
import * as examTypes from "./types.exam";
import * as examApi from "./api.exam";
import * as examHooks from "./hooks.exam";

export default {
  ...examTypes,
  ...examApi,
  ...examHooks,
};
