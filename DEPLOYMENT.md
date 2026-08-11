# Digital Alpha - Deployment Guide

This guide covers multiple deployment options for the Digital Alpha full-stack application.

## Prerequisites

- Docker & Docker Compose installed
- Git installed
- GitHub account (for deploying to cloud platforms)

---

## **Option 1: Local Docker Compose (Easiest)**

Deploy everything locally with a single command.

### Setup

```bash
# Navigate to project root
cd digital-alpha

# Build images
docker-compose build

# Start all services (Postgres, Backend, Frontend)
docker-compose up -d

# Check services
docker-compose ps

# Seed database (run once)
docker-compose exec backend python seed.py
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (postgres/alphapassword)

### Stop

```bash
docker-compose down
```

---

## **Option 2: Railway (Recommended - Easiest Cloud)**

Deploy to Railway in under 5 minutes. Free tier available.

### Steps

1. **Sign up** at https://railway.app
2. **Connect GitHub repo** to Railway
3. **Create new project** → Select GitHub repo → Select `digital-alpha`
4. **Add services**:
   - PostgreSQL (built-in)
   - Backend (from `/backend`)
   - Frontend (from `/frontend`)

5. **Set environment variables**:
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   CORS_ORIGINS=https://your-frontend.railway.app
   ```

6. **Deploy** - Railway auto-deploys on git push

### Cost
- Free tier: 500 hours/month (enough for demo)
- Frontend + Backend: ~$5-10/month
- PostgreSQL: Included in free tier

---

## **Option 3: Vercel (Frontend Only) + Render (Backend + DB)**

### Frontend on Vercel

1. Go to https://vercel.com/new
2. Import GitHub repo
3. Set root directory: `frontend`
4. Deploy

### Backend + Database on Render

1. Go to https://render.com
2. Create new PostgreSQL database
3. Create new Web Service from GitHub
4. Set root directory: `backend`
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
7. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   CORS_ORIGINS=https://your-vercel-frontend.vercel.app
   ```

### Cost
- Vercel: Free
- Render: ~$7/month (database) + ~$7/month (backend)

---

## **Option 4: AWS (ECS + RDS)**

For production-grade deployment.

### Steps

1. **Create RDS PostgreSQL instance**
   - Engine: PostgreSQL 15
   - Instance class: db.t3.micro (free tier eligible)
   - Multi-AZ: No (for cost savings)

2. **Build Docker images**
   ```bash
   docker build -t digital-alpha-backend ./backend
   docker build -t digital-alpha-frontend ./frontend
   ```

3. **Push to ECR (Elastic Container Registry)**
   ```bash
   aws ecr create-repository --repository-name digital-alpha-backend
   aws ecr create-repository --repository-name digital-alpha-frontend
   
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   
   # Tag and push images
   docker tag digital-alpha-backend:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/digital-alpha-backend:latest
   docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/digital-alpha-backend:latest
   ```

4. **Create ECS Cluster & Services**
   - Backend service (port 8000)
   - Frontend service (port 3000)
   - Load Balancer

### Cost
- RDS (db.t3.micro): ~$20-30/month
- EC2 (t3.small): ~$10-15/month
- Total: ~$30-45/month

---

## **Option 5: DigitalOcean App Platform**

Simple alternative to Railway.

### Steps

1. Go to https://cloud.digitalocean.com/apps
2. Connect GitHub repo
3. Create new app from repo
4. Add components:
   - Backend (Dockerfile in `/backend`)
   - Frontend (Dockerfile in `/frontend`)
   - PostgreSQL database (managed)
5. Set environment variables
6. Deploy

### Cost
- App Starter: $5/month (backend + frontend)
- PostgreSQL: $15/month
- Total: ~$20/month

---

## **Option 6: Heroku (Deprecated but still works)**

Note: Free tier removed. Cheapest paid tier starts at $7/month per dyno.

---

## **Recommended Approach**

For development/demo: **Railway** or **Local Docker Compose**
- Fastest to deploy
- Free tier available
- Auto-deploys on git push

For production: **AWS ECS** or **DigitalOcean**
- Better scalability
- Better performance
- More control

---

## **Post-Deployment Checklist**

- [ ] Database is seeded with transactions
- [ ] Frontend connects to backend API
- [ ] Health check passes on all services
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] API documentation is accessible
- [ ] Error logs are monitored

---

## **Troubleshooting**

### Backend not connecting to database
```bash
# Check connection string format
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### Frontend can't reach backend
```bash
# Ensure CORS_ORIGINS includes frontend URL
# Ensure NEXT_PUBLIC_API_URL is correctly set
```

### Database seeding issues
```bash
# Manually seed after deployment
docker-compose exec backend python seed.py
```

---

## **Quick Deploy Commands**

### Local Docker
```bash
docker-compose build && docker-compose up -d
```

### Railway (via CLI)
```bash
npm i -g @railway/cli
railway login
railway up
```

### AWS CLI
```bash
aws ecs create-service --cluster digital-alpha --service-name backend --task-definition digital-alpha-backend
```

---

For questions or issues, check the logs:

```bash
# Local Docker
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Railway
railway logs

# AWS
aws ecs describe-services --cluster digital-alpha --services backend
```
