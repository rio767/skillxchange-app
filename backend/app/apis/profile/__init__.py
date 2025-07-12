"""
Profile management API for SkillXchange platform.

Provides endpoints for user profile creation, retrieval, and updates.
"""

from fastapi import APIRouter, HTTPException, status
from typing import Optional
import asyncpg
import databutton as db
from app.env import Mode, mode
from app.auth import AuthorizedUser
from app.libs import (
    UserRepository, 
    SkillRepository,
    UserProfile,
    CreateUserProfileRequest,
    UpdateUserProfileRequest,
    UserProfileWithSkills,
    AddOfferedSkillRequest,
    AddWantedSkillRequest,
    SkillSearchResponse,
    DatabaseConnection
)
import json
from uuid import UUID, uuid4
from datetime import datetime

router = APIRouter(prefix="/profile", tags=["profile"])

# Database connection helper
async def get_db_connection() -> asyncpg.Connection:
    """Get database connection based on environment."""
    if mode == Mode.PROD:
        db_url = db.secrets.get("DATABASE_URL_PROD")
    else:
        db_url = db.secrets.get("DATABASE_URL_DEV")
    
    return await asyncpg.connect(db_url)

@router.get("/", response_model=Optional[UserProfileWithSkills])
async def get_profile(user: AuthorizedUser) -> Optional[UserProfileWithSkills]:
    """
    Get the current user's profile with all skills.
    Returns None if profile doesn't exist yet.
    """
    try:
        conn = await get_db_connection()
        try:
            user_repo = UserRepository(DatabaseConnection(conn))
            profile = await user_repo.get_user_profile_with_skills(user.sub)
            return profile
        finally:
            await conn.close()
    except Exception as e:
        print(f"Error getting profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )

@router.post("/", response_model=UserProfileWithSkills)
async def create_profile(profile_data: CreateUserProfileRequest, user: AuthorizedUser) -> UserProfileWithSkills:
    """
    Create a new user profile.
    """
    try:
        conn = await get_db_connection()
        try:
            user_repo = UserRepository(DatabaseConnection(conn))
            
            # Check if profile already exists
            existing_profile = await user_repo.get_user_profile_with_skills(user.sub)
            if existing_profile:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Profile already exists. Use PUT to update."
                )
            
            # Create new profile
            profile = UserProfile(
                id=uuid4(),
                user_id=user.sub,
                name=profile_data.name,
                location=profile_data.location,
                profile_photo_url=profile_data.profile_photo_url,
                availability=json.dumps(profile_data.availability) if profile_data.availability else None,
                is_public=profile_data.is_public,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            created_profile = await user_repo.create_user_profile(profile)
            return await user_repo.get_user_profile_with_skills(user.sub)
            
        finally:
            await conn.close()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create profile"
        )

@router.put("/", response_model=UserProfileWithSkills)
async def update_profile(profile_data: UpdateUserProfileRequest, user: AuthorizedUser) -> UserProfileWithSkills:
    """
    Update the current user's profile.
    """
    try:
        conn = await get_db_connection()
        try:
            user_repo = UserRepository(DatabaseConnection(conn))
            
            # Check if profile exists
            existing_profile = await user_repo.get_user_profile_with_skills(user.sub)
            if not existing_profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found. Create one first."
                )
            
            # Update profile
            updated_profile = UserProfile(
                id=existing_profile.id,
                user_id=user.sub,
                name=profile_data.name if profile_data.name is not None else existing_profile.name,
                location=profile_data.location if profile_data.location is not None else existing_profile.location,
                profile_photo_url=profile_data.profile_photo_url if profile_data.profile_photo_url is not None else existing_profile.profile_photo_url,
                availability=json.dumps(profile_data.availability) if profile_data.availability is not None else existing_profile.availability,
                is_public=profile_data.is_public if profile_data.is_public is not None else existing_profile.is_public,
                created_at=existing_profile.created_at,
                updated_at=datetime.utcnow()
            )
            
            await user_repo.update_user_profile(updated_profile)
            return await user_repo.get_user_profile_with_skills(user.sub)
            
        finally:
            await conn.close()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.post("/skills/offered")
