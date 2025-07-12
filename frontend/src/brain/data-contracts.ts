/** BrowseUsersResponse */
export interface BrowseUsersResponse {
  /** Users */
  users: UserPreview[];
  /** Total Count */
  total_count: number;
  /** Page */
  page: number;
  /** Page Size */
  page_size: number;
  /** Total Pages */
  total_pages: number;
  /** Has Next */
  has_next: boolean;
  /** Has Previous */
  has_previous: boolean;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** PopularSkillsResponse */
export interface PopularSkillsResponse {
  /** Popular Skills */
  popular_skills: Record<string, any>[];
  /** Trending Skills */
  trending_skills: Record<string, any>[];
  /** Total Skills */
  total_skills: number;
}

/** SearchUsersResponse */
export interface SearchUsersResponse {
  /** Users */
  users: UserPreview[];
  /** Total Count */
  total_count: number;
  /** Search Query */
  search_query?: string | null;
  /**
   * Filters Applied
   * @default {}
   */
  filters_applied?: Record<string, any>;
}

/** UserPreview */
export interface UserPreview {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Location */
  location?: string | null;
  /** Profile Photo Url */
  profile_photo_url?: string | null;
  /**
   * Top Offered Skills
   * @default []
   */
  top_offered_skills?: Record<string, any>[];
  /**
   * Top Wanted Skills
   * @default []
   */
  top_wanted_skills?: Record<string, any>[];
  /** Availability */
  availability?: string[] | null;
  /**
   * Is Public
   * @default true
   */
  is_public?: boolean;
  /** Member Since */
  member_since?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export interface BrowseUsersParams {
  /**
   * Page
   * Page number (starts from 1)
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Page Size
   * Number of users per page
   * @min 1
   * @max 50
   * @default 12
   */
  page_size?: number;
  /**
   * Skill Filter
   * Filter by skill name
   */
  skill_filter?: string | null;
  /**
   * Location Filter
   * Filter by location
   */
  location_filter?: string | null;
}

export type BrowseUsersData = BrowseUsersResponse;

export type BrowseUsersError = HTTPValidationError;

export interface SearchUsersParams {
  /**
   * Q
   * Search query for skills, names, or locations
   */
  q?: string | null;
  /**
   * Limit
   * Maximum number of results
   * @min 1
   * @max 100
   * @default 20
   */
  limit?: number;
}

export type SearchUsersData = SearchUsersResponse;

export type SearchUsersError = HTTPValidationError;

export type GetPopularSkillsData = PopularSkillsResponse;
