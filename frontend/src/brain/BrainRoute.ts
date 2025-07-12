import { BrowseUsersData, CheckHealthData, GetPopularSkillsData, SearchUsersData } from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Browse public user profiles with pagination and optional filters. Only returns users with public profiles.
   * @tags dbtn/module:browse, dbtn/hasAuth
   * @name browse_users
   * @summary Browse Users
   * @request GET:/routes/users/browse
   */
  export namespace browse_users {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = BrowseUsersData;
  }

  /**
   * @description Search users by skills, name, location with real-time filtering. Only returns users with public profiles.
   * @tags dbtn/module:browse, dbtn/hasAuth
   * @name search_users
   * @summary Search Users
   * @request GET:/routes/users/search
   */
  export namespace search_users {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchUsersData;
  }

  /**
   * @description Get popular and trending skills based on usage statistics.
   * @tags dbtn/module:browse, dbtn/hasAuth
   * @name get_popular_skills
   * @summary Get Popular Skills
   * @request GET:/routes/skills/popular
   */
  export namespace get_popular_skills {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPopularSkillsData;
  }
}
