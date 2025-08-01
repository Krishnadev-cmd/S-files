# S-Files - Personal Cloud Storage with AI Optimization

A modern, AI-powered personal cloud storage solution built with FastAPI, Next.js, PostgreSQL, MinIO, and Redis.

## 🚀 Features

### Core Features
- **Secure File Storage**: Upload, download, and manage files with enterprise-grade security
- **Smart Organization**: Automatic folder structure and file categorization
- **User Management**: Secure authentication and user accounts
- **File Sharing**: Share files with customizable permissions and expiration dates

### AI-Powered Features
- **Auto-Tagging**: Automatic file categorization using AI
- **Smart Search**: Search files by content, not just filename
- **Duplicate Detection**: AI-based duplicate file identification
- **Thumbnail Generation**: Automatic preview generation for images and documents

## 🏗️ Architecture

### Backend (FastAPI)
- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Robust relational database for metadata
- **MinIO**: S3-compatible object storage for files
- **Redis**: High-performance caching and session management
- **SQLAlchemy**: Modern Python SQL toolkit and ORM

### Frontend (Next.js)
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern utility-first CSS framework
- **Modern UI**: Responsive design with drag-and-drop functionality

## 🛠️ Quick Start

### Prerequisites
- Docker Desktop
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krishnadev-cmd/S-files.git
   cd S-files
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the applications**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **MinIO Console**: http://localhost:9003
   - **PostgreSQL**: localhost:5432
   - **Redis**: localhost:6379

## 📁 Project Structure

```
S-files/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── database.py     # Database configuration
│   │   ├── models.py       # SQLAlchemy models
│   │   └── create_tables.py # Database initialization
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend Docker configuration
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js App Router
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend Docker configuration
├── docker-compose.yaml    # Multi-service Docker configuration
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and storage quotas
- **folders**: Directory structure and organization
- **files**: File metadata and AI-generated tags
- **file_shares**: Sharing permissions and links
- **processing_queue**: AI processing task queue

## 🔧 Development

### Backend Development
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev
```

### Database Operations
```bash
# View database stats
curl http://localhost:8000/api/stats

# Access PostgreSQL directly
docker exec -it postgres_db psql -U postgres -d cloud_storage_db
```

## 🐳 Docker Services

| Service | Description | Port | Health Check |
|---------|-------------|------|--------------|
| **postgres_db** | PostgreSQL database | 5432 | `pg_isready` |
| **redis_cache** | Redis cache | 6379 | `redis-cli ping` |
| **minio_storage** | Object storage | 9002/9003 | MinIO health endpoint |
| **fastapi_backend** | Python API | 8000 | `/health` endpoint |
| **nextjs_frontend** | React frontend | 3000 | `/api/health` endpoint |

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **File Encryption**: Secure file storage
- **Access Control**: Granular permission system
- **HTTPS Ready**: Production-ready SSL configuration

## 🤖 AI Integration

### Supported AI Services
- **OpenAI GPT**: Content analysis and tagging
- **Hugging Face**: Open-source AI models
- **Custom Models**: Extensible AI pipeline

### AI Features Pipeline
1. **File Upload** → **Queue Processing** → **AI Analysis** → **Tag Generation** → **Search Index**

## 📊 Monitoring & Logging

- **Health Checks**: All services have health monitoring
- **Structured Logs**: JSON-formatted application logs
- **Metrics**: Performance and usage metrics
- **Error Tracking**: Comprehensive error handling

## 🚀 Deployment

### Production Environment
```bash
# Set production environment
export ENVIRONMENT=production

# Update docker-compose for production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
See `.env.example` for all required configuration options.

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📈 Performance

- **High Throughput**: Async FastAPI backend
- **Caching**: Redis-powered performance optimization
- **CDN Ready**: Static asset optimization
- **Database Optimization**: Indexed queries and connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Krishnadev-cmd/S-files/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krishnadev-cmd/S-files/discussions)

## 🏆 Roadmap

### Phase 1 - Core Features ✅
- [x] Database schema
- [x] Docker setup
- [x] Basic API structure
- [ ] User authentication
- [ ] File upload/download

### Phase 2 - AI Features
- [ ] Auto-tagging system
- [ ] Smart search
- [ ] Duplicate detection
- [ ] Thumbnail generation

### Phase 3 - Advanced Features
- [ ] Mobile app
- [ ] Real-time collaboration
- [ ] Advanced sharing
- [ ] Analytics dashboard

---

Built with ❤️ by [Krishnadev](https://github.com/Krishnadev-cmd)
