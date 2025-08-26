#!/bin/bash

echo "🚀 Setting up Git repository for backend deployment..."

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Backend with PostgreSQL support and deployment config"

# Add remote repository (replace with your actual GitHub repo URL)
echo "📝 Please add your GitHub repository URL:"
echo "Example: https://github.com/yourusername/your-repo-name.git"
echo ""
echo "Run these commands:"
echo "git remote add origin YOUR_GITHUB_REPO_URL"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "Or if you want to force push to existing repo:"
echo "git push -u origin main --force" 