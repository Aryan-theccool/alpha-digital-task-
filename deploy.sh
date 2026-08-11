#!/bin/bash

# Digital Alpha Deployment Script
# Automates common deployment tasks

set -e

echo "╔════════════════════════════════════════════╗"
echo "║  Digital Alpha - Deployment Assistant     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Menu
show_menu() {
    echo -e "${BLUE}Select deployment option:${NC}"
    echo ""
    echo "  1) Local Docker Compose (Recommended for dev)"
    echo "  2) Railway (Recommended for production)"
    echo "  3) Prepare for AWS"
    echo "  4) Prepare for DigitalOcean"
    echo "  5) Build Docker images only"
    echo "  6) Run database seed"
    echo "  7) Check deployment status"
    echo ""
    read -p "Enter choice (1-7): " choice
}

# 1. Local Docker Compose
deploy_local() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker-compose build
    
    echo -e "${YELLOW}Starting services...${NC}"
    docker-compose up -d
    
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    sleep 5
    
    echo -e "${YELLOW}Seeding database...${NC}"
    docker-compose exec -T backend python seed.py
    
    echo ""
    echo -e "${GREEN}✓ Deployment complete!${NC}"
    echo ""
    echo "Access your application:"
    echo "  Frontend:   http://localhost:3000"
    echo "  Backend:    http://localhost:8000"
    echo "  API Docs:   http://localhost:8000/docs"
    echo ""
}

# 2. Railway
deploy_railway() {
    echo -e "${BLUE}Railway Deployment${NC}"
    echo ""
    echo "Manual steps required:"
    echo "  1. Go to https://railway.app"
    echo "  2. Sign up and connect your GitHub"
    echo "  3. Create new project from this repo"
    echo "  4. Add services: PostgreSQL, Backend, Frontend"
    echo "  5. Set environment variables (see DEPLOYMENT.md)"
    echo ""
    echo "Or use Railway CLI:"
    echo ""
    echo "  npm install -g @railway/cli"
    echo "  railway login"
    echo "  railway up"
    echo ""
}

# 3. AWS
prepare_aws() {
    echo -e "${BLUE}AWS Preparation${NC}"
    echo ""
    echo -e "${YELLOW}Building Docker images for ECR...${NC}"
    docker build -t digital-alpha-backend ./backend
    docker build -t digital-alpha-frontend ./frontend
    
    echo ""
    echo "Next steps:"
    echo "  1. Create AWS account and get AWS CLI"
    echo "  2. Run: aws configure"
    echo "  3. Create ECR repositories:"
    echo ""
    echo "     aws ecr create-repository --repository-name digital-alpha-backend"
    echo "     aws ecr create-repository --repository-name digital-alpha-frontend"
    echo ""
    echo "  4. Get ECR login token and push images"
    echo "  5. Create RDS PostgreSQL instance"
    echo "  6. Create ECS cluster and services"
    echo ""
    echo "See DEPLOYMENT.md for detailed instructions"
    echo ""
}

# 4. DigitalOcean
prepare_digitalocean() {
    echo -e "${BLUE}DigitalOcean Preparation${NC}"
    echo ""
    echo "Steps:"
    echo "  1. Go to https://cloud.digitalocean.com"
    echo "  2. Create new App Platform project"
    echo "  3. Connect your GitHub repository"
    echo "  4. Add services from Dockerfiles in:"
    echo "     - /backend/Dockerfile"
    echo "     - /frontend/Dockerfile"
    echo "  5. Add PostgreSQL database service"
    echo "  6. Set environment variables"
    echo "  7. Deploy"
    echo ""
}

# 5. Build only
build_docker() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker build -t digital-alpha-backend ./backend
    echo -e "${GREEN}✓ Backend image built${NC}"
    
    docker build -t digital-alpha-frontend ./frontend
    echo -e "${GREEN}✓ Frontend image built${NC}"
    
    echo ""
    docker images | grep digital-alpha
    echo ""
}

# 6. Seed database
seed_database() {
    echo -e "${YELLOW}Running database seed...${NC}"
    
    if docker-compose ps | grep -q "digital_alpha_backend"; then
        docker-compose exec -T backend python seed.py
        echo -e "${GREEN}✓ Database seeded successfully${NC}"
    else
        echo -e "${RED}✗ Backend container not running${NC}"
        echo "Start containers first with option 1"
    fi
    echo ""
}

# 7. Status
check_status() {
    echo -e "${BLUE}Deployment Status${NC}"
    echo ""
    
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✓ Docker installed${NC}"
    else
        echo -e "${RED}✗ Docker not installed${NC}"
    fi
    
    if command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✓ Docker Compose installed${NC}"
    else
        echo -e "${RED}✗ Docker Compose not installed${NC}"
    fi
    
    echo ""
    echo "Running containers:"
    docker-compose ps 2>/dev/null || echo "No running containers"
    echo ""
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1) deploy_local ;;
        2) deploy_railway ;;
        3) prepare_aws ;;
        4) prepare_digitalocean ;;
        5) build_docker ;;
        6) seed_database ;;
        7) check_status ;;
        *) echo -e "${RED}Invalid choice${NC}" ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
