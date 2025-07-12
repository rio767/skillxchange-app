"""
Database models for the SkillXchange platform.

This module contains Pydantic models that reflect the database schema
for users, skills, and skill swap relationships.
"""

from datetime import datetime
from typing import Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """User profile extending Stack Auth users with additional information."""
    id: UUID
    user_id: str = Field(..., description="Stack Auth user ID")
    name: Optional[str] = Field(None, description="User's display name")
    location: Optional[str] = Field(None, description="User's location (optional)")
    profile_photo_url: Optional[str] = Field(None, description="URL to user's profile photo")
    availability: Optional[str] = Field(None, description="JSON string of availability preferences")
    is_public: bool = Field(True, description="Whether profile is visible to other users")
    created_at: datetime
    updated_at: datetime


class Skill(BaseModel):
    """Master skills table containing all available skills."""
    id: UUID
    skill_name: str = Field(..., description="Unique name of the skill")
    category: Optional[str] = Field(None, description="Skill category (e.g., Technology, Design)")
    description: Optional[str] = Field(None, description="Description of the skill")
    created_at: datetime


ProficiencyLevel = Literal["beginner", "intermediate", "advanced", "expert"]
UrgencyLevel = Literal["low", "medium", "high", "urgent"]
SwapStatus = Literal["pending", "accepted", "rejected", "completed", "cancelled"]


class UserOfferedSkill(BaseModel):
    """Skills that a user can teach to others."""
    id: UUID
    user_id: str = Field(..., description="Stack Auth user ID")
    skill_id: UUID = Field(..., description="Reference to skill in skills table")
    proficiency_level: ProficiencyLevel = Field(..., description="User's skill level")
    description: Optional[str] = Field(None, description="User's description of their experience")
    created_at: datetime


class UserWantedSkill(BaseModel):
    """Skills that a user wants to learn."""
    id: UUID
    user_id: str = Field(..., description="Stack Auth user ID")
    skill_id: UUID = Field(..., description="Reference to skill in skills table")
    urgency_level: UrgencyLevel = Field(..., description="How urgently user wants to learn")
    description: Optional[str] = Field(None, description="What user wants to learn about this skill")
    created_at: datetime


class SkillSwap(BaseModel):
    """Skill exchange requests between users."""
    id: UUID
    requester_id: str = Field(..., description="Stack Auth user ID of person making request")
    provider_id: str = Field(..., description="Stack Auth user ID of person providing skill")
    offered_skill_id: UUID = Field(..., description="Reference to user_offered_skills")
    wanted_skill_id: UUID = Field(..., description="Reference to user_wanted_skills")
    status: SwapStatus = Field(default="pending", description="Current status of the swap")
    message: Optional[str] = Field(None, description="Optional message from requester")
    response_message: Optional[str] = Field(None, description="Optional response from provider")
    created_at: datetime
    updated_at: datetime


# Request/Response models for API endpoints

class CreateUserProfileRequest(BaseModel):
    """Request model for creating a user profile."""
    name: Optional[str] = None
    location: Optional[str] = None
    profile_photo_url: Optional[str] = None
    availability: Optional[str] = None
    is_public: bool = True


class UpdateUserProfileRequest(BaseModel):
    """Request model for updating a user profile."""
    name: Optional[str] = None
    location: Optional[str] = None
    profile_photo_url: Optional[str] = None
    availability: Optional[str] = None
    is_public: Optional[bool] = None


class CreateSkillRequest(BaseModel):
    """Request model for creating a new skill."""
    skill_name: str = Field(..., min_length=1, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None


class AddOfferedSkillRequest(BaseModel):
    """Request model for adding a skill that user can offer."""
    skill_id: UUID
    proficiency_level: ProficiencyLevel
    description: Optional[str] = None


class AddWantedSkillRequest(BaseModel):
    """Request model for adding a skill that user wants to learn."""
    skill_id: UUID
    urgency_level: UrgencyLevel
    description: Optional[str] = None


class CreateSkillSwapRequest(BaseModel):
    """Request model for creating a skill swap request."""
    provider_id: str
    offered_skill_id: UUID
    wanted_skill_id: UUID
    message: Optional[str] = None


class UpdateSkillSwapRequest(BaseModel):
    """Request model for updating a skill swap (accept/reject)."""
    status: SwapStatus
    response_message: Optional[str] = None


# Extended models with joined data for API responses

class UserOfferedSkillWithDetails(UserOfferedSkill):
    """User offered skill with skill details."""
    skill: Skill


class UserWantedSkillWithDetails(UserWantedSkill):
    """User wanted skill with skill details."""
    skill: Skill


class SkillSwapWithDetails(SkillSwap):
    """Skill swap with full details including user and skill information."""
    requester_profile: Optional[UserProfile] = None
    provider_profile: Optional[UserProfile] = None
    offered_skill: Optional[UserOfferedSkillWithDetails] = None
    wanted_skill: Optional[UserWantedSkillWithDetails] = None


class UserProfileWithSkills(UserProfile):
    """User profile with their offered and wanted skills."""
    offered_skills: list[UserOfferedSkillWithDetails] = []
    wanted_skills: list[UserWantedSkillWithDetails] = []
