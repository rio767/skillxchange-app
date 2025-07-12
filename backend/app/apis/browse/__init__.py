from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
import asyncpg
import databutton as db
from app.env import Mode, mode
from app.auth import AuthorizedUser
from uuid import UUID
from datetime import datetime
import json

router = APIRouter()

# Database connection helper
async def get_db_connection():
    if mode == Mode.PROD:
        db_url = db.secrets.get("DATABASE_URL_ADMIN_PROD")
    else:
        db_url = db.secrets.get("DATABASE_URL_ADMIN_DEV")
    
    conn = await asyncpg.connect(db_url)
    return conn

# Response models
class UserPreview(BaseModel):
    id: str
    name: str
    location: Optional[str] = None
    profile_photo_url: Optional[str] = None
    top_offered_skills: List[dict] = []
    top_wanted_skills: List[dict] = []
    availability: Optional[List[str]] = None
    is_public: bool = True
    member_since: Optional[datetime] = None

class BrowseUsersResponse(BaseModel):
    users: List[UserPreview]
    total_count: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool

class SearchUsersResponse(BaseModel):
    users: List[UserPreview]
    total_count: int
    search_query: Optional[str] = None
    filters_applied: dict = {}

class PopularSkillsResponse(BaseModel):
    popular_skills: List[dict]
    trending_skills: List[dict]
    total_skills: int

@router.get("/users/browse", response_model=BrowseUsersResponse)
async def browse_users(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    page_size: int = Query(12, ge=1, le=50, description="Number of users per page"),
    skill_filter: Optional[str] = Query(None, description="Filter by skill name"),
    location_filter: Optional[str] = Query(None, description="Filter by location")
):
    """
    Browse public user profiles with pagination and optional filters.
    Only returns users with public profiles.
    """
    try:
        conn = await get_db_connection()
        try:
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Build the query with filters
            base_query = """
                SELECT DISTINCT up.id, up.name, up.location, up.profile_photo_url, 
                       up.availability, up.is_public, up.created_at
                FROM user_profiles up
                WHERE up.is_public = true
            """
            
            count_query = """
                SELECT COUNT(DISTINCT up.id)
                FROM user_profiles up
                WHERE up.is_public = true
            """
            
            params = []
            param_count = 0
            
            # Add skill filter
            if skill_filter:
                param_count += 1
                skill_join = """
                    LEFT JOIN user_offered_skills uos ON up.id = uos.user_profile_id
                    LEFT JOIN user_wanted_skills uws ON up.id = uws.user_profile_id
                    LEFT JOIN skills s1 ON uos.skill_id = s1.id
                    LEFT JOIN skills s2 ON uws.skill_id = s2.id
                """
                skill_condition = f" AND (s1.skill_name ILIKE ${param_count} OR s2.skill_name ILIKE ${param_count})"
                base_query = base_query.replace("FROM user_profiles up", f"FROM user_profiles up {skill_join}")
                count_query = count_query.replace("FROM user_profiles up", f"FROM user_profiles up {skill_join}")
                base_query += skill_condition
                count_query += skill_condition
                params.append(f"%{skill_filter}%")
            
            # Add location filter
            if location_filter:
                param_count += 1
                location_condition = f" AND up.location ILIKE ${param_count}"
                base_query += location_condition
                count_query += location_condition
                params.append(f"%{location_filter}%")
            
            # Add ordering and pagination
            base_query += f" ORDER BY up.created_at DESC LIMIT ${param_count + 1} OFFSET ${param_count + 2}"
            params.extend([page_size, offset])
            
            # Execute queries
            count_params = params[:-2] if len(params) > 2 else []
            total_count = await conn.fetchval(count_query, *count_params)
            user_rows = await conn.fetch(base_query, *params)
            
            # Process users and get their skills
            users = []
            for row in user_rows:
                # Get top offered skills (limit 3)
                offered_skills = await conn.fetch("""
                    SELECT s.skill_name, s.category, uos.proficiency_level
                    FROM user_offered_skills uos
                    JOIN skills s ON uos.skill_id = s.id
                    WHERE uos.user_profile_id = $1
                    ORDER BY 
                        CASE uos.proficiency_level
                            WHEN 'expert' THEN 4
                            WHEN 'advanced' THEN 3
                            WHEN 'intermediate' THEN 2
                            WHEN 'beginner' THEN 1
                            ELSE 0
                        END DESC
                    LIMIT 3
                """, row['id'])
                
                # Get top wanted skills (limit 3)
                wanted_skills = await conn.fetch("""
                    SELECT s.skill_name, s.category, uws.urgency_level
                    FROM user_wanted_skills uws
                    JOIN skills s ON uws.skill_id = s.id
                    WHERE uws.user_profile_id = $1
                    ORDER BY 
                        CASE uws.urgency_level
                            WHEN 'urgent' THEN 4
                            WHEN 'high' THEN 3
                            WHEN 'medium' THEN 2
                            WHEN 'low' THEN 1
                            ELSE 0
                        END DESC
                    LIMIT 3
                """, row['id'])
                
                # Parse availability
                availability = None
                if row['availability']:
                    try:
                        availability = json.loads(row['availability'])
                    except (json.JSONDecodeError, TypeError):
                        availability = None
                
                user_preview = UserPreview(
                    id=str(row['id']),
                    name=row['name'] or "Anonymous User",
                    location=row['location'],
                    profile_photo_url=row['profile_photo_url'],
                    top_offered_skills=[
                        {
                            "skill_name": skill['skill_name'],
                            "category": skill['category'],
                            "proficiency_level": skill['proficiency_level']
                        } for skill in offered_skills
                    ],
                    top_wanted_skills=[
                        {
                            "skill_name": skill['skill_name'],
                            "category": skill['category'],
                            "urgency_level": skill['urgency_level']
                        } for skill in wanted_skills
                    ],
                    availability=availability,
                    is_public=row['is_public'],
                    member_since=row['created_at']
                )
                users.append(user_preview)
            
            # Calculate pagination info
            total_pages = (total_count + page_size - 1) // page_size
            has_next = page < total_pages
            has_previous = page > 1
            
            return BrowseUsersResponse(
                users=users,
                total_count=total_count,
                page=page,
                page_size=page_size,
                total_pages=total_pages,
                has_next=has_next,
                has_previous=has_previous
            )
            
        finally:
            await conn.close()
    except Exception as e:
        print(f"Error browsing users: {e}")
        raise HTTPException(status_code=500, detail="Failed to browse users")

