"""
Repository layer for skill swap database operations.

This module contains functions for managing skill swap requests,
acceptance, rejection, and completion.
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from database import DatabaseManager
from models import (
    SkillSwap, SkillSwapWithDetails, SwapStatus,
    UserProfile, UserOfferedSkillWithDetails, UserWantedSkillWithDetails, Skill
)


class SwapRepository:
    """Repository for skill swap database operations."""
    
    @staticmethod
    async def create_skill_swap(
        requester_id: str,
        provider_id: str,
        offered_skill_id: UUID,
        wanted_skill_id: UUID,
        message: Optional[str] = None
    ) -> SkillSwap:
        """Create a new skill swap request."""
        data = {
            "requester_id": requester_id,
            "provider_id": provider_id,
            "offered_skill_id": offered_skill_id,
            "wanted_skill_id": wanted_skill_id,
            "message": message,
            "status": "pending"
        }
        
        row = await DatabaseManager.insert_and_return("skill_swaps", data)
        return SkillSwap(**row)
    
    @staticmethod
    async def get_skill_swap(swap_id: UUID) -> Optional[SkillSwap]:
        """Get a skill swap by ID."""
        query = "SELECT * FROM skill_swaps WHERE id = $1"
        rows = await DatabaseManager.execute_query(query, swap_id, fetch_mode="one")
        
        if not rows:
            return None
        
        return SkillSwap(**rows[0])
    
    @staticmethod
    async def get_skill_swap_with_details(swap_id: UUID) -> Optional[SkillSwapWithDetails]:
        """Get a skill swap with full details including user and skill information."""
        query = """
            SELECT 
                ss.*,
                -- Requester profile
                rp.name as requester_name,
                rp.location as requester_location,
                rp.profile_photo_url as requester_photo,
                rp.availability as requester_availability,
                rp.is_public as requester_is_public,
                rp.created_at as requester_created_at,
                rp.updated_at as requester_updated_at,
                -- Provider profile
                pp.name as provider_name,
                pp.location as provider_location,
                pp.profile_photo_url as provider_photo,
                pp.availability as provider_availability,
                pp.is_public as provider_is_public,
                pp.created_at as provider_created_at,
                pp.updated_at as provider_updated_at,
                -- Offered skill details
                uos.proficiency_level,
                uos.description as offered_skill_description,
                uos.created_at as offered_skill_created_at,
                s1.skill_name as offered_skill_name,
                s1.category as offered_skill_category,
                s1.description as offered_skill_desc,
                s1.created_at as offered_skill_table_created_at,
                -- Wanted skill details
                uws.urgency_level,
                uws.description as wanted_skill_description,
                uws.created_at as wanted_skill_created_at,
                s2.skill_name as wanted_skill_name,
                s2.category as wanted_skill_category,
                s2.description as wanted_skill_desc,
                s2.created_at as wanted_skill_table_created_at
            FROM skill_swaps ss
            LEFT JOIN user_profiles rp ON ss.requester_id = rp.user_id
            LEFT JOIN user_profiles pp ON ss.provider_id = pp.user_id
            LEFT JOIN user_offered_skills uos ON ss.offered_skill_id = uos.id
            LEFT JOIN skills s1 ON uos.skill_id = s1.id
            LEFT JOIN user_wanted_skills uws ON ss.wanted_skill_id = uws.id
            LEFT JOIN skills s2 ON uws.skill_id = s2.id
            WHERE ss.id = $1
        """
        
        rows = await DatabaseManager.execute_query(query, swap_id, fetch_mode="one")
        
        if not rows:
            return None
        
        row = rows[0]
        
        # Build the detailed response
        swap = SkillSwapWithDetails(
            id=row["id"],
            requester_id=row["requester_id"],
            provider_id=row["provider_id"],
            offered_skill_id=row["offered_skill_id"],
            wanted_skill_id=row["wanted_skill_id"],
            status=row["status"],
            message=row["message"],
            response_message=row["response_message"],
            created_at=row["created_at"],
            updated_at=row["updated_at"]
        )
        
        # Add requester profile if available
        if row["requester_name"] is not None:
            swap.requester_profile = UserProfile(
                id=row["requester_id"],  # Using user_id as id for compatibility
                user_id=row["requester_id"],
                name=row["requester_name"],
                location=row["requester_location"],
                profile_photo_url=row["requester_photo"],
                availability=row["requester_availability"],
                is_public=row["requester_is_public"],
                created_at=row["requester_created_at"],
                updated_at=row["requester_updated_at"]
            )
        
        # Add provider profile if available
        if row["provider_name"] is not None:
            swap.provider_profile = UserProfile(
                id=row["provider_id"],  # Using user_id as id for compatibility
                user_id=row["provider_id"],
                name=row["provider_name"],
                location=row["provider_location"],
                profile_photo_url=row["provider_photo"],
                availability=row["provider_availability"],
                is_public=row["provider_is_public"],
                created_at=row["provider_created_at"],
                updated_at=row["provider_updated_at"]
            )
        
        # Add offered skill details if available
        if row["offered_skill_name"] is not None:
            offered_skill = Skill(
                id=row["offered_skill_skill_id"],
                skill_name=row["offered_skill_name"],
                category=row["offered_skill_category"],
                description=row["offered_skill_desc"],
                created_at=row["offered_skill_table_created_at"]
            )
            
            swap.offered_skill = UserOfferedSkillWithDetails(
                id=row["offered_skill_id"],
                user_id=row["provider_id"],
                skill_id=row["offered_skill_skill_id"],
                proficiency_level=row["proficiency_level"],
                description=row["offered_skill_description"],
                created_at=row["offered_skill_created_at"],
                skill=offered_skill
            )
        
        # Add wanted skill details if available
        if row["wanted_skill_name"] is not None:
            wanted_skill = Skill(
                id=row["wanted_skill_skill_id"],
                skill_name=row["wanted_skill_name"],
                category=row["wanted_skill_category"],
                description=row["wanted_skill_desc"],
                created_at=row["wanted_skill_table_created_at"]
            )
            
            swap.wanted_skill = UserWantedSkillWithDetails(
                id=row["wanted_skill_id"],
                user_id=row["requester_id"],
                skill_id=row["wanted_skill_skill_id"],
                urgency_level=row["urgency_level"],
                description=row["wanted_skill_description"],
                created_at=row["wanted_skill_created_at"],
                skill=wanted_skill
            )
        
        return swap
    
    @staticmethod
    async def get_user_skill_swaps(
        user_id: str, 
        status: Optional[SwapStatus] = None,
        as_requester: Optional[bool] = None
    ) -> List[SkillSwap]:
        """Get skill swaps for a user, optionally filtered by status and role."""
        where_conditions = []
        params = []
        param_index = 1
        
        # User role filter
        if as_requester is True:
            where_conditions.append(f"requester_id = ${param_index}")
            params.append(user_id)
            param_index += 1
        elif as_requester is False:
            where_conditions.append(f"provider_id = ${param_index}")
            params.append(user_id)
            param_index += 1
        else:
            where_conditions.append(f"(requester_id = ${param_index} OR provider_id = ${param_index})")
            params.append(user_id)
            param_index += 1
        
        # Status filter
        if status:
            where_conditions.append(f"status = ${param_index}")
            params.append(status)
            param_index += 1
        
        query = f"""
            SELECT * FROM skill_swaps 
            WHERE {' AND '.join(where_conditions)}
            ORDER BY created_at DESC
        """
        
        rows = await DatabaseManager.execute_query(query, *params)
        return [SkillSwap(**row) for row in rows]
    
    @staticmethod
    async def update_skill_swap_status(
        swap_id: UUID,
        status: SwapStatus,
        response_message: Optional[str] = None
    ) -> Optional[SkillSwap]:
        """Update skill swap status and optional response message."""
        data = {"status": status}
        if response_message is not None:
            data["response_message"] = response_message
        
        row = await DatabaseManager.update_and_return(
            "skill_swaps", data, "id = ?", [swap_id]
        )
        
        if not row:
            return None
        
        return SkillSwap(**row)
    
    @staticmethod
    async def delete_skill_swap(swap_id: UUID) -> bool:
        """Delete a skill swap."""
        query = "DELETE FROM skill_swaps WHERE id = $1"
        await DatabaseManager.execute_query(query, swap_id, fetch_mode="none")
        return True
    
    @staticmethod
    async def get_pending_swaps_for_provider(user_id: str) -> List[SkillSwap]:
        """Get pending skill swap requests for a user as provider."""
        return await SwapRepository.get_user_skill_swaps(
            user_id, status="pending", as_requester=False
        )
    
    @staticmethod
    async def get_swap_statistics(user_id: str) -> Dict[str, int]:
        """Get swap statistics for a user."""
        query = """
            SELECT 
                status,
                COUNT(*) as count
            FROM skill_swaps 
            WHERE requester_id = $1 OR provider_id = $1
            GROUP BY status
        """
        
        rows = await DatabaseManager.execute_query(query, user_id)
        
        stats = {
            "pending": 0,
            "accepted": 0,
            "rejected": 0,
            "completed": 0,
            "cancelled": 0,
            "total": 0
        }
        
        for row in rows:
            status = row["status"]
            count = row["count"]
            stats[status] = count
            stats["total"] += count
        
        return stats
