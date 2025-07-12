"""
Repository layer for skill-related database operations.

This module contains functions for managing skills, user skill relationships,
and skill swap operations in the database.
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from database import DatabaseManager
from models import (
    Skill, UserOfferedSkill, UserWantedSkill, SkillSwap,
    UserOfferedSkillWithDetails, UserWantedSkillWithDetails,
    SkillSwapWithDetails, ProficiencyLevel, UrgencyLevel, SwapStatus
)


class SkillRepository:
    """Repository for skill-related database operations."""
    
    @staticmethod
    async def get_all_skills() -> List[Skill]:
        """Get all skills from the database."""
        query = "SELECT * FROM skills ORDER BY skill_name"
        rows = await DatabaseManager.execute_query(query)
        return [Skill(**row) for row in rows]
    
    @staticmethod
    async def get_skills_by_category(category: str) -> List[Skill]:
        """Get skills filtered by category."""
        query = "SELECT * FROM skills WHERE category = $1 ORDER BY skill_name"
        rows = await DatabaseManager.execute_query(query, category)
        return [Skill(**row) for row in rows]
    
    @staticmethod
    async def search_skills(search_term: str) -> List[Skill]:
        """Search skills by name or description."""
        query = """
            SELECT * FROM skills 
            WHERE skill_name ILIKE $1 OR description ILIKE $1
            ORDER BY skill_name
        """
        search_pattern = f"%{search_term}%"
        rows = await DatabaseManager.execute_query(query, search_pattern)
        return [Skill(**row) for row in rows]
    
    @staticmethod
    async def create_skill(skill_name: str, category: Optional[str] = None, description: Optional[str] = None) -> Skill:
        """Create a new skill."""
        data = {
            "skill_name": skill_name,
            "category": category,
            "description": description
        }
        row = await DatabaseManager.insert_and_return("skills", data)
        return Skill(**row)
    
    @staticmethod
    async def get_user_offered_skills(user_id: str) -> List[UserOfferedSkillWithDetails]:
        """Get all skills offered by a user with skill details."""
        query = """
            SELECT 
                uos.*,
                s.skill_name,
                s.category,
                s.description as skill_description,
                s.created_at as skill_created_at
            FROM user_offered_skills uos
            JOIN skills s ON uos.skill_id = s.id
            WHERE uos.user_id = $1
            ORDER BY uos.created_at DESC
        """
        rows = await DatabaseManager.execute_query(query, user_id)
        
        result = []
        for row in rows:
            skill = Skill(
                id=row["skill_id"],
                skill_name=row["skill_name"],
                category=row["category"],
                description=row["skill_description"],
                created_at=row["skill_created_at"]
            )
            
            offered_skill = UserOfferedSkillWithDetails(
                id=row["id"],
                user_id=row["user_id"],
                skill_id=row["skill_id"],
                proficiency_level=row["proficiency_level"],
                description=row["description"],
                created_at=row["created_at"],
                skill=skill
            )
            result.append(offered_skill)
        
        return result
    
    @staticmethod
    async def get_user_wanted_skills(user_id: str) -> List[UserWantedSkillWithDetails]:
        """Get all skills wanted by a user with skill details."""
        query = """
            SELECT 
                uws.*,
                s.skill_name,
                s.category,
                s.description as skill_description,
                s.created_at as skill_created_at
            FROM user_wanted_skills uws
            JOIN skills s ON uws.skill_id = s.id
            WHERE uws.user_id = $1
            ORDER BY uws.created_at DESC
        """
        rows = await DatabaseManager.execute_query(query, user_id)
        
        result = []
        for row in rows:
            skill = Skill(
                id=row["skill_id"],
                skill_name=row["skill_name"],
                category=row["category"],
                description=row["skill_description"],
                created_at=row["skill_created_at"]
            )
            
            wanted_skill = UserWantedSkillWithDetails(
                id=row["id"],
                user_id=row["user_id"],
                skill_id=row["skill_id"],
                urgency_level=row["urgency_level"],
                description=row["description"],
                created_at=row["created_at"],
                skill=skill
            )
            result.append(wanted_skill)
        
        return result
    
    @staticmethod
    async def add_offered_skill(
        user_id: str, 
        skill_id: UUID, 
        proficiency_level: ProficiencyLevel, 
        description: Optional[str] = None
    ) -> UserOfferedSkill:
        """Add a skill that user can offer."""
        data = {
            "user_id": user_id,
            "skill_id": skill_id,
            "proficiency_level": proficiency_level,
            "description": description
        }
        row = await DatabaseManager.insert_and_return("user_offered_skills", data)
        return UserOfferedSkill(**row)
    
    @staticmethod
    async def add_wanted_skill(
        user_id: str, 
        skill_id: UUID, 
        urgency_level: UrgencyLevel, 
        description: Optional[str] = None
    ) -> UserWantedSkill:
        """Add a skill that user wants to learn."""
        data = {
            "user_id": user_id,
            "skill_id": skill_id,
            "urgency_level": urgency_level,
            "description": description
        }
        row = await DatabaseManager.insert_and_return("user_wanted_skills", data)
        return UserWantedSkill(**row)
    
    @staticmethod
    async def remove_offered_skill(user_id: str, skill_id: UUID) -> bool:
        """Remove a skill from user's offered skills."""
        query = "DELETE FROM user_offered_skills WHERE user_id = $1 AND skill_id = $2"
        await DatabaseManager.execute_query(query, user_id, skill_id, fetch_mode="none")
        return True
    
    @staticmethod
    async def remove_wanted_skill(user_id: str, skill_id: UUID) -> bool:
        """Remove a skill from user's wanted skills."""
        query = "DELETE FROM user_wanted_skills WHERE user_id = $1 AND skill_id = $2"
        await DatabaseManager.execute_query(query, user_id, skill_id, fetch_mode="none")
        return True
    
    @staticmethod
    async def find_skill_matches(user_id: str) -> List[Dict[str, Any]]:
        """Find potential skill matches for a user.
        
        Returns users who offer skills that this user wants,
        and who want skills that this user offers.
        """
        query = """
            SELECT DISTINCT
                up.user_id,
                up.name,
                up.location,
                up.profile_photo_url,
                uos.skill_id as offered_skill_id,
                s1.skill_name as offered_skill_name,
                uos.proficiency_level,
                uws.skill_id as wanted_skill_id,
                s2.skill_name as wanted_skill_name,
                uws.urgency_level
            FROM user_profiles up
            JOIN user_offered_skills uos ON up.user_id = uos.user_id
            JOIN skills s1 ON uos.skill_id = s1.id
            JOIN user_wanted_skills uws ON up.user_id = uws.user_id
            JOIN skills s2 ON uws.skill_id = s2.id
            WHERE up.is_public = true
            AND up.user_id != $1
            AND (
                -- They offer what I want
                uos.skill_id IN (
                    SELECT skill_id FROM user_wanted_skills WHERE user_id = $1
                )
                OR
                -- They want what I offer
                uws.skill_id IN (
                    SELECT skill_id FROM user_offered_skills WHERE user_id = $1
                )
            )
            ORDER BY up.name
        """
        rows = await DatabaseManager.execute_query(query, user_id)
        return rows
