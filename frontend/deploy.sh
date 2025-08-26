#!/bin/bash

echo "🚀 Deploying Frontend to Render..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Build the project locally to test
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Push your code to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Add frontend deployment config'"
    echo "   git push origin main"
    echo ""
    echo "2. Deploy on Render:"
    echo "   - Go to render.com dashboard"
    echo "   - Create new Static Site"
    echo "   - Connect your GitHub repository"
    echo "   - Set environment variable: VITE_API_URL=https://your-backend-app.onrender.com"
    echo ""
    echo "3. Update your backend CORS settings to allow your frontend domain"
else
    echo "❌ Build failed! Please fix the errors before deploying."
    exit 1
fi 