async def add_offered_skill(skill_data: AddOfferedSkillRequest, user: AuthorizedUser):
    """
    Add a skill that the user offers.
    """
    try:
        conn = await get_db_connection()
        try:
            user_repo = UserRepository(DatabaseConnection(conn))
            skill_repo = SkillRepository(DatabaseConnection(conn))
            
            # Check if profile exists
            profile = await user_repo.get_user_profile_with_skills(user.sub)
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found. Create one first."
                )
            
            # Get or create the skill
            skill = await skill_repo.get_skill_by_name(skill_data.skill_name)
            if not skill:
                # Create new skill
                from app.libs import Skill
                new_skill = Skill(
                    id=uuid4(),
                    skill_name=skill_data.skill_name,
                    category=skill_data.category or "Other",
                    description=skill_data.description,
                    created_at=datetime.utcnow()
                )
                skill = await skill_repo.create_skill(new_skill)
            
            # Add the offered skill
            await user_repo.add_offered_skill(profile.id, skill.id, skill_data.proficiency_level)
            
            return {"message": "Skill added successfully"}
            
        finally:
            await conn.close()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding offered skill: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add offered skill"
        )

@router.delete("/skills/offered/{skill_id}")
async def remove_offered_skill(skill_id: UUID, user: AuthorizedUser):
    """
    Remove a skill that the user offers.
    """
    try:
        conn = await get_db_connection()
        try:
            user_repo = UserRepository(DatabaseConnection(conn))
            
            # Check if profile exists
            profile = await user_repo.get_user_profile_with_skills(user.sub)
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found"
                )
            
            # Remove the offered skill
            await user_repo.remove_offered_skill(profile.id, skill_id)
            
            return {"message": "Skill removed successfully"}
            
        finally:
            await conn.close()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing offered skill: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove offered skill"
        )

@router.post("/skills/wanted")
async def add_wanted_skill(skill_data: AddWantedSkillRequest, user: AuthorizedUser):
    """
    Add a skill that the user wants to learn.
    """
    try:
        conn = await get_db_connection()
        try:
            user_repo = UserRepository(DatabaseConnection(conn))
            skill_repo = SkillRepository(DatabaseConnection(conn))
            
            # Check if profile exists
            profile = await user_repo.get_user_profile_with_skills(user.sub)
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found. Create one first."
                )
            
            # Get or create the skill
            skill = await skill_repo.get_skill_by_name(skill_data.skill_name)
            if not skill:
                # Create new skill
                from app.libs import Skill
                new_skill = Skill(
                    id=uuid4(),
                    skill_name=skill_data.skill_name,
                    category=skill_data.category or "Other",
                    description=skill_data.description,
                    created_at=datetime.utcnow()
                )
                skill = await skill_repo.create_skill(new_skill)
            
            # Add the wanted skill
            await user_repo.add_wanted_skill(profile.id, skill.id, skill_data.urgency_level)
            
            return {"message": "Skill added successfully"}
            
        finally:
            await conn.close()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding wanted skill: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add wanted skill"
        )

@router.delete("/skills/wanted/{skill_id}")
async def remove_wanted_skill(skill_id: UUID, user: AuthorizedUser):
    """
    Remove a skill that the user wants to learn.
    """
    try:
        conn = await get_db_connection()
        try:
            user_repo = UserRepository(DatabaseConnection(conn))
            
            # Check if profile exists
            profile = await user_repo.get_user_profile_with_skills(user.sub)
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found"
                )
            
            # Remove the wanted skill
            await user_repo.remove_wanted_skill(profile.id, skill_id)
            
            return {"message": "Skill removed successfully"}
            
        finally:
            await conn.close()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing wanted skill: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove wanted skill"
        )

@router.get("/skills/search", response_model=SkillSearchResponse)
async def search_skills(q: str = "", limit: int = 10) -> SkillSearchResponse:
    """
    Search for skills with autocomplete functionality.
    """
    try:
        conn = await get_db_connection()
        try:
            skill_repo = SkillRepository(DatabaseConnection(conn))
            skills = await skill_repo.search_skills(q, limit)
            
            return SkillSearchResponse(
                skills=skills,
                total=len(skills)
            )
            
        finally:
            await conn.close()
    except Exception as e:
        print(f"Error searching skills: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search skills"
        )
