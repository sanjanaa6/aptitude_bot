#!/usr/bin/env python3
"""
Environment setup script for Quantitative Chatbot
"""

import os
import shutil
from pathlib import Path

def setup_environment():
    """Set up environment configuration"""
    print("🔧 Quantitative Chatbot Environment Setup")
    print("=" * 50)
    
    # Check if .env already exists
    env_file = Path(".env")
    example_file = Path("env.example")
    
    if env_file.exists():
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (y/N): ").lower()
        if response != 'y':
            print("Setup cancelled.")
            return
    
    if not example_file.exists():
        print("❌ env.example file not found!")
        return
    
    # Copy example to .env
    try:
        shutil.copy(example_file, env_file)
        print("✅ Created .env file from env.example")
        
        # Read and display current settings
        with open(env_file, 'r') as f:
            content = f.read()
        
        print("\n📋 Current environment configuration:")
        print("-" * 30)
        for line in content.split('\n'):
            if line.strip() and not line.startswith('#'):
                if 'SECRET' in line or 'KEY' in line:
                    # Hide sensitive values
                    key, value = line.split('=', 1)
                    print(f"{key}=***HIDDEN***")
                else:
                    print(line)
        
        print("\n🔐 Important: Update the following in your .env file:")
        print("   - JWT_SECRET: Generate a strong secret key")
        print("   - OPENROUTER_API_KEY: Get from https://openrouter.ai")
        print("   - ALLOWED_ORIGINS: Set your frontend URLs")
        
        print("\n✅ Environment setup completed!")
        print("   Next: Update .env with your actual values and run the application")
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")

if __name__ == "__main__":
    setup_environment()
