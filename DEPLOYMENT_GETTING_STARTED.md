# 🎯 Getting Started with Deployment

You have a fully functional full-stack application ready to deploy. Here's how to get started in 5 minutes.

---

## **Step 1: Choose Your Platform (1 minute)**

| Platform | Time | Cost | Best For |
|----------|------|------|----------|
| **Railway** ⭐ | 5 min | Free tier | Fast deployment |
| Local Docker | Immediate | Free | Testing locally |
| DigitalOcean | 15 min | $20/mo | Simple cloud |
| AWS | 30 min | $30/mo | Production |

**👉 Recommended: Start with Railway**

---

## **Option A: Deploy to Railway (5 minutes)**

### 1. Sign Up
Go to **[railway.app](https://railway.app)** and click **"Start for free"**
- Sign up with GitHub (easiest)
- Connect your GitHub account

### 2. Create Project
- Click **"New Project"**
- Click **"Deploy from GitHub repo"**
- Select `Aryan-theccool/alpha-digital-task-`

### 3. Railway Auto-Detects Your Setup
You'll see:
```
✓ Dockerfile detected in /backend
✓ Dockerfile detected in /frontend
✓ docker-compose.yml detected
```

Railway will automatically:
- Create PostgreSQL database
- Build backend from Dockerfile
- Build frontend from Dockerfile
- Set up networking

### 4. Configure Environment Variables
Click on each service and add:

**Backend Service:**
```
DATABASE_URL=provided by Railway PostgreSQL
CORS_ORIGINS=https://your-frontend-url
PORT=8000
```

**Frontend Service:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url/api
```

### 5. Deploy
Click **"Deploy"** button - Railway handles everything!

### 6. Access Your App
Once deployed (2-5 minutes):
- **Frontend:** Click on frontend service URL
- **Backend API:** Click on backend service URL
- **API Docs:** `https://backend-url/docs`

### 7. Seed Database (First Time Only)
```bash
# Railway CLI (if installed)
railway exec python seed.py

# Or via web dashboard: Services → Backend → Run command
```

---

## **Option B: Run Locally with Docker (Immediate)**

### Quick Start
```bash
# 1. Build images
docker-compose build

# 2. Start services
docker-compose up -d

# 3. Seed database
docker-compose exec backend python seed.py

# 4. Access
#    Frontend: http://localhost:3000
#    Backend:  http://localhost:8000
#    Docs:     http://localhost:8000/docs
```

### Stop Services
```bash
docker-compose down
```

---

## **Verify Deployment**

After deploying, test these endpoints:

### Health Check
```bash
curl https://your-backend-url/api/health
```

Response should be:
```json
{
  "status": "healthy",
  "app": "Digital Alpha API",
  "version": "1.0.0"
}
```

### Get Transactions
```bash
curl https://your-backend-url/api/transactions?limit=5
```

### Get Wallet Balance
```bash
curl https://your-backend-url/api/wallet
```

### Access Frontend
Open in browser: `https://your-frontend-url`

---

## **Troubleshooting**

### 1. Database Connection Failed
**Problem:** Backend can't connect to database

**Solution:**
- Check `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
- Verify database is running
- Check network connectivity

```bash
# Test locally
docker-compose exec postgres psql -U alpha -d digital_alpha
```

### 2. Frontend Can't Reach Backend
**Problem:** CORS error or "connection refused"

**Solution:**
- Check `NEXT_PUBLIC_API_URL` in frontend
- Verify `CORS_ORIGINS` in backend includes frontend URL
- Make sure backend is running and accessible

### 3. Port Already in Use
**Problem:** Docker fails to bind port

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### 4. Images Won't Build
**Problem:** Docker build fails

**Solution:**
```bash
# Clear cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

---

## **Next Steps After Deployment**

### Immediate (First Day)
- [ ] Test all API endpoints
- [ ] Verify frontend loads
- [ ] Check database connection
- [ ] Test rewards redemption

### Short-term (First Week)
- [ ] Set up custom domain
- [ ] Enable SSL/HTTPS
- [ ] Configure logging
- [ ] Set up monitoring

### Medium-term (First Month)
- [ ] Add authentication
- [ ] Set up backups
- [ ] Enable CDN
- [ ] Monitor performance

---

## **Key Files to Know**

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local deployment config |
| `backend/Dockerfile` | Backend container image |
| `frontend/Dockerfile` | Frontend container image |
| `DEPLOYMENT.md` | Detailed deployment guide |
| `DEPLOYMENT_QUICK_START.md` | Quick reference |
| `DEPLOYMENT_SUMMARY.md` | Complete checklist |

---

## **Useful Commands**

### Docker Compose
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# SSH into container
docker-compose exec backend bash

# Run command in container
docker-compose exec backend python seed.py
```

### Railway CLI
```bash
# Install
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs

# Execute command
railway exec python seed.py
```

---

## **Project Status**

### ✅ Ready to Deploy
- Backend API (FastAPI)
- Frontend (Next.js React)
- PostgreSQL Database
- Docker configuration
- CI/CD pipeline
- Documentation

### 📊 Data
- 9,960 transactions
- 11 categories
- 256,415 coins
- 6 reward options

### 🔗 GitHub
https://github.com/Aryan-theccool/alpha-digital-task-

---

## **Support**

### Documentation
- `DEPLOYMENT.md` - Detailed guide for all platforms
- `DEPLOYMENT_QUICK_START.md` - Quick reference
- `DEPLOYMENT_VISUAL_GUIDE.txt` - Visual reference

### Local Debugging
```bash
# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend

# SSH into backend
docker-compose exec backend bash

# SSH into database
docker-compose exec postgres bash
```

### Platform-Specific Help

**Railway:**
- Docs: https://docs.railway.app
- Status: https://railway-status.up.railway.app

**Docker:**
- Docs: https://docs.docker.com
- Troubleshooting: https://docs.docker.com/config/containers/troubleshoot

**AWS:**
- Docs: https://docs.aws.amazon.com

**DigitalOcean:**
- Docs: https://docs.digitalocean.com

---

## **Quick Decision Tree**

```
Want to deploy?
├─ Just test locally?
│  └─ Use: docker-compose up -d
│
├─ Need it on internet?
│  ├─ Quick & easy?
│  │  └─ Use: Railway
│  │
│  ├─ Cheap?
│  │  └─ Use: DigitalOcean
│  │
│  └─ Enterprise ready?
│     └─ Use: AWS
│
└─ Not sure?
   └─ Start with Railway, migrate later if needed
```

---

## **I'm Ready! What Now?**

1. **Pick a platform** (Railway recommended)
2. **Follow the steps** for your platform
3. **Test the deployment**
4. **Share with others**
5. **Continue building**

---

**Good luck with your deployment! 🚀**

Questions? Check the detailed guides or cloud platform documentation.

