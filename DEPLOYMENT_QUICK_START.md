# Digital Alpha - Quick Deployment Guide

Choose your deployment platform below:

---

## 🚀 **Option 1: Railway (RECOMMENDED - 5 minutes)**

### Fastest cloud deployment. Free tier available.

1. Go to **https://railway.app** and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `Aryan-theccool/alpha-digital-task-`
4. Railway auto-detects the monorepo structure
5. Set environment variables:
   ```
   DATABASE_URL=provided by Railway PostgreSQL
   NEXT_PUBLIC_API_URL=https://your-backend-url/api
   CORS_ORIGINS=https://your-frontend-url
   ```
6. Click **Deploy** - Done!

**Cost:** Free tier (500 hrs/month) = Development/Demo
**Production:** ~$10-15/month

---

## 🐳 **Option 2: Local Docker (Dev/Testing)**

### Run everything locally in containers.

```bash
# Build and start
docker-compose build
docker-compose up -d

# Seed database (first time only)
docker-compose exec backend python seed.py

# Access
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# Docs:     http://localhost:8000/docs
```

**Requirements:** Docker Desktop installed

---

## ☁️ **Option 3: AWS (Production-Grade)**

### For enterprise/scalable deployment.

```bash
# Prerequisites
# - AWS account
# - AWS CLI installed
# - ECR repositories created

# Build and push to ECR
docker build -t digital-alpha-backend ./backend
docker tag digital-alpha-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/digital-alpha-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/digital-alpha-backend:latest

# Create ECS cluster, RDS database, and deploy
# (See DEPLOYMENT.md for detailed steps)
```

**Cost:** ~$30-45/month

---

## 🌊 **Option 4: DigitalOcean App Platform**

### Simple alternative to Railway.

1. Go to **https://cloud.digitalocean.com**
2. Create new **App Platform** project
3. Connect GitHub
4. Add services:
   - Backend (from `/backend/Dockerfile`)
   - Frontend (from `/frontend/Dockerfile`)
   - PostgreSQL (managed database)
5. Deploy

**Cost:** ~$20-25/month

---

## 🚢 **Option 5: Vercel (Frontend) + Render (Backend)**

### Best for JAM stack.

### Frontend on Vercel
1. Go to **https://vercel.com/new**
2. Import repo, set root to `frontend`
3. Deploy

### Backend on Render
1. Go to **https://render.com**
2. New Web Service from GitHub
3. Set root directory: `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
6. Deploy

**Cost:** Vercel free + Render ~$14/month

---

## 📋 **Deployment Checklist**

After deployment, verify:

- [ ] Frontend loads at https://your-frontend-url
- [ ] Backend API responds at https://your-backend-url/api/health
- [ ] Database is connected and seeded
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] SSL/HTTPS is enabled
- [ ] Health checks pass

---

## 🔧 **Database Seeding**

For cloud deployments, seed the database after first deployment:

**Railway/DigitalOcean:**
```bash
# Via CLI
railway exec python seed.py

# Or SSH into container and run
docker exec backend python seed.py
```

**AWS:**
```bash
aws ecs exec --cluster digital-alpha --task backend python seed.py
```

---

## 🆘 **Common Issues**

| Issue | Solution |
|-------|----------|
| Database connection fails | Check DATABASE_URL format and network access |
| Frontend can't reach backend | Verify NEXT_PUBLIC_API_URL and CORS settings |
| Port conflicts | Change ports in docker-compose.yml or cloud config |
| Images won't build | Ensure Docker is installed and running |
| Out of disk space | Clear Docker cache: `docker system prune -a` |

---

## 📚 **Next Steps**

1. **Choose your platform** from options above
2. **Follow deployment steps**
3. **Test the application**
4. **Set up monitoring** (check platform logs)
5. **Configure CI/CD** for auto-deployment on git push

---

## 📖 **Full Documentation**

For detailed instructions, see **DEPLOYMENT.md**

Need help? Check logs:
```bash
# Local
docker-compose logs backend
docker-compose logs frontend

# Railway
railway logs

# AWS
aws ecs describe-services --cluster digital-alpha --services backend
```

---

**Ready to deploy? Pick Option 1 (Railway) and you'll be done in 5 minutes! 🎉**
