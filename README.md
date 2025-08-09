# S-Files - Secure File Management System

A modern, secure file management platform built with Next.js, featuring Google authentication, multiple upload methods, and enterprise-grade security.

## 🚀 Features

- **Secure Authentication** - Google OAuth integration with NextAuth.js
- **Multiple Upload Methods** - S3 Presigned URLs or Next.js API endpoints
- **Modern UI** - Beautiful, responsive interface with Tailwind CSS
- **File Management** - Upload, download, and delete files with ease
- **Database Integration** - PostgreSQL with Prisma ORM
- **Cloud Storage** - MinIO S3-compatible object storage
- **Enterprise Security** - Encrypted file storage and secure access controls

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google Provider
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: MinIO (S3-compatible)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- PostgreSQL database
- MinIO server (or AWS S3)
- Google OAuth credentials

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krishnadev-cmd/S-files.git
   cd S-files
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/s_files_db"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # MinIO Configuration
   MINIO_ENDPOINT="localhost"
   MINIO_PORT="9000"
   MINIO_ACCESS_KEY="your-minio-access-key"
   MINIO_SECRET_KEY="your-minio-secret-key"
   MINIO_BUCKET_NAME="s-files-bucket"
   MINIO_USE_SSL="false"
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
