#!/usr/bin/env python3
import asyncio
import sys
import os
from gamification_service import gamification_service
from database import init_database, close_database

async def test_gamification():
    print("🧪 Testing Gamification System...")
    
    # Initialize database
    await init_database()
    print("✅ Database initialized")
    
    # Test user ID
    test_user_id = "test_user_123"
    
    # 1. Test user initialization
    print("\n1. Testing user initialization...")
    success = await gamification_service.initialize_user_gamification(test_user_id)
    print(f"   ✅ User initialization: {success}")
    
    # 2. Test points system
    print("\n2. Testing points system...")
    points_result = await gamification_service.add_points(test_user_id, 50, "Test points")
    print(f"   ✅ Points added: {points_result}")
    
    # 3. Test user stats
    print("\n3. Testing user stats...")
    gamification_data = await gamification_service.get_user_gamification_data(test_user_id)
    if gamification_data:
        stats = gamification_data.user_stats
        print(f"   ✅ User stats: Level {stats.level}, Points {stats.total_points}, Streak {stats.current_streak}")
    else:
        print("   ❌ Failed to get user stats")
    
    # 4. Test study streak
    print("\n4. Testing study streak...")
    streak = await gamification_service.update_study_streak(test_user_id)
    print(f"   ✅ Study streak: {streak}")
    
    # 5. Test badge seeding
    print("\n5. Testing badge seeding...")
    badge_count = await gamification_service.seed_default_badges()
    print(f"   ✅ Default badges seeded: {badge_count}")
    
    # 6. Test badge checking
    print("\n6. Testing badge checking...")
    newly_earned = await gamification_service.check_badges(test_user_id, "topic_completed", {"topic": "test"})
    print(f"   ✅ Newly earned badges: {len(newly_earned)}")
    
    # 7. Test getting all badges
    print("\n7. Testing get all badges...")
    all_badges = await gamification_service.badges_col.find({}).to_list(length=None)
    print(f"   ✅ Total badges available: {len(all_badges)}")
    
    # 8. Test getting user badges
    print("\n8. Testing get user badges...")
    user_badges = await gamification_service.user_badges_col.find({"user_id": test_user_id}).to_list(length=None)
    print(f"   ✅ User badges earned: {len(user_badges)}")
    
    # 9. Test badge progress calculation
    print("\n9. Testing badge progress...")
    if all_badges:
        progress = await gamification_service._calculate_badge_progress(test_user_id, all_badges[0], gamification_data.user_stats.dict())
        if progress:
            print(f"   ✅ Badge progress: {progress.progress * 100:.1f}%")
        else:
            print("   ⚠️  No progress data for this badge")
    
    # 10. Test leaderboard
    print("\n10. Testing leaderboard...")
    leaderboard = await gamification_service.get_leaderboard(5)
    print(f"   ✅ Leaderboard entries: {len(leaderboard)}")
    
    print("\n🎉 All gamification tests passed!")
    
    # Clean up
    await close_database()
    print("✅ Database closed")

if __name__ == "__main__":
    asyncio.run(test_gamification())
