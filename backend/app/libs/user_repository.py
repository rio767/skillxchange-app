"""
Repository layer for user-related database operations.

This module contains functions for managing user profiles and
user-related data in the database.
"""

from typing import List, Dict, Any, Optional
from database import DatabaseManager
from models import UserProfile, UserProfileWithSkills
from skill_repository import SkillRepository


class UserRepository:
    """Repository for user-related database operations."""
    
    @staticmethod
    async def get_user_profile(user_id: str) -> Optional[UserProfile]:
        """Get user profile by user_id."""
        query = "SELECT * FROM user_profiles WHERE user_id = $1"
        rows = await DatabaseManager.execute_query(query, user_id, fetch_mode="one")
        
        if not rows:
            return None
        
        # Deserialize JSON fields
        row_data = DatabaseManager.deserialize_json_fields(rows[0], ["availability"])
        return UserProfile(**row_data)
    
    @staticmethod
    async def create_user_profile(
        user_id: str,
        name: Optional[str] = None,
        location: Optional[str] = None,
        profile_photo_url: Optional[str] = None,
        availability: Optional[str] = None,
        is_public: bool = True
    ) -> UserProfile:
        """Create a new user profile."""
        data = {
            "user_id": user_id,
            "name": name,
            "location": location,
            "profile_photo_url": profile_photo_url,
            "availability": availability,
            "is_public": is_public
        }
        
        # Serialize JSON fields
        data = DatabaseManager.serialize_json_fields(data, ["availability"])
        
        row = await DatabaseManager.insert_and_return("user_profiles", data)
        
        # Deserialize JSON fields for return
        row_data = DatabaseManager.deserialize_json_fields(row, ["availability"])
        return UserProfile(**row_data)
    
    @staticmethod
    async def update_user_profile(
        user_id: str,
        name: Optional[str] = None,
        location: Optional[str] = None,
        profile_photo_url: Optional[str] = None,
        availability: Optional[str] = None,
        is_public: Optional[bool] = None
    ) -> Optional[UserProfile]:
        """Update user profile."""
        # Build update data, excluding None values
        data = {}
        if name is not None:
            data["name"] = name
        if location is not None:
            data["location"] = location
        if profile_photo_url is not None:
            data["profile_photo_url"] = profile_photo_url
        if availability is not None:
            data["availability"] = availability
        if is_public is not None:
            data["is_public"] = is_public
        
        if not data:
            return await UserRepository.get_user_profile(user_id)
        
        # Serialize JSON fields
        data = DatabaseManager.serialize_json_fields(data, ["availability"])
        
        row = await DatabaseManager.update_and_return(
            "user_profiles", data, "user_id = ?", [user_id]
        )
        
        if not row:
            return None
        
        # Deserialize JSON fields for return
        row_data = DatabaseManager.deserialize_json_fields(row, ["availability"])
        return UserProfile(**row_data)
    
    @staticmethod
    async def get_user_profile_with_skills(user_id: str) -> Optional[UserProfileWithSkills]:
        """Get user profile with their offered and wanted skills."""
        profile = await UserRepository.get_user_profile(user_id)
        if not profile:
            return None
        
        offered_skills = await SkillRepository.get_user_offered_skills(user_id)
        wanted_skills = await SkillRepository.get_user_wanted_skills(user_id)
        
        return UserProfileWithSkills(
            **profile.model_dump(),
            offered_skills=offered_skills,
            wanted_skills=wanted_skills
        )
    
    @staticmethod
    async def get_public_users(limit: int = 50, offset: int = 0) -> List[UserProfile]:
        """Get public user profiles with pagination."""
        query = """
            SELECT * FROM user_profiles 
            WHERE is_public = true 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        """
        rows = await DatabaseManager.execute_query(query, limit, offset)
        
        result = []
        for row in rows:
            row_data = DatabaseManager.deserialize_json_fields(row, ["availability"])
            result.append(UserProfile(**row_data))
        
        return result
    
    @staticmethod
    async def search_users(
        search_term: Optional[str] = None,
        location: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[UserProfile]:
        """Search public users by name or location."""
        where_conditions = ["is_public = true"]
        params = []
        param_index = 1
        
        if search_term:
            where_conditions.append(f"name ILIKE ${param_index}")
            params.append(f"%{search_term}%")
            param_index += 1
        
        if location:
            where_conditions.append(f"location ILIKE ${param_index}")
            params.append(f"%{location}%")
            param_index += 1
        
        params.extend([limit, offset])
        
        query = f"""
            SELECT * FROM user_profiles 
            WHERE {' AND '.join(where_conditions)}
            ORDER BY created_at DESC 
            LIMIT ${param_index} OFFSET ${param_index + 1}
        """
        
        rows = await DatabaseManager.execute_query(query, *params)
        
        result = []
        for row in rows:
            row_data = DatabaseManager.deserialize_json_fields(row, ["availability"])
            result.append(UserProfile(**row_data))
        
        return result
    
    @staticmethod
    async def delete_user_profile(user_id: str) -> bool:
        """Delete user profile and all related data."""
        # Note: Due to foreign key constraints, this will cascade delete
        # user's offered skills, wanted skills, and skill swaps
        query = "DELETE FROM user_profiles WHERE user_id = $1"
        await DatabaseManager.execute_query(query, user_id, fetch_mode="none")
        return True
