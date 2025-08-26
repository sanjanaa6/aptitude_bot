import uuid
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from database import get_collection
from models import *

class GamificationService:
    def __init__(self):
        pass
    
    def _get_collection(self, name: str):
        """Get collection dynamically to avoid initialization timing issues"""
        collection = get_collection(name)
        if collection is None:
            raise Exception(f"Collection {name} not initialized. Database may not be ready.")
        return collection
    
    @property
    def badges_col(self):
        return self._get_collection("badges")
    
    @property
    def user_badges_col(self):
        return self._get_collection("user_badges")
    
    @property
    def user_stats_col(self):
        return self._get_collection("user_stats")
    
    @property
    def progress_col(self):
        return self._get_collection("progress")
    
    @property
    def quiz_results_col(self):
        return self._get_collection("quiz_results")
    
    @property
    def users_col(self):
        return self._get_collection("users")

    async def initialize_user_gamification(self, user_id: str):
        """Initialize gamification data for a new user"""
        try:
            # Initialize user stats
            await self.user_stats_col.update_one(
                {"user_id": user_id},
                {
                    "$setOnInsert": {
                        "user_id": user_id,
                        "total_points": 0,
                        "level": 1,
                        "experience": 0,
                        "experience_to_next_level": 100,
                        "badges_earned": 0,
                        "total_badges": 0,
                        "current_streak": 0,
                        "longest_streak": 0,
                        "topics_completed": 0,
                        "quizzes_taken": 0,
                        "quizzes_passed": 0,
                        "last_activity": datetime.utcnow().isoformat()
                    }
                },
                upsert=True
            )
            return True
        except Exception as e:
            print(f"Error initializing user gamification: {e}")
            return False

    async def add_points(self, user_id: str, points: int, reason: str):
        """Add points to user and check for level ups"""
        try:
            # Get current user stats
            user_stats = await self.user_stats_col.find_one({"user_id": user_id})
            if not user_stats:
                await self.initialize_user_gamification(user_id)
                user_stats = await self.user_stats_col.find_one({"user_id": user_id})

            current_points = user_stats.get("total_points", 0)
            current_level = user_stats.get("level", 1)
            current_exp = user_stats.get("experience", 0)
            exp_to_next = user_stats.get("experience_to_next_level", 100)

            # Add points and experience
            new_points = current_points + points
            new_exp = current_exp + points
            new_level = current_level
            new_exp_to_next = exp_to_next
            level_up = False

            # Check for level up
            while new_exp >= new_exp_to_next:
                new_level += 1
                new_exp -= new_exp_to_next
                new_exp_to_next = int(new_exp_to_next * 1.5)  # Exponential level progression
                level_up = True

            # Update user stats
            await self.user_stats_col.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "total_points": new_points,
                        "level": new_level,
                        "experience": new_exp,
                        "experience_to_next_level": new_exp_to_next,
                        "last_activity": datetime.utcnow().isoformat()
                    }
                }
            )

            return {
                "points_gained": points,
                "new_total": new_points,
                "level_up": level_up,
                "new_level": new_level
            }
        except Exception as e:
            print(f"Error adding points: {e}")
            return None

    async def update_study_streak(self, user_id: str):
        """Update user's study streak"""
        try:
            today = datetime.utcnow().date()
            
            # Get current user stats
            user_stats = await self.user_stats_col.find_one({"user_id": user_id})
            if not user_stats:
                await self.initialize_user_gamification(user_id)
                user_stats = await self.user_stats_col.find_one({"user_id": user_id})

            last_activity = user_stats.get("last_activity")
            current_streak = user_stats.get("current_streak", 0)
            longest_streak = user_stats.get("longest_streak", 0)

            if last_activity:
                last_date = datetime.fromisoformat(last_activity).date()
                days_diff = (today - last_date).days

                if days_diff == 1:  # Consecutive day
                    new_streak = current_streak + 1
                elif days_diff == 0:  # Same day
                    new_streak = current_streak
                else:  # Streak broken
                    new_streak = 1
            else:
                new_streak = 1

            # Update longest streak if necessary
            if new_streak > longest_streak:
                longest_streak = new_streak

            # Update user stats
            await self.user_stats_col.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "current_streak": new_streak,
                        "longest_streak": longest_streak,
                        "last_activity": datetime.utcnow().isoformat()
                    }
                }
            )

            return new_streak
        except Exception as e:
            print(f"Error updating study streak: {e}")
            return 0

    async def check_badges(self, user_id: str, action: str, data: Dict[str, Any] = None):
        """Check and award badges based on user actions"""
        try:
            # Get all available badges
            all_badges = await self.badges_col.find({}).to_list(length=None)
            if not all_badges:
                return []  # No badges defined yet

            # Get user's current stats
            user_stats = await self.user_stats_col.find_one({"user_id": user_id})
            if not user_stats:
                await self.initialize_user_gamification(user_id)
                user_stats = await self.user_stats_col.find_one({"user_id": user_id})

            # Get user's earned badges
            user_badges = await self.user_badges_col.find({"user_id": user_id}).to_list(length=None)
            earned_badge_ids = {ub["badge_id"] for ub in user_badges}

            newly_earned_badges = []

            for badge in all_badges:
                if badge["id"] in earned_badge_ids:
                    continue  # Already earned

                # Check if badge criteria are met
                if await self._check_badge_criteria(user_id, badge, action, data, user_stats):
                    # Award the badge
                    user_badge = {
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "badge_id": badge["id"],
                        "earned_at": datetime.utcnow().isoformat()
                    }
                    await self.user_badges_col.insert_one(user_badge)
                    
                    # Add points for the badge
                    if badge.get("points", 0) > 0:
                        await self.add_points(user_id, badge["points"], f"Badge earned: {badge['name']}")
                    
                    newly_earned_badges.append(badge)

            return newly_earned_badges
        except Exception as e:
            print(f"Error checking badges: {e}")
            return []

    async def _check_badge_criteria(self, user_id: str, badge: Dict, action: str, data: Dict[str, Any], user_stats: Dict):
        """Check if badge criteria are met"""
        criteria = badge.get("criteria", {})
        
        # Check action-based criteria
        if criteria.get("action") and criteria["action"] != action:
            return False

        # Check different types of criteria
        if "topics_completed" in criteria:
            completed_topics = await self.progress_col.count_documents({
                "user_id": user_id,
                "completed": True
            })
            if completed_topics < criteria["topics_completed"]:
                return False

        if "quizzes_taken" in criteria:
            quizzes_taken = await self.quiz_results_col.count_documents({"user_id": user_id})
            if quizzes_taken < criteria["quizzes_taken"]:
                return False

        if "quizzes_passed" in criteria:
            quizzes_passed = await self.quiz_results_col.count_documents({
                "user_id": user_id,
                "score": {"$gte": 70}  # 70% or higher to pass
            })
            if quizzes_passed < criteria["quizzes_passed"]:
                return False

        if "streak_days" in criteria:
            current_streak = user_stats.get("current_streak", 0)
            if current_streak < criteria["streak_days"]:
                return False

        if "longest_streak" in criteria:
            longest_streak = user_stats.get("longest_streak", 0)
            if longest_streak < criteria["longest_streak"]:
                return False

        if "points_earned" in criteria:
            total_points = user_stats.get("total_points", 0)
            if total_points < criteria["points_earned"]:
                return False

        if "level_reached" in criteria:
            level = user_stats.get("level", 1)
            if level < criteria["level_reached"]:
                return False

        if "badges_earned" in criteria:
            badges_earned = await self.user_badges_col.count_documents({"user_id": user_id})
            if badges_earned < criteria["badges_earned"]:
                return False

        return True

    async def get_user_gamification_data(self, user_id: str) -> GamificationResponse:
        """Get comprehensive gamification data for a user"""
        try:
            # Get user stats
            user_stats = await self.user_stats_col.find_one({"user_id": user_id})
            if not user_stats:
                await self.initialize_user_gamification(user_id)
                user_stats = await self.user_stats_col.find_one({"user_id": user_id})

            # Get user's badges
            user_badges = await self.user_badges_col.find({"user_id": user_id}).to_list(length=None)
            
            # Get badge details
            badges_with_details = []
            for user_badge in user_badges:
                badge = await self.badges_col.find_one({"id": user_badge["badge_id"]})
                if badge:
                    badges_with_details.append({
                        **user_badge,
                        "badge_name": badge["name"],
                        "badge_description": badge["description"],
                        "badge_icon": badge["icon"],
                        "badge_category": badge["category"],
                        "badge_rarity": badge["rarity"]
                    })

            # Get badge progress for unearned badges
            all_badges = await self.badges_col.find({}).to_list(length=None)
            earned_badge_ids = {ub["badge_id"] for ub in user_badges}
            badge_progress = []

            for badge in all_badges:
                if badge["id"] not in earned_badge_ids:
                    progress = await self._calculate_badge_progress(user_id, badge, user_stats)
                    if progress:
                        badge_progress.append(progress)

            # Get recent achievements (last 5 badges earned)
            recent_achievements = badges_with_details[-5:] if len(badges_with_details) > 5 else badges_with_details

            return GamificationResponse(
                user_stats=UserStats(**user_stats),
                badges=badges_with_details,
                badge_progress=badge_progress,
                recent_achievements=recent_achievements
            )
        except Exception as e:
            print(f"Error getting gamification data: {e}")
            return None

    async def _calculate_badge_progress(self, user_id: str, badge: Dict, user_stats: Dict) -> Optional[BadgeProgress]:
        """Calculate progress towards a specific badge"""
        try:
            criteria = badge.get("criteria", {})
            current_value = 0
            target_value = 0

            if "topics_completed" in criteria:
                current_value = await self.progress_col.count_documents({
                    "user_id": user_id,
                    "completed": True
                })
                target_value = criteria["topics_completed"]
            elif "quizzes_taken" in criteria:
                current_value = await self.quiz_results_col.count_documents({"user_id": user_id})
                target_value = criteria["quizzes_taken"]
            elif "quizzes_passed" in criteria:
                current_value = await self.quiz_results_col.count_documents({
                    "user_id": user_id,
                    "score": {"$gte": 70}
                })
                target_value = criteria["quizzes_passed"]
            elif "streak_days" in criteria:
                current_value = user_stats.get("current_streak", 0)
                target_value = criteria["streak_days"]
            elif "longest_streak" in criteria:
                current_value = user_stats.get("longest_streak", 0)
                target_value = criteria["longest_streak"]
            elif "points_earned" in criteria:
                current_value = user_stats.get("total_points", 0)
                target_value = criteria["points_earned"]
            elif "level_reached" in criteria:
                current_value = user_stats.get("level", 1)
                target_value = criteria["level_reached"]
            elif "badges_earned" in criteria:
                current_value = await self.user_badges_col.count_documents({"user_id": user_id})
                target_value = criteria["badges_earned"]
            else:
                return None

            progress = min(current_value / target_value, 1.0) if target_value > 0 else 0.0

            return BadgeProgress(
                badge_id=badge["id"],
                badge_name=badge["name"],
                progress=progress,
                current_value=current_value,
                target_value=target_value,
                is_earned=current_value >= target_value
            )
        except Exception as e:
            print(f"Error calculating badge progress: {e}")
            return None

    async def seed_default_badges(self):
        """Seed default badges for the system"""
        try:
            default_badges = [
                {
                    "id": "first_topic",
                    "name": "First Steps",
                    "description": "Complete your first topic",
                    "icon": "🎯",
                    "category": "progress",
                    "criteria": {"action": "topic_completed", "topics_completed": 1},
                    "rarity": "common",
                    "points": 10,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "topic_master",
                    "name": "Topic Master",
                    "description": "Complete 10 topics",
                    "icon": "📚",
                    "category": "progress",
                    "criteria": {"topics_completed": 10},
                    "rarity": "rare",
                    "points": 50,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "completionist",
                    "name": "Completionist",
                    "description": "Complete all available topics",
                    "icon": "🏆",
                    "category": "milestone",
                    "criteria": {"topics_completed": 39},  # All topics
                    "rarity": "legendary",
                    "points": 500,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "first_quiz",
                    "name": "Quiz Taker",
                    "description": "Take your first quiz",
                    "icon": "❓",
                    "category": "quiz",
                    "criteria": {"action": "quiz_completed", "quizzes_taken": 1},
                    "rarity": "common",
                    "points": 15,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "quiz_master",
                    "name": "Quiz Master",
                    "description": "Pass 10 quizzes",
                    "icon": "🧠",
                    "category": "quiz",
                    "criteria": {"quizzes_passed": 10},
                    "rarity": "epic",
                    "points": 100,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "streak_3",
                    "name": "Consistent Learner",
                    "description": "Maintain a 3-day study streak",
                    "icon": "🔥",
                    "category": "streak",
                    "criteria": {"streak_days": 3},
                    "rarity": "common",
                    "points": 25,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "streak_7",
                    "name": "Week Warrior",
                    "description": "Maintain a 7-day study streak",
                    "icon": "⚡",
                    "category": "streak",
                    "criteria": {"streak_days": 7},
                    "rarity": "rare",
                    "points": 75,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "streak_30",
                    "name": "Dedicated Scholar",
                    "description": "Maintain a 30-day study streak",
                    "icon": "💎",
                    "category": "streak",
                    "criteria": {"streak_days": 30},
                    "rarity": "legendary",
                    "points": 300,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "level_5",
                    "name": "Getting Started",
                    "description": "Reach level 5",
                    "icon": "⭐",
                    "category": "milestone",
                    "criteria": {"level_reached": 5},
                    "rarity": "common",
                    "points": 50,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "level_10",
                    "name": "Dedicated Learner",
                    "description": "Reach level 10",
                    "icon": "🌟",
                    "category": "milestone",
                    "criteria": {"level_reached": 10},
                    "rarity": "rare",
                    "points": 100,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "level_25",
                    "name": "Knowledge Seeker",
                    "description": "Reach level 25",
                    "icon": "💫",
                    "category": "milestone",
                    "criteria": {"level_reached": 25},
                    "rarity": "epic",
                    "points": 250,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "level_50",
                    "name": "Learning Master",
                    "description": "Reach level 50",
                    "icon": "👑",
                    "category": "milestone",
                    "criteria": {"level_reached": 50},
                    "rarity": "legendary",
                    "points": 500,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "first_badge",
                    "name": "Achievement Hunter",
                    "description": "Earn your first badge",
                    "icon": "🎖️",
                    "category": "special",
                    "criteria": {"badges_earned": 1},
                    "rarity": "common",
                    "points": 20,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "badge_collector",
                    "name": "Badge Collector",
                    "description": "Earn 10 badges",
                    "icon": "🏅",
                    "category": "special",
                    "criteria": {"badges_earned": 10},
                    "rarity": "epic",
                    "points": 200,
                    "created_at": datetime.utcnow().isoformat()
                }
            ]

            for badge in default_badges:
                await self.badges_col.update_one(
                    {"id": badge["id"]},
                    {"$set": badge},
                    upsert=True
                )

            return len(default_badges)
        except Exception as e:
            print(f"Error seeding default badges: {e}")
            return 0

    async def get_leaderboard(self, limit: int = 10):
        """Get leaderboard of top users"""
        try:
            # Get top users by points
            top_users = await self.user_stats_col.find().sort("total_points", -1).limit(limit).to_list(length=None)
            
            leaderboard = []
            for i, user_stats in enumerate(top_users):
                # Get user info - use ObjectId for proper lookup
                from bson import ObjectId
                try:
                    user = await self.users_col.find_one({"_id": ObjectId(user_stats["user_id"])})
                except:
                    # If ObjectId conversion fails, try direct string match
                    user = await self.users_col.find_one({"_id": user_stats["user_id"]})
                
                if user:
                    # Get badges count
                    badges_count = await self.user_badges_col.count_documents({
                        "user_id": user_stats["user_id"]
                    })

                    leaderboard.append({
                        "user_id": user_stats["user_id"],
                        "username": user.get("username", "Unknown"),
                        "total_points": user_stats.get("total_points", 0),
                        "level": user_stats.get("level", 1),
                        "badges_count": badges_count,
                        "streak": user_stats.get("current_streak", 0),
                        "rank": i + 1
                    })

            return leaderboard
        except Exception as e:
            print(f"Error getting leaderboard: {e}")
            return []

# Global instance
gamification_service = GamificationService()
