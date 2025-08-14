# Udyam Registration Portal

A comprehensive, responsive web application that replicates the first two steps of the Udyam registration process (https://udyamregistration.gov.in/UdyamRegistration.aspx) with modern web technologies.

##  Features

### 1. Web Scraping
- **Automated Form Extraction**: Uses Puppeteer to scrape form fields, validation rules, and UI structure from the official Udyam portal
- **Comprehensive Data Collection**: Extracts all input fields, labels, validation patterns, and UI components
- **JSON Schema Generation**: Creates structured data for dynamic form rendering

### 2. Responsive Frontend
- **Modern UI/UX**: Built with Next.js 15, React 19, and TypeScript
- **Mobile-First Design**: 100% responsive design ensuring perfect display on all devices
- **Dynamic Form Rendering**: Forms are generated based on scraped JSON schema
- **Real-Time Validation**: Client-side validation with Zod schema validation
- **Progress Tracking**: Visual progress indicator showing completion status
- **Beautiful Design**: Modern gradient backgrounds, smooth transitions, and intuitive user experience

### 3. Backend API
- **RESTful API**: Built with Express.js and TypeScript
- **Database Integration**: PostgreSQL with Prisma ORM for data persistence
- **Comprehensive Validation**: Server-side validation using Zod schemas
- **Security Features**: Helmet.js, CORS, rate limiting, and input sanitization
- **Error Handling**: Robust error handling with detailed error messages


## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schema validation
- **Security**: Helmet.js, CORS, rate limiting
- **Logging**: Morgan HTTP request logger

### Scraper
- **Browser Automation**: Puppeteer
- **Language**: TypeScript
- **Data Processing**: fs-extra for file operations

### Database
- **Database**: PostgreSQL 15
- **ORM**: Prisma 6


### DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Environment**: Development and production configurations


## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd openbiz-udyam
```

### 2. Environment Setup
Create `.env` files in backend and frontend directories:

**Backend (.env)**
```env
DATABASE_URL="postgresql://udyam_user:udyam_password@localhost:5432/udyam_db"
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### 3. Using Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Manual Setup

#### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Scraper
```bash
cd scraper
npm install
npm run scrape
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health
- **Database**: localhost:5432

## Testing

### Run Backend Tests
```bash
cd backend
npm test
npm run test:watch
```

### Test Coverage
```bash
cd backend
npm test -- --coverage
```

## API Endpoints

### Step 1: Aadhaar + OTP
- `POST /api/step1/initiate` - Start registration with Aadhaar and mobile
- `POST /api/step1/verify-otp` - Verify OTP and complete Step 1

### Step 2: Business Details
- `POST /api/step2/submit` - Submit business details and complete registration

### Registration Management
- `GET /api/registration/:id` - Get registration status
- `GET /api/admin/registrations` - Get all registrations (admin)

### Health & Monitoring
- `GET /health` - Health check endpoint

## Security Features

- **Input Validation**: Comprehensive server-side validation with Zod
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable CORS policies
- **Security Headers**: Helmet.js for security headers
- **Data Sanitization**: Input sanitization and validation
- **Error Handling**: Secure error messages without information leakage

