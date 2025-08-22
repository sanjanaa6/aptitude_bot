#!/usr/bin/env python3
"""
Simple test script to verify backend structure and imports
"""

import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_imports():
    """Test that all modules can be imported correctly"""
    try:
        print("Testing imports...")
        
        # Test basic imports
        from models import QuizQuestion, Bookmark, Note
        print("✓ Models imported successfully")
        
        from database import init_database, close_database
        print("✓ Database module imported successfully")
        
        from auth import get_current_user, create_access_token
        print("✓ Auth module imported successfully")
        
        from quiz_service import get_quiz_questions
        print("✓ Quiz service imported successfully")
        
        from bookmark_service import create_bookmark, create_note
        print("✓ Bookmark service imported successfully")
        
        from routers.quiz import router as quiz_router
        print("✓ Quiz router imported successfully")
        
        from routers.bookmarks import router as bookmarks_router
        print("✓ Bookmarks router imported successfully")
        
        print("\n🎉 All imports successful! Backend structure is correct.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

async def test_database_connection():
    """Test database connection (without actually connecting)"""
    try:
        print("\nTesting database configuration...")
        from database import MONGO_URI, MONGO_DB
        print(f"✓ MongoDB URI: {MONGO_URI}")
        print(f"✓ Database name: {MONGO_DB}")
        return True
    except Exception as e:
        print(f"❌ Database config error: {e}")
        return False

if __name__ == "__main__":
    print("Backend Structure Test")
    print("=" * 50)
    
    # Run tests
    loop = asyncio.get_event_loop()
    
    # Test imports
    imports_ok = loop.run_until_complete(test_imports())
    
    # Test database config
    db_ok = loop.run_until_complete(test_database_connection())
    
    # Summary
    print("\n" + "=" * 50)
    if imports_ok and db_ok:
        print("✅ All tests passed! Backend is ready to run.")
        print("\nTo start the backend, run:")
        print("  python main.py")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)
