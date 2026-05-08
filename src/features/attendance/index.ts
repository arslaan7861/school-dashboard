// Export all types
export * from "./types.attendance";

// Export all API functions
export * from "./api.attendance";

// Export all hooks
export * from "./hooks.attendance";

// Default export for convenient importing
import * as attendanceTypes from "./types.attendance";
import * as attendanceApi from "./api.attendance";
import * as attendanceHooks from "./hooks.attendance";

export default {
  ...attendanceTypes,
  ...attendanceApi,
  ...attendanceHooks,
};
