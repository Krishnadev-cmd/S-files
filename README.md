# S-Files - Modern File Management System

A comprehensive, production-ready file management platform built with Next.js 15, designed specifically for **students to store files as a cluster and understand their content using AI**. Features Google authentication, cloud storage integration, and modern web technologies.

## 🚀 Live Demo

**🌐 Production URL**: [https://s-files.vercel.app](https://s-files.vercel.app)

**✨ Try it now**: Sign in with your Google account and experience seamless file management with AI-powered insights!

## 🎓 Purpose & Vision

**S-Files** is designed as an **educational file management platform** where students can:
- **📚 Store and organize files collectively** - Create a collaborative learning environment
- **🤖 Understand file content with AI** - Get intelligent insights about uploaded documents
- **🎯 Learn modern web development** - Built with industry-standard technologies
- **☁️ Experience cloud storage** - Hands-on experience with S3-compatible storage solutions

## ✨ Features

- **🔐 Secure Authentication** - Google OAuth integration with NextAuth.js v5 (JWT sessions)
- **☁️ Dual Cloud Storage** - S3-compatible MinIO for development, Cloudflare R2 object storage for production
- **🤖 AI-Powered File Analysis** - Understand and analyze file content using advanced AI integration
- **👥 Collaborative File Clusters** - Students can store and share files in organized clusters
- **📤 Advanced File Upload** - S3 Presigned URLs with CORS support for direct browser uploads
- **🎨 Beautiful UI** - Modern glass-morphism design with animated backgrounds
- **📁 Complete File Management** - Upload, download, view, and delete files with real-time feedback
- **🗄️ Database Integration** - PostgreSQL with Prisma ORM and Prisma Accelerate
- **🌐 Production Optimized** - Deployed on Vercel with automatic CI/CD
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - Latest React framework with App Router
- **React 19** - Modern React with latest features
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Utility-first styling with custom animations

### **Authentication**
- **NextAuth.js v5** - Modern authentication with JWT sessions
- **Google OAuth** - Secure Google Sign-In integration

### **Database & Storage**
- **PostgreSQL** - Robust relational database via Supabase
- **Prisma ORM** - Type-safe database client with Accelerate
- **MinIO** - S3-compatible local development storage for hands-on learning
- **Cloudflare R2 Object Storage** - Production-grade S3-compatible cloud storage with global CDN
- **AWS S3 SDK** - Universal interface for S3-compatible storage systems

### **AI & Intelligence**
- **AI Integration** - Smart file content analysis and understanding
- **Content Recognition** - Automated file categorization and insights
- **Educational Analytics** - Learning-focused file organization

### **Deployment & DevOps**
- **Vercel** - Serverless deployment with automatic builds
- **Docker** - Containerized MinIO for local development
- **S3-Compatible Architecture** - Learn industry-standard object storage patterns

## 📋 Prerequisites

- **Node.js 18+** and npm/yarn
- **PostgreSQL database** (Supabase recommended)
- **Google Cloud Console** account for OAuth
- **Cloudflare account** for R2 storage
- **Vercel account** for deployment
- **Docker** (optional, for local MinIO)

## 🎓 Educational Benefits

### **Learn Object Storage Patterns**
S-Files provides hands-on experience with **S3-compatible object storage**, the industry standard used by:
- **Amazon S3** - The original cloud object storage
- **Cloudflare R2** - Cost-effective S3-compatible storage
- **MinIO** - Self-hosted S3-compatible storage
- **Google Cloud Storage** - S3-compatible APIs
- **Digital Ocean Spaces** - S3-compatible object storage

### **AI-Powered Learning**
- **📄 Document Analysis** - AI understands PDF, Word, and text file contents
- **🔍 Smart Search** - Find files based on content, not just filenames  
- **📊 Content Insights** - Get summaries and key points from uploaded documents
- **🏷️ Auto-categorization** - Files automatically organized by AI analysis
- **💡 Learning Assistance** - AI helps students understand complex documents

### **Real-World Skills**
- **Cloud Storage Architecture** - Learn how modern applications handle file storage
- **Authentication Systems** - Understanding OAuth and JWT tokens
- **API Design** - RESTful endpoints and presigned URL patterns
- **Database Design** - Relational data modeling with Prisma
- **Modern Web Development** - Next.js, React, and TypeScript best practices

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/Krishnadev-cmd/S-files.git
cd S-files
npm install
```

### 2. Environment Setup

Create `.env.local` file:
```env
# Database (Supabase with Prisma Accelerate)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_ACCELERATE_API_KEY"

# NextAuth Configuration
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth Credentials
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-your-google-client-secret"

# Development Storage (MinIO)
S3_ENDPOINT_LOCAL="localhost"
S3_PORT="9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET_NAME="sfiles"
S3_USE_SSL="false"

# Production Storage (Cloudflare R2) - uncomment for production
# AWS_ACCESS_KEY_ID="your-r2-access-key"
# AWS_SECRET_ACCESS_KEY="your-r2-secret-key"
# AWS_REGION="auto"
# AWS_S3_BUCKET="sfiles"
# S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
```

### 3. Database Setup
```bash
# Push database schema to your PostgreSQL database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 4. Start Development Storage (MinIO)
```bash
docker run -d \
  --name minio-dev \
  -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

### 5. Run Development Server
```bash
npm run dev
```

Visit **http://localhost:3000** to see your application!

## 🔧 Detailed Configuration

### Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Google+ API** in APIs & Services
4. **Create OAuth 2.0 credentials**:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-domain.vercel.app/api/auth/callback/google` (production)
5. **Copy Client ID and Secret** to your `.env` file

### Supabase Database Setup

1. **Create account** at https://supabase.com/
2. **Create new project** and wait for setup
3. **Get connection string** from Settings → Database
4. **Set up Prisma Accelerate** (optional but recommended):
   - Go to https://accelerate.prisma.io/
   - Connect your database
   - Get Accelerate connection string

### Cloudflare R2 Configuration

1. **Create Cloudflare account** and enable R2
2. **Create R2 bucket** named `sfiles`
3. **Generate R2 tokens**:
   - Go to R2 → Manage R2 API tokens
   - Create token with Object Read & Write permissions
4. **Configure CORS policy** in bucket settings:
```json
[
  {
    "AllowedOrigins": [
      "https://your-domain.vercel.app",
      "https://*.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "x-amz-version-id"],
    "MaxAgeSeconds": 3600
  }
]
```

## 🚀 Production Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   ```env
   # Database
   DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=...
   
   # Authentication
   NEXTAUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   AUTH_GOOGLE_ID=your-google-client-id
   AUTH_GOOGLE_SECRET=your-google-client-secret
   
   # Cloudflare R2 Storage
   AWS_ACCESS_KEY_ID=your-r2-access-key
   AWS_SECRET_ACCESS_KEY=your-r2-secret-key
   AWS_REGION=auto
   AWS_S3_BUCKET=sfiles
   S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   S3_BUCKET_NAME=sfiles
   S3_PORT=443
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Update OAuth Redirect URIs

After deployment, update your Google OAuth configuration:
- Add your production URL: `https://your-app.vercel.app/api/auth/callback/google`

## 📁 Project Structure

```
S-Files/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── files/         # File management endpoints
│   │   └── test-db/       # Database testing
│   ├── auth/              # Authentication pages
│   ├── components/        # Reusable UI components
│   ├── server/            # Server-side utilities
│   └── utils/             # Client-side utilities
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── README.md             # This file
```

## 🔄 Key Workflows

### File Upload Process
1. User selects files in the UI
2. Frontend requests presigned URLs from `/api/files/upload/presignedUrl`
3. Files upload directly to storage (MinIO/R2) using presigned URLs
4. Metadata saves to database via `/api/files/upload/saveInfo`
5. UI updates with upload progress and completion

### Authentication Flow
1. User clicks "Sign in with Google"
2. NextAuth.js redirects to Google OAuth
3. Google redirects back with authorization code
4. NextAuth.js exchanges code for user profile
5. JWT token created and stored in secure cookie
6. User gains access to protected routes

## 🛡️ Security Features

- **JWT Sessions** - Stateless, secure authentication
- **CORS Protection** - Properly configured for cross-origin requests
- **Environment Variables** - Sensitive data stored securely
- **Presigned URLs** - Direct uploads without exposing credentials
- **HTTPS Only** - Production enforces secure connections

## 🎨 UI/UX Features

- **Glass-morphism Design** - Modern translucent interfaces
- **Animated Backgrounds** - Floating gradient blobs
- **Smooth Transitions** - Butter-smooth hover effects and animations
- **Responsive Layout** - Works on all device sizes
- **Real-time Feedback** - Upload progress and error handling
- **Accessibility** - Proper ARIA labels and keyboard navigation

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma db push      # Push schema changes
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open database GUI

# Deployment
vercel                  # Deploy to preview
vercel --prod          # Deploy to production
```

## 🐛 Troubleshooting

### Common Issues

**Authentication Error**: 
- Check Google OAuth redirect URIs match your domain
- Verify `NEXTAUTH_URL` matches your deployment URL
- Ensure `NEXTAUTH_SECRET` is set and consistent

**File Upload CORS Error**:
- Verify R2 bucket CORS policy includes your domain
- Check all required environment variables are set
- Confirm S3_PORT is set to 443 for HTTPS endpoints

**Database Connection Error**:
- Verify DATABASE_URL is correct
- Check if Prisma schema is pushed to database
- Ensure database is accessible from your deployment

### Getting Help

- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check individual tool documentation (Next.js, Prisma, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⭐ Acknowledgments

- **Next.js** - The React framework for production
- **Vercel** - Deployment and hosting platform
- **Supabase** - Backend-as-a-Service for PostgreSQL
- **Cloudflare** - R2 object storage and global CDN
- **Prisma** - Next-generation ORM for TypeScript
- **NextAuth.js** - Complete open-source authentication solution

---

**Built with ❤️ by Krishnadev**

*A modern file management system for the cloud-native world.*
