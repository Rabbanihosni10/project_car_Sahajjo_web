# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Step 1: Prepare for Deployment

The project is now configured for Vercel with:

- ✅ `vercel.json` configuration files
- ✅ SPA routing setup
- ✅ Build scripts configured
- ✅ MongoDB Atlas connected

### Step 2: Deploy Frontend to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/new)**

2. **Import Git Repository:**

   - Click "Add New Project"
   - Import your Git repository
   - Select the repository: `Car_Sahajjo`

3. **Configure Project:**

   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables:**
   Add these in Vercel dashboard under "Environment Variables":

   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `https://your-project.vercel.app`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from root directory
cd "d:\Versity Courses\CSE489 & CSE391\CSE391\Project\Car_Sahajjo"
vercel

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: [Select your account]
# - Link to existing project: N
# - Project name: car-sahajjo
# - In which directory is your code located: ./client
# - Override settings: Y
#   - Build Command: npm run build
#   - Output Directory: dist
#   - Development Command: npm run dev

# Production deployment
vercel --prod
```

### Step 3: Deploy Backend to Vercel (Optional)

If you want to deploy the backend on Vercel:

1. **Create `vercel.json` in server directory:**

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "index.js"
       }
     ]
   }
   ```

2. **Add Environment Variables:**

   - `MONGO_URI`
   - `JWT_SECRET`
   - `STORE_ID`
   - `STORE_PASSWORD`
   - `GEMINI_API_KEY`
   - etc.

3. **Deploy:**
   ```bash
   cd server
   vercel --prod
   ```

### Step 4: Update Frontend API URL

After backend is deployed, update the frontend environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` with your backend URL
3. Redeploy frontend

### Step 5: Verify Deployment

1. **Test Frontend Routes:**

   - Homepage: `https://your-project.vercel.app/`
   - Login: `https://your-project.vercel.app/login`
   - Browse Cars: `https://your-project.vercel.app/browse-cars`
   - Marketplace: `https://your-project.vercel.app/marketplace`

2. **Check Console for Errors:**

   - Open browser DevTools (F12)
   - Check Console and Network tabs
   - Verify API calls are working

3. **Test Core Features:**
   - User registration/login
   - Browse cars
   - Marketplace products
   - Booking system
   - Payment gateway

### Troubleshooting

#### 404 Error on Routes

- ✅ Fixed with `vercel.json` rewrites configuration
- Ensure `client/vercel.json` exists with proper rewrites

#### Build Fails

```bash
# Check build locally first
cd client
npm run build

# If successful, commit and push changes
git add .
git commit -m "Fix Vercel deployment configuration"
git push
```

#### Environment Variables Not Working

- Make sure all environment variables are added in Vercel Dashboard
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

#### API Connection Issues

- Verify VITE_API_URL is set correctly
- Check CORS settings in backend
- Ensure MongoDB Atlas network access allows Vercel IPs (0.0.0.0/0 for all)

### Current Configuration Files

✅ **Root `/vercel.json`** - Main Vercel configuration
✅ **`client/vercel.json`** - SPA routing rewrites  
✅ **`client/public/_redirects`** - Fallback for routing
✅ **`client/package.json`** - Added `vercel-build` script

### Next Steps

1. **Push changes to Git:**

   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push
   ```

2. **Deploy via Vercel Dashboard or CLI**

3. **Add environment variables**

4. **Test the deployed application**

Your application is now ready for production deployment! 🎉
