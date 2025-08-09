# S-Files - Modern File Management System

A comprehensive, secure file management platform built with Next.js 15, featuring Google authentication, cloud storage integration, and modern web technologies.

## ✨ Features

- **🔐 Secure Authentication** - Google OAuth integration with NextAuth.js
- **☁️ Cloud Storage** - Dual storage support (MinIO for development, Cloudflare R2 for production)
- **📤 Multiple Upload Methods** - S3 Presigned URLs and direct upload endpoints
- **🎨 Modern UI** - Beautiful, responsive interface with Tailwind CSS
- **📁 File Management** - Upload, download, view, and delete files seamlessly
- **🗄️ Database Integration** - PostgreSQL with Prisma ORM for reliable data management
- **🚀 Production Ready** - Optimized for Vercel deployment with automatic builds

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js v5 with Google Provider
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **File Storage**: 
  - Development: MinIO (S3-compatible)
  - Production: Cloudflare R2
- **Deployment**: Vercel with automatic CI/CD
- **Additional**: AWS S3 SDK, React Hook Form, Zod validation

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Google OAuth credentials
- Cloudflare R2 bucket (for production)
- Docker (for local MinIO)

## � Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/Krishnadev-cmd/S-files.git
cd S-files
npm install
```

### 2. Environment Setup

Create `.env.local` file:
```env
# Database (Supabase)
DATABASE_URL="your-supabase-connection-string"

# NextAuth Configuration
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

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
# Push database schema
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

Visit http://localhost:3000 to see your application!

## 🔧 Configuration Guide

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:3000` and your production domain
6. Add redirect URIs: `http://localhost:3000/api/auth/callback/google`

### Supabase Database Setup
1. Create account at [Supabase](https://supabase.com)
2. Create a new project
3. Copy your connection string from Settings > Database
4. Update `DATABASE_URL` in your environment file

### Cloudflare R2 Setup (Production)
1. Sign up for [Cloudflare](https://cloudflare.com)
2. Go to R2 Object Storage
3. Create a bucket named "sfiles"
4. Generate API tokens with R2 permissions
5. Configure CORS policy:
   ```json
   [
     {
       "AllowedOrigins": ["https://your-domain.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

## 🚀 Deployment

### Deploy to Vercel

1. **Connect GitHub Repository**
   ```bash
   vercel login
   vercel --prod
   ```

2. **Set Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Add all environment variables from `.env.production`
   - Make sure to use production URLs and credentials

3. **Automatic Deployment**
   - Push to main branch triggers automatic deployment
   - Prisma generates schema automatically during build

### Build Scripts
```bash
# Production build
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate
```

## 📁 Project Structure

```
S-Files/
├── app/                    # Next.js 15 app directory
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   └── files/         # File management APIs
│   ├── components/        # React components
│   ├── utils/            # Utility functions
│   └── globals.css       # Global styles
├── prisma/               # Database schema
├── public/               # Static assets
├── .env.local           # Environment variables
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind configuration
└── vercel.json          # Vercel deployment config
```

## 🔐 Security Features

- **Authentication**: Secure Google OAuth with session management
- **File Upload**: Presigned URLs for direct-to-cloud uploads
- **Database**: Connection pooling and prepared statements
- **Environment**: Secure credential management
- **CORS**: Properly configured cross-origin policies

## 🎯 Usage

### File Upload
1. Sign in with Google account
2. Choose upload mode (Small files or Large files)
3. Select or drag files to upload
4. Files are automatically uploaded to cloud storage
5. File metadata saved to database

### File Management
- **View**: Browse all uploaded files in dashboard
- **Download**: Generate secure download links
- **Delete**: Remove files from both storage and database
- **Search**: Find files by name or type

## 🧪 Development

### Running Tests
```bash
# Add test files in __tests__ directory
npm test
```

### Database Management
```bash
# View database in browser
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate migration
npx prisma migrate dev --name init
```

### MinIO Admin Console
- Access: http://localhost:9001
- Credentials: minioadmin / minioadmin
- Manage buckets and view uploaded files

## 🔧 Troubleshooting

### Common Issues

**Build Fails on Vercel**
- Ensure `PRISMA_GENERATE_DATAPROXY="true"` is set
- Check all environment variables are configured

**File Upload Errors**
- Verify bucket exists and CORS is configured
- Check storage credentials and endpoint URLs

**Authentication Issues**
- Verify Google OAuth redirect URIs
- Ensure AUTH_SECRET is properly set

**Database Connection**
- Check DATABASE_URL format
- Verify network access to database

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Database platform
- [Cloudflare R2](https://developers.cloudflare.com/r2/) - Object storage
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Prisma](https://prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

**Built with ❤️ by [Krishnadev](https://github.com/Krishnadev-cmd)**
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
S-Files/
├── app/                          # Next.js app directory
│   ├── actions/                  # Server actions
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   └── files/                # File management endpoints
│   ├── components/               # React components
│   │   ├── UploadFilesForm/      # Upload form components
│   │   ├── FileContainer.tsx     # File display container
│   │   ├── FileItem.tsx          # Individual file component
│   │   └── LoadSpinner.tsx       # Loading component
│   ├── content/                  # Page content components
│   ├── login/                    # Login page
│   ├── server/                   # Server-side utilities
│   ├── utils/                    # Utility functions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── contexts/                     # React contexts
├── lib/                          # Utility libraries
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets
├── auth.ts                       # NextAuth configuration
├── middleware.ts                 # Next.js middleware
└── package.json                  # Dependencies and scripts
```

## 🔐 Authentication Setup

1. **Google OAuth Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

2. **Database Setup**
   - Install PostgreSQL
   - Create a new database
   - Update the `DATABASE_URL` in your `.env.local`

3. **MinIO Setup**
   - Install and run MinIO server
   - Create a bucket for file storage
   - Update MinIO credentials in `.env.local`

## 🚀 Upload Methods

The application supports two upload methods:

### S3 Presigned URLs
- Direct upload to storage
- Faster performance
- Reduced server load

### Next.js API Endpoints
- Server-side processing
- Additional validation
- More control over upload process

## 📊 Database Schema

The application uses the following main models:

- **User** - User account information
- **Account** - OAuth account details
- **Session** - User sessions
- **File** - File metadata and storage information

## 🔒 Security Features

- **Encrypted Storage** - All files are securely stored with encryption
- **Access Controls** - User-based file access permissions
- **Secure Authentication** - Google OAuth with session management
- **Input Validation** - Server-side validation for all inputs
- **CSRF Protection** - Built-in CSRF protection with NextAuth.js

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## 🚀 Deployment

### Deploy on Vercel

1. **Push to GitHub** (already done)

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Update environment variables**
   - Update `NEXTAUTH_URL` to your production domain
   - Ensure all other environment variables are set

### Deploy on Other Platforms

The application can also be deployed on:
- Railway
- Render
- Digital Ocean App Platform
- Any Node.js hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication library
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MinIO](https://min.io/) - Object storage

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact the maintainer

---

**Built with ❤️ by [Krishnadev](https://github.com/Krishnadev-cmd)**
