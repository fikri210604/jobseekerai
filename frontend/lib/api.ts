// Re-export all api modules to maintain backwards compatibility
import apiClient from "./api/client";

export * from "./api/cv";
export * from "./api/jobs";
export * from "./api/matching";
export * from "./api/prediction";
export * from "./api/skills";

export default apiClient;
