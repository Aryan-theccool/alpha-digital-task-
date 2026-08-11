# Deploy to Render - Complete Step-by-Step Guide

This guide walks you through deploying Digital Alpha to Render.

---

## **Prerequisites**

- GitHub account (you have this ✓)
- Render account (free) - https://render.com
- Your repo pushed to GitHub ✓

---

## **Step 1: Create Render Account**

1. Go to **https://render.com**
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"**
4. Authorize Render to access your GitHub account
5. Complete signup

---

## **Step 2: Create PostgreSQL Database**

### 2.1: Create New Database
1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `digital-alpha-db`
   - **Database:** `digital_alpha`
   - **User:** `alpha`
   - **Region:** Choose closest to you (e.g., `us-east-1`)
   - **PostgreSQL Version:** 15
   - **Plan:** Free tier (generous for development)

3. Click **"Create Database"**
4. ⏳ Wait 2-3 minutes for database to initialize

### 2.2: Get Connection String
Once created:
1. Copy the **Internal Database URL** (starts with `postgresql://`)
   - Format: `postgresql://alpha:PASSWORD@host:5432/digital_alpha`
2. Save this - you'll need it for backend

**Example:**
```
postgresql://alpha:xxxxxxxxxxxx@dpg-xxxx-xxx.render.internal:5432/digital_alpha
```

---

## **Step 3: Deploy Backend**

### 3.1: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Select **"Deploy an existing repository"**
3. Search for and select: `alpha-digital-task-`
4. Click **"Connect"**

### 3.2: Configure Backend
1. **Name:** `alpha-digital-backend`
2. **Environment:** `Docker`
3. **Region:** Same as database (e.g., `us-east-1`)
4. **Branch:** `main`
5. **Root Directory:** `backend`

### 3.3: Set Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```
DATABASE_URL=postgresql://alpha:PASSWORD@dpg-xxxx.render.internal:5432/digital_alpha
PORT=10000
HOST=0.0.0.0
DEBUG=False
CORS_ORIGINS=*
```

**Important:** Replace `PASSWORD` and `dpg-xxxx` with your actual database URL from Step 2.2

### 3.4: Configure Build & Start
- **Build Command:** Leave empty (Render uses Dockerfile)
- **Start Command:** Leave empty (Render uses Dockerfile CMD)

### 3.5: Pricing Plan
- Select **"Free"** plan (for testing)
- Or **"Starter"** plan (~$7/month for production)

### 3.6: Deploy
Click **"Create Web Service"**

⏳ **Wait 3-5 minutes** for build and deployment

---

## **Step 4: Deploy Frontend**

### 4.1: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Select **"Deploy an existing repository"**
3. Search for and select: `alpha-digital-task-`
4. Click **"Connect"**

### 4.2: Configure Frontend
1. **Name:** `alpha-digital-frontend`
2. **Environment:** `Docker`
3. **Region:** Same as others
4. **Branch:** `main`
5. **Root Directory:** `frontend`

### 4.3: Set Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add:
```
NEXT_PUBLIC_API_URL=https://alpha-digital-backend.onrender.com/api
```

**Note:** Replace `alpha-digital-backend.onrender.com` with your actual backend URL (you'll get it after backend deploys)

### 4.4: Configure Build & Start
- **Build Command:** Leave empty
- **Start Command:** Leave empty

### 4.5: Pricing Plan
- Select **"Free"** plan

### 4.6: Deploy
Click **"Create Web Service"**

⏳ **Wait 5-10 minutes** for build and deployment

---

## **Step 5: Update Frontend Environment Variable**

Once backend is deployed:

### 5.1: Get Backend URL
1. Go to Render dashboard
2. Click on `alpha-digital-backend` service
3. Copy the URL from the top (e.g., `https://alpha-digital-backend.onrender.com`)

### 5.2: Update Frontend
1. Click on `alpha-digital-frontend` service
2. Go to **"Environment"** tab
3. Edit `NEXT_PUBLIC_API_URL` to:
   ```
   https://alpha-digital-backend.onrender.com/api
   ```
4. Click **"Save"** → Render redeploys automatically

### 5.3: Update Backend CORS (if needed)
1. Click on `alpha-digital-backend` service
2. Go to **"Environment"** tab
3. Edit `CORS_ORIGINS`:
   ```
   https://alpha-digital-frontend.onrender.com
   ```
4. Click **"Save"**

---

## **Step 6: Seed Database**

Once backend is running:

### 6.1: Access Backend Shell
1. Go to `alpha-digital-backend` service
2. Click **"Shell"** tab
3. In the terminal:
   ```bash
   cd /app
   python seed.py
   ```

4. Wait for seeding to complete
   ```
   ✓ Successfully seeded database:
     - Unique transactions ingested: 9960
     - Duplicates skipped: 40
     - Categories mapped: 11
     - Initial coin balance: 256,415 coins
   ```

### 6.2: Alternative - Via Render Dashboard
If Shell doesn't work:
1. In backend service, click **"Settings"**
2. Scroll to **"Build Command"**
3. Set: `python seed.py && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

(This seeds on every deploy but is slower)

---

## **Step 7: Verify Deployment**

### 7.1: Test Backend
```bash
curl https://alpha-digital-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "app": "Digital Alpha API",
  "version": "1.0.0"
}
```

### 7.2: Test API Endpoints
```bash
# Get transactions
curl https://alpha-digital-backend.onrender.com/api/transactions?limit=5

