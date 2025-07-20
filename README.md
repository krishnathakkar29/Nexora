# Nexora

A comprehensive full-stack application featuring AI-powered PDF chat, form management, bulk email processing, and real-time communication built with modern technologies and microservices architecture.

## 🚀 Features

### 📄 **Document Intelligence**

- **AI-Powered PDF Chat**: Interactive conversations with PDF documents using RAG (Retrieval Augmented Generation)
- **Smart Document Processing**: Automated text extraction and semantic analysis
- **Vector Search**: Efficient document retrieval using Pinecone vector database
- **Cloud Storage**: Secure file management with AWS S3 integration

### 📧 **Email Management**

- **Bulk Email Processing**: Queue-based email sending with Redis and BullMQ
- **Background Job Processing**: Scalable email delivery with retry mechanisms
- **Template System**: Customizable email templates and content management
- **Delivery Tracking**: Monitor email status and delivery analytics

### 📝 **Form Builder**

- **Dynamic Form Creation**: Build custom forms with various field types
- **Real-time Validation**: Client and server-side validation with Zod schemas
- **Form Analytics**: Track submissions and user interactions
- **Export Capabilities**: Download form data in multiple formats

## 🛠️ Tech Stack

![Tech Stack](https://skillicons.dev/icons?i=nextjs,react,typescript,nodejs,express,postgresql,redis,docker,aws)

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Express.js** - Fast Node.js web framework
- **TypeScript** - Type-safe server development
- **Prisma ORM** - Next-generation database toolkit
- **PostgreSQL** - Robust relational database
- **Redis** - In-memory data structure store
- **BullMQ** - Queue system for background jobs
- **AWS S3** - Object storage service
- **Docker** - Containerization platform
- **GitHub Actions** - CI/CD automation

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/krishnathakkar29/Nexora.git
cd Nexora
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create `.env` files in the respective packages:

**`packages/db/.env`**

```env
DATABASE_URL="postgresql://username:password@localhost:5432/nexora"
```

**`packages/common/.env`**

```env
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

**`apps/server/.env`**

```env
PORT=8000
JWT_SECRET="your_jwt_secret"
GOOGLE_AI_API_KEY="your_google_ai_key"
PINECONE_API_KEY="your_pinecone_key"
PINECONE_INDEX_NAME="your_index_name"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_BUCKET_NAME="your_s3_bucket"
AWS_REGION="your_aws_region"
```

**`apps/web/.env.local`**

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

### 4. Database setup

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed the database (optional)
pnpm db:seed
```

### 5. Start the development servers

```bash
# Start all applications
pnpm dev

# Or start individually
pnpm dev:web    # Frontend (port 3000)
pnpm dev:server # Backend (port 8000)
pnpm dev:worker # Background worker
```

## 📁 Project Structure

```
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── server/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── routes/
│   │   │   └── utils/
│   └── worker/
├── packages/
│   ├── db/
│   │   ├── prisma/
│   │   └── src/
│   ├── common/
│   │   ├── src/
│   │   │   ├── queue/
│   │   │   ├── schema/
│   │   │   └── types/
│   ├── ui/
│   └── eslint-config/
```

**Built by [Krishna Thakkar](https://krishnat.tech)**
