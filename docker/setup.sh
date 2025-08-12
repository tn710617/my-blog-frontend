#!/bin/bash

# Docker Development Environment Setup Script

echo "🐳 Setting up Docker development environment for React Blog Frontend"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env.local exists, if not create from template
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from Docker template..."
    cp .env.docker.template .env.local
    echo "✅ Created .env.local with Docker-compatible API URL"
    echo "💡 Make sure your backend server is running on the host machine"
else
    echo "📋 .env.local already exists"
    
    # Check if it uses localhost (needs to be changed for Docker)
    if grep -q "localhost" .env.local; then
        echo "⚠️  WARNING: .env.local contains 'localhost' which won't work from Docker"
        echo "💡 Consider using 'host.docker.internal' instead for Docker development"
        echo "💡 You can use the .env.docker.template as reference"
    fi
fi

echo ""
echo "🚀 Ready to start! Use these commands:"
echo "   docker-compose up          - Start development server"
echo "   docker-compose down        - Stop containers"
echo "   docker-compose build       - Rebuild containers"
echo ""
echo "📡 Your backend API should be accessible at the URL in .env.local"
echo "🌐 Frontend will be available at http://localhost:3000"