# Get wallet
curl https://alpha-digital-backend.onrender.com/api/wallet

# View API docs
# Open in browser: https://alpha-digital-backend.onrender.com/docs
```

### 7.3: Test Frontend
1. Open frontend URL in browser: `https://alpha-digital-frontend.onrender.com`
2. Check:
   - ✓ Page loads
   - ✓ Transactions display
   - ✓ Charts render
   - ✓ Rewards section loads

---

## **Environment Variables Reference**

### Backend (PostgreSQL)
```
DATABASE_URL=postgresql://alpha:PASSWORD@dpg-xxx.render.internal:5432/digital_alpha
PORT=10000
HOST=0.0.0.0
DEBUG=False
CORS_ORIGINS=https://alpha-digital-frontend.onrender.com
```

### Frontend
```
NEXT_PUBLIC_API_URL=https://alpha-digital-backend.onrender.com/api
```

---

## **Common URLs After Deployment**

- **Frontend:** `https://alpha-digital-frontend.onrender.com`
- **Backend API:** `https://alpha-digital-backend.onrender.com`
- **API Docs:** `https://alpha-digital-backend.onrender.com/docs`
- **Health Check:** `https://alpha-digital-backend.onrender.com/api/health`

---

## **Troubleshooting**

### ❌ Backend won't build
**Problem:** Docker build fails

**Solution:**
1. Check build logs in Render dashboard
2. Verify `backend/Dockerfile` exists
3. Verify `backend/requirements.txt` exists
4. Try redeploying: Go to service → **"Deploy"** → **"Latest commit"**

### ❌ Database connection fails
**Problem:** `ERROR: could not translate host name "dpg-xxx.render.internal"`

**Solution:**
1. Check `DATABASE_URL` in environment variables
2. Make sure it's the **Internal Database URL**, not public
3. Verify database is running (check Render dashboard)
4. Restart backend service: Go to service → **"Restart"**

### ❌ Frontend can't reach backend
**Problem:** CORS error or connection timeout

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` - should match backend URL exactly
2. Check backend `CORS_ORIGINS` includes frontend URL
3. Verify backend is running and responding to health check
4. Check browser console for actual error

### ❌ Free tier keeps spinning down
**Problem:** Service goes to sleep after 15 min inactivity

**Solution:**
1. Upgrade to **Starter** plan (~$7/month each)
2. Or use **cron-job.org** to ping service every 10 minutes (keeps it warm)

### ❌ Seed script not running
**Problem:** Database is empty after deployment

**Solution:**
1. SSH into backend via Render Shell
2. Run: `python seed.py`
3. Check output for success message

### ❌ Large file uploads/deployments
**Problem:** Build times out or fails

**Solution:**
1. Check that `.env` files aren't too large
2. Remove any large test data from repo
3. Increase memory: Go to service → **"Settings"** → upgrade plan

---

## **Monitoring & Logs**

### View Logs
1. Go to service (backend or frontend)
2. Click **"Logs"** tab
3. See real-time logs

### Check Service Status
1. Go to Render dashboard
2. See service status:
   - 🟢 **Running** - Healthy
   - 🟡 **Deploying** - Building/starting
   - 🔴 **Failed** - Check logs

---

## **Next Steps**

### Immediate
- [ ] Test frontend and backend URLs
- [ ] Verify database is seeded
- [ ] Check API endpoints work

### Short-term (This Week)
- [ ] Set up custom domain (if needed)
- [ ] Monitor logs for errors
- [ ] Test user flows

### Medium-term (This Month)
- [ ] Upgrade to Starter plan for production
- [ ] Set up monitoring alerts
- [ ] Configure backups

---

## **Cost Breakdown**

| Service | Free Tier | Starter | Notes |
|---------|-----------|---------|-------|
| Backend | $0 | ~$7/mo | Includes 750 hours/month |
| Frontend | $0 | ~$7/mo | Includes 750 hours/month |
| PostgreSQL | $0 | ~$15/mo | 1GB storage free |
| **Total** | **$0** | **~$29/mo** | Free for development |

---

## **Summary**

✅ **Deployment Checklist**

- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] Database seeded
- [ ] Backend API tested
- [ ] Frontend loads and works
- [ ] CORS configured
- [ ] API URLs verified

---

## **Quick Reference Commands**

```bash
# Check backend health
curl https://alpha-digital-backend.onrender.com/api/health

# Get transactions
curl https://alpha-digital-backend.onrender.com/api/transactions?limit=5

# Get wallet info
curl https://alpha-digital-backend.onrender.com/api/wallet

# View API docs
https://alpha-digital-backend.onrender.com/docs
```

---

## **Support**

### Render Documentation
- Getting Started: https://render.com/docs
- PostgreSQL: https://render.com/docs/databases
- Web Services: https://render.com/docs/web-services
- Environment Variables: https://render.com/docs/environment-variables

### Contact Support
- Help: https://render.com/support
- Status: https://status.render.com

---

**You're ready to deploy to Render! Follow the steps above in order. 🚀**

Estimated total time: **30-40 minutes**

Any issues? Check the Troubleshooting section above.

