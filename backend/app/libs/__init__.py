"""
Library modules for the SkillXchange platform.

This package contains all the database models, repositories,
and utility functions for the application.
"""

# Import models explicitly to avoid star import issues
from app.libs.models import (
    UserProfile,
    Skill,
    UserOfferedSkill,
    UserWantedSkill,
    SkillSwap,
    UserOfferedSkillWithDetails,
    UserWantedSkillWithDetails,
    SkillSwapWithDetails,
    UserProfileWithSkills,
    CreateUserProfileRequest,
    UpdateUserProfileRequest,
    CreateSkillRequest,
    AddOfferedSkillRequest,
    AddWantedSkillRequest,
    CreateSkillSwapRequest,
    UpdateSkillSwapRequest,
    ProficiencyLevel,
    UrgencyLevel,
    SwapStatus
)

from app.libs.database import get_db_connection
from app.libs.user_repository import UserRepository
from app.libs.skill_repository import SkillRepository
from app.libs.swap_repository import SwapRepository

# Make all models available at package level
__all__ = [
    "UserProfile",
    "Skill",
    "UserOfferedSkill",
    "UserWantedSkill",
    "SkillSwap",
    "UserOfferedSkillWithDetails",
    "UserWantedSkillWithDetails",
    "SkillSwapWithDetails",
    "UserProfileWithSkills",
    "CreateUserProfileRequest",
    "UpdateUserProfileRequest",
    "CreateSkillRequest",
    "AddOfferedSkillRequest",
    "AddWantedSkillRequest",
    "CreateSkillSwapRequest",
    "UpdateSkillSwapRequest",
    "ProficiencyLevel",
    "UrgencyLevel",
    "SwapStatus",
    "get_db_connection",
    "UserRepository",
    "SkillRepository",
    "SwapRepository"
]
