import {
  BrowseUsersData,
  BrowseUsersError,
  BrowseUsersParams,
  CheckHealthData,
  GetPopularSkillsData,
  SearchUsersData,
  SearchUsersError,
  SearchUsersParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Browse public user profiles with pagination and optional filters. Only returns users with public profiles.
   *
   * @tags dbtn/module:browse, dbtn/hasAuth
   * @name browse_users
   * @summary Browse Users
   * @request GET:/routes/users/browse
   */
  browse_users = (query: BrowseUsersParams, params: RequestParams = {}) =>
    this.request<BrowseUsersData, BrowseUsersError>({
      path: `/routes/users/browse`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Search users by skills, name, location with real-time filtering. Only returns users with public profiles.
   *
   * @tags dbtn/module:browse, dbtn/hasAuth
   * @name search_users
   * @summary Search Users
   * @request GET:/routes/users/search
   */
  search_users = (query: SearchUsersParams, params: RequestParams = {}) =>
    this.request<SearchUsersData, SearchUsersError>({
      path: `/routes/users/search`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get popular and trending skills based on usage statistics.
   *
   * @tags dbtn/module:browse, dbtn/hasAuth
   * @name get_popular_skills
   * @summary Get Popular Skills
   * @request GET:/routes/skills/popular
   */
  get_popular_skills = (params: RequestParams = {}) =>
    this.request<GetPopularSkillsData, any>({
      path: `/routes/skills/popular`,
      method: "GET",
      ...params,
    });
}
