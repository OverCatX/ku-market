# Production Deployment Guide

Complete guide for deploying KU Market to production.

## Prerequisites

- Node.js 20+
- MongoDB (Atlas recommended for production)
- Cloudinary account
- Stripe account (production keys)
- SMTP service (Gmail or professional email service)
- Domain name (optional but recommended)
- SSL certificate (required for HTTPS)

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set:

**Backend (.env):**

```env
NODE_ENV=production
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/ku_market?retryWrites=true&w=majority
JWT_SECRET=<generate-strong-secret-32-chars-min>
PORT=8080
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_live_your_production_key
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
FRONTEND_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://api.your-domain.com/api/auth/google/callback
SESSION_SECRET=<generate-strong-secret-32-chars-min>
CORS_ORIGIN=https://your-domain.com
```

**Frontend (.env.local):**

```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE=https://api.your-domain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
```

### 2. Security

- ✅ Generate strong secrets (minimum 32 characters):
  ```bash
  openssl rand -base64 32
  ```
- ✅ Use production Stripe keys (not test keys)
- ✅ Enable HTTPS/SSL
- ✅ Set secure CORS origins
- ✅ Use MongoDB Atlas with IP whitelisting
- ✅ Enable MongoDB authentication
- ✅ Use strong database passwords

### 3. Database

- ✅ Use MongoDB Atlas (recommended) or managed MongoDB
- ✅ Enable authentication
- ✅ Whitelist only necessary IPs
- ✅ Enable backups
- ✅ Set up monitoring

### 4. Build & Test

```bash
# Backend
cd backend
npm ci
npm run build
npm test

# Frontend
cd frontend
npm ci
npm run build
npm test
```

## Deployment Options

### Option 1: Docker Compose (Recommended for VPS)

1. **Prepare environment files:**

   ```bash
   cp .env.example backend/.env
   cp .env.example frontend/.env.local
   # Edit both files with production values
   ```

2. **Build and start:**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Create admin account:**
   ```bash
   docker exec -it ku-market-backend npm run bootstrap-admin
   ```

### Option 2: Manual Deployment

#### Backend

1. **Build:**

   ```bash
   cd backend
   npm ci --only=production
   npm run build
   ```

2. **Start with PM2 (recommended):**

   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name ku-market-backend
   pm2 save
   pm2 startup
   ```

3. **Or use systemd:**

   ```bash
   # Create service file: /etc/systemd/system/ku-market-backend.service
   [Unit]
   Description=KU Market Backend
   After=network.target

   [Service]
   Type=simple
   User=nodejs
   WorkingDirectory=/var/www/ku-market/backend
   ExecStart=/usr/bin/node dist/server.js
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

#### Frontend

1. **Build:**

   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Start with PM2:**

   ```bash
   pm2 start npm --name ku-market-frontend -- start
   pm2 save
   ```

3. **Or use systemd:**

   ```bash
   # Create service file: /etc/systemd/system/ku-market-frontend.service
   [Unit]
   Description=KU Market Frontend
   After=network.target

   [Service]
   Type=simple
   User=nodejs
   WorkingDirectory=/var/www/ku-market/frontend
   ExecStart=/usr/bin/npm start
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

### Option 3: Platform-as-a-Service (PaaS)

#### Render.com

1. **Backend Service:**

   - Connect GitHub repository
   - Set root directory: `backend`
   - Build command: `npm ci && npm run build`
   - Start command: `node dist/server.js`
   - Add all environment variables

2. **Frontend Service:**
   - Connect GitHub repository
   - Set root directory: `frontend`
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Add environment variables

#### Vercel (Frontend only)

1. Connect GitHub repository
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `.next`
5. Add environment variables

#### Railway / Heroku

Similar to Render.com setup.

## Post-Deployment

### 1. Verify Deployment

- ✅ Backend health check: `https://api.your-domain.com/api/health`
- ✅ Frontend loads: `https://your-domain.com`
- ✅ API endpoints respond correctly
- ✅ Database connection works
- ✅ File uploads work (Cloudinary)
- ✅ Payments work (Stripe)
- ✅ Email sending works (SMTP)

### 2. Create Admin Account

```bash
# Docker
docker exec -it ku-market-backend npm run bootstrap-admin

# Manual
cd backend
npm run bootstrap-admin
```

### 3. Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor server resources (CPU, memory, disk)
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor MongoDB performance
- Track API response times

### 4. Backup Strategy

- **Database:** Enable MongoDB Atlas automated backups
- **Files:** Cloudinary handles image backups
- **Code:** Git repository serves as code backup

### 5. Security Hardening

- ✅ Enable rate limiting (already configured)
- ✅ Use HTTPS only
- ✅ Set secure cookie flags
- ✅ Enable CORS for specific origins only
- ✅ Regular security updates
- ✅ Monitor for vulnerabilities: `npm audit`

## Performance Optimization

### Backend

- MongoDB connection pooling (configured)
- Compression enabled (gzip)
- Rate limiting active
- Query optimization (`.lean()` for read operations)

### Frontend

- Next.js standalone build
- Image optimization enabled
- Code splitting configured
- Static asset caching

## Troubleshooting

### Backend won't start

1. Check environment variables: `validateEnv()` will show missing vars
2. Check MongoDB connection
3. Check port availability
4. Check logs: `pm2 logs ku-market-backend` or `docker logs ku-market-backend`

### Frontend build fails

1. Check Node.js version (20+)
2. Clear cache: `rm -rf .next node_modules && npm ci`
3. Check environment variables
4. Review build logs

### Database connection issues

1. Verify MongoDB URL format
2. Check IP whitelist (MongoDB Atlas)
3. Verify credentials
4. Check network connectivity

### Payment issues

1. Verify Stripe keys are production keys
2. Check Stripe webhook configuration
3. Review payment logs in Stripe dashboard

## Maintenance

### Regular Tasks

- **Weekly:** Review error logs
- **Monthly:** Update dependencies (`npm audit fix`)
- **Quarterly:** Security audit
- **As needed:** Database optimization

### Updates

1. Pull latest code
2. Run tests
3. Build and deploy
4. Monitor for issues
5. Rollback if necessary

## Support

For issues or questions:

- GitHub Issues: [https://github.com/OverCatX/ku-market/issues](https://github.com/OverCatX/ku-market/issues)
- Documentation: See [docs/](docs/) directory
