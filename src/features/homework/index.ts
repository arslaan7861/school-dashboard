// Export all types
export * from "./types.homework";

// Export all API functions
export * from "./api.homework";

// Export all hooks
export * from "./hooks.homework";

// Default export for convenient importing
import * as homeworkTypes from "./types.homework";
import * as homeworkApi from "./api.homework";
import * as homeworkHooks from "./hooks.homework";

export default {
  ...homeworkTypes,
  ...homeworkApi,
  ...homeworkHooks,
};
