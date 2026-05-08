// Export all types
export * from "./types.fees-allocation";

// Export all API functions
export * from "./api.fees-allocation";

// Export all hooks
export * from "./hooks.fees-allocation";

// Default export for convenient importing
import * as allocationTypes from "./types.fees-allocation";
import * as allocationApi from "./api.fees-allocation";
import * as allocationHooks from "./hooks.fees-allocation";

export default {
  ...allocationTypes,
  ...allocationApi,
  ...allocationHooks,
};
