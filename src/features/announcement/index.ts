// Export all types
export * from "./types.announcement";

// Export all API functions
export * from "./api.announcement";

// Export all hooks
export * from "./hooks.announcement";

// Default export for convenient importing
import * as announcementTypes from "./types.announcement";
import * as announcementApi from "./api.announcement";
import * as announcementHooks from "./hooks.announcement";

export default {
  ...announcementTypes,
  ...announcementApi,
  ...announcementHooks,
};