@router.get("/users/search", response_model=SearchUsersResponse)
async def search_users(
    q: Optional[str] = Query(None, description="Search query for skills, names, or locations"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results")
):
    """
    Search users by skills, name, location with real-time filtering.
    Only returns users with public profiles.
    """
    try:
        conn = await get_db_connection()
        try:
            # Build search query
            if q:
                base_query = """
                    SELECT DISTINCT up.id, up.name, up.location, up.profile_photo_url, 
                           up.availability, up.is_public, up.created_at
                    FROM user_profiles up
                    LEFT JOIN user_offered_skills uos ON up.id = uos.user_profile_id
                    LEFT JOIN user_wanted_skills uws ON up.id = uws.user_profile_id
                    LEFT JOIN skills s1 ON uos.skill_id = s1.id
                    LEFT JOIN skills s2 ON uws.skill_id = s2.id
                    WHERE up.is_public = true
                    AND (
                        up.name ILIKE $1 OR
                        up.location ILIKE $1 OR
                        s1.skill_name ILIKE $1 OR
                        s2.skill_name ILIKE $1
                    )
                    ORDER BY up.created_at DESC
                    LIMIT $2
                """
                user_rows = await conn.fetch(base_query, f"%{q}%", limit)
            else:
                # Return recent users if no search query
                base_query = """
                    SELECT up.id, up.name, up.location, up.profile_photo_url, 
                           up.availability, up.is_public, up.created_at
                    FROM user_profiles up
                    WHERE up.is_public = true
                    ORDER BY up.created_at DESC
                    LIMIT $1
                """
                user_rows = await conn.fetch(base_query, limit)
            
            # Process users (similar to browse_users)
            users = []
            for row in user_rows:
                # Get top skills for each user
                offered_skills = await conn.fetch("""
                    SELECT s.skill_name, s.category, uos.proficiency_level
                    FROM user_offered_skills uos
                    JOIN skills s ON uos.skill_id = s.id
                    WHERE uos.user_profile_id = $1
                    LIMIT 3
                """, row['id'])
                
                wanted_skills = await conn.fetch("""
                    SELECT s.skill_name, s.category, uws.urgency_level
                    FROM user_wanted_skills uws
                    JOIN skills s ON uws.skill_id = s.id
                    WHERE uws.user_profile_id = $1
                    LIMIT 3
                """, row['id'])
                
                # Parse availability
                availability_parsed = None
                if row['availability']:
                    try:
                        availability_parsed = json.loads(row['availability'])
                    except (json.JSONDecodeError, TypeError):
                        availability_parsed = None
                
                user_preview = UserPreview(
                    id=str(row['id']),
                    name=row['name'] or "Anonymous User",
                    location=row['location'],
                    profile_photo_url=row['profile_photo_url'],
                    top_offered_skills=[
                        {
                            "skill_name": skill['skill_name'],
                            "category": skill['category'],
                            "proficiency_level": skill['proficiency_level']
                        } for skill in offered_skills
                    ],
                    top_wanted_skills=[
                        {
                            "skill_name": skill['skill_name'],
                            "category": skill['category'],
                            "urgency_level": skill['urgency_level']
                        } for skill in wanted_skills
                    ],
                    availability=availability_parsed,
                    is_public=row['is_public'],
                    member_since=row['created_at']
                )
                users.append(user_preview)
            
            return SearchUsersResponse(
                users=users,
                total_count=len(users),
                search_query=q,
                filters_applied={"search_query": q} if q else {}
            )
            
        finally:
            await conn.close()
    except Exception as e:
        print(f"Error searching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to search users")

@router.get("/skills/popular", response_model=PopularSkillsResponse)
async def get_popular_skills():
    """
    Get popular and trending skills based on usage statistics.
    """
    try:
        conn = await get_db_connection()
        try:
            # Get popular skills (combined offered and wanted)
            popular_skills = await conn.fetch("""
                WITH skill_usage AS (
                    SELECT s.skill_name, s.category, 
                           COUNT(DISTINCT uos.user_profile_id) as offered_count,
                           COUNT(DISTINCT uws.user_profile_id) as wanted_count
                    FROM skills s
                    LEFT JOIN user_offered_skills uos ON s.id = uos.skill_id
                    LEFT JOIN user_wanted_skills uws ON s.id = uws.skill_id
                    LEFT JOIN user_profiles up1 ON uos.user_profile_id = up1.id
                    LEFT JOIN user_profiles up2 ON uws.user_profile_id = up2.id
                    WHERE (up1.is_public = true OR up2.is_public = true)
                    GROUP BY s.id, s.skill_name, s.category
                    HAVING COUNT(DISTINCT uos.user_profile_id) + COUNT(DISTINCT uws.user_profile_id) > 0
                )
                SELECT skill_name, category, offered_count, wanted_count,
                       (offered_count + wanted_count) as total_usage
                FROM skill_usage
                ORDER BY total_usage DESC
                LIMIT 10
            """)
            
            # Get total skills count
            total_skills = await conn.fetchval("SELECT COUNT(*) FROM skills")
            
            # Format results
            popular_skills_list = [
                {
                    "skill_name": skill['skill_name'],
                    "category": skill['category'],
                    "offered_count": skill['offered_count'],
                    "wanted_count": skill['wanted_count'],
                    "total_usage": skill['total_usage']
                } for skill in popular_skills
            ]
            
            # For now, trending skills are same as popular (can be enhanced later)
            trending_skills = popular_skills_list[:5]
            
            return PopularSkillsResponse(
                popular_skills=popular_skills_list,
                trending_skills=trending_skills,
                total_skills=total_skills or 0
            )
            
        finally:
            await conn.close()
    except Exception as e:
        print(f"Error getting popular skills: {e}")
        raise HTTPException(status_code=500, detail="Failed to get popular skills")
