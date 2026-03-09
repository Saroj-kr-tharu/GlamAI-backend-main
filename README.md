<div align="center">

# 🌟 GlamAI Backend

**AI-Powered Image Analysis REST API**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=for-the-badge&logo=jenkins&logoColor=white)](https://www.jenkins.io/)

---

*A robust, production-grade Node.js backend service for GlamAI — featuring JWT authentication, image upload & AI-powered analysis, containerized with Docker, orchestrated on Kubernetes, and delivered via a fully automated Jenkins CI/CD pipeline.*

</div>

---

## 📑 Table of Contents

- [System Design](#-system-design)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [Docker Configuration](#-docker-configuration)
- [Security & Code Quality](#-security--code-quality)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [License](#-license)

---

## 🏗 System Design

<div align="center">

<img src="public/systemDesign.gif" alt="System Design Architecture" width="100%" />

</div>

### Request Flow

```
Client Request
      │
      ▼
┌─────────────┐    JWT Auth     ┌──────────────┐    Store      ┌──────────┐
│   Express   │───────────────▶│  Middleware   │─────────────▶│ MongoDB  │
│   Server    │                 │  (protect)   │              │          │
└──────┬──────┘                 └──────────────┘              └──────────┘
       │
       │  Image Upload
       ▼
┌──────────────┐   Multer      ┌──────────────┐   Axios      ┌──────────┐
│  /api/upload │──────────────▶│  Save to DB  │────────────▶│ ML Model │
│              │               │  & Disk      │              │ /analyze │
└──────────────┘               └──────────────┘              └──────────┘
```

---

## 🛠 Tech Stack

| Layer              | Technology                                                                 |
|--------------------|----------------------------------------------------------------------------|
| **Runtime**        | Node.js 20 (Alpine)                                                        |
| **Framework**      | Express 5.x (ES Modules)                                                   |
| **Database**       | MongoDB with Mongoose 9.x ODM                                             |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs password hashing                          |
| **File Uploads**   | Multer (disk storage, 10 MB limit, JPG/PNG only)                           |
| **HTTP Client**    | Axios (for ML model API communication)                                     |
| **Containerization** | Docker (node:20-alpine)                                                  |
| **Orchestration**  | Kubernetes (KinD cluster — 1 control-plane + 3 workers)                    |
| **CI/CD**          | Jenkins Declarative Pipeline                                               |
| **Code Quality**   | SonarQube static analysis                                                  |
| **Security Scans** | Trivy (filesystem + image), OWASP Dependency-Check                         |
| **Ingress**        | NGINX Ingress Controller with path-based routing                           |
| **Auto-scaling**   | Horizontal Pod Autoscaler (CPU-based, 2–8 replicas)                        |

---

## 📂 Project Structure

```
GlamAI-backend/
├── src/
│   ├── config/
│   │   └── db.js                # MongoDB connection setup
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── user.js              # User schema (bcrypt pre-save hook)
│   │   └── image.js             # Image metadata schema
│   ├── routes/
│   │   ├── auth.js              # Register / Login / Get current user
│   │   └── upload.js            # Image upload + ML model inference
│   ├── uploads/                 # Uploaded images (runtime directory)
│   └── server.js                # Express app entry point
├── k8s/
│   ├── 00_cluster.yml           # KinD cluster definition
│   ├── 01_deployment-backend.yml# Backend Deployment manifest
│   ├── 02_backend-service.yml   # ClusterIP Service
│   ├── hpa-backend.yml          # Horizontal Pod Autoscaler
│   ├── ingress.yml              # NGINX Ingress rules
│   └── namespace.yml            # Kubernetes namespace
├── Dockerfile                   # Production Docker image
├── .dockerignore                # Docker build exclusions
├── Jenkinsfile                  # CI/CD pipeline definition
├── sonar-project.properties     # SonarQube configuration
├── package.json                 # Node.js dependencies & scripts
└── README.md
```

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description       | Auth |
|--------|----------|-------------------|------|
| `GET`  | `/`      | Server health     | ❌   |

### Authentication — `/api/auth`

| Method | Endpoint             | Description            | Auth | Body                                      |
|--------|----------------------|------------------------|------|-------------------------------------------|
| `POST` | `/api/auth/register` | Register a new user    | ❌   | `{ username, email, password }`           |
| `POST` | `/api/auth/login`    | Login & receive JWT    | ❌   | `{ email, password }`                     |
| `GET`  | `/api/auth/me`       | Get current user info  | ✅   | —                                         |

### Image Upload — `/api/upload`

| Method | Endpoint       | Description                               | Auth | Body (multipart)     |
|--------|----------------|-------------------------------------------|------|----------------------|
| `POST` | `/api/upload`  | Upload image → save → send to ML model    | ❌   | `image` (JPG/PNG, ≤10 MB) |

> **Note:** Authenticated routes require an `Authorization: Bearer <token>` header.

---

## 🔄 CI/CD Pipeline

The project uses a **Jenkins Declarative Pipeline** that automates the entire build, test, scan, and deploy lifecycle.

<div align="center">

<img src="public/cicd.gif" alt="CI/CD Pipeline" width="100%" />

</div>

### Pipeline Stages

| #  | Stage                      | Description                                                         |
|----|----------------------------|---------------------------------------------------------------------|
| 1  | **Clone Code**             | Pulls latest code from `main` branch on GitHub                     |
| 2  | **Install Dependencies**   | Installs Node.js project dependencies                              |
| 3  | **SonarQube Analysis**     | Runs static code analysis for bugs, code smells & vulnerabilities  |
| 4  | **OWASP Dependency Check** | Scans project dependencies for known CVEs using NVD API            |
| 5  | **Trivy FS Scan**          | Scans the entire filesystem for vulnerabilities                    |
| 6  | **Build Docker Image**     | Builds the production Docker image tagged as `latest`              |
| 7  | **Docker Image Scan**      | Scans the built Docker image with Trivy                            |
| 8  | **Push to DockerHub**      | Pushes the verified image to DockerHub registry                    |
| 9  | **K8s Deployment Restart** | Rolling restart of the backend deployment in Kubernetes             |

### Post-Build Notifications

- **On Success:** Sends an HTML-styled ✅ success email with scan report attachments
- **On Failure:** Sends an HTML-styled ❌ failure email with scan report attachments
- **Reports attached:** `result.json` (Trivy FS), `backend-image-scan.json` (Trivy Image), `dependency-check-report.xml` (OWASP)

### Jenkins Requirements

| Requirement               | Details                                    |
|---------------------------|--------------------------------------------|
| Agent Label               | `ai`                                       |
| Credentials               | `dockerHubCreds` (username/password)       |
|                           | `NVD_API_KEY` (secret text)                |
| Tools                     | SonarQube Scanner, OWASP Dependency-Check  |
| Plugins                   | SonarQube, Dependency-Check, Email Extension, Build User Vars |

---

## ☸️ Kubernetes Deployment

The application is deployed on a **KinD (Kubernetes in Docker)** cluster with production-grade configurations.

### Cluster Topology

```
┌────────────────────────────────────────────────┐
│               KinD Cluster (v1.34.2)           │
│                                                │
│   ┌─────────────────────┐                      │
│   │   Control Plane      │                      │
│   │   (ingress-ready)    │                      │
│   │   Ports: 80, 443     │                      │
│   └─────────────────────┘                      │
│                                                │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│   │ Worker 1 │ │ Worker 2 │ │ Worker 3 │      │
│   └──────────┘ └──────────┘ └──────────┘      │
│                                                │
└────────────────────────────────────────────────┘
```

### Kubernetes Manifests

| File                           | Kind                      | Description                                        |
|--------------------------------|---------------------------|----------------------------------------------------|
| `k8s/namespace.yml`           | `Namespace`               | Creates the `glamai-ns` namespace                  |
| `k8s/00_cluster.yml`          | `Cluster` (KinD)          | 4-node cluster with ingress port mappings          |
| `k8s/01_deployment-backend.yml`| `Deployment`             | 2 replicas of the backend with resource limits     |
| `k8s/02_backend-service.yml`  | `Service` (ClusterIP)     | Internal service exposing port 3000                |
| `k8s/hpa-backend.yml`         | `HorizontalPodAutoscaler` | Auto-scales 2→8 pods at 20% CPU utilization        |
| `k8s/ingress.yml`             | `Ingress` (NGINX)         | Path-based routing for backend, model & frontend   |

### Resource Allocation

| Resource   | Request  | Limit    |
|------------|----------|----------|
| **CPU**    | 200m     | 500m     |
| **Memory** | 256Mi    | 512Mi    |

### Horizontal Pod Autoscaler (HPA)

| Parameter                  | Value       |
|----------------------------|-------------|
| Min Replicas               | 2           |
| Max Replicas               | 8           |
| Target CPU Utilization     | 20%         |
| Scale-Down Stabilization   | 30 seconds  |
| Scale-Down Rate            | 1% every 15s|

### Ingress Routing Rules

| Path            | Backend Service     | Port |
|-----------------|---------------------|------|
| `/server/*`     | `cms-svc`           | 3000 |
| `/model/*`      | `cms-model-svc`     | 3000 |
| `/*` (default)  | `cms-fortend-svc`   | 80   |

### Deploy to Cluster

```bash
# Create the KinD cluster
kind create cluster --config k8s/00_cluster.yml --name glamai

# Apply manifests in order
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/01_deployment-backend.yml
kubectl apply -f k8s/02_backend-service.yml
kubectl apply -f k8s/hpa-backend.yml
kubectl apply -f k8s/ingress.yml

# Verify deployment
kubectl get pods -n glamai-ns
kubectl get svc -n glamai-ns
kubectl get hpa -n glamai-ns
```

---

## 🐳 Docker Configuration

### Dockerfile Highlights

- **Base Image:** `node:20-alpine` — lightweight and secure
- **Layer Caching:** Dependencies installed before copying source code
- **Production Build:** `npm ci --omit=dev` for deterministic, minimal installs
- **Exposed Port:** `5000`

```dockerfile
FROM node:20-alpine
WORKDIR /backend
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p src/uploads
EXPOSE 5000
CMD ["node", "src/server.js"]
```

### Build & Run

```bash
# Build the image
docker build -t glamai-backend:latest .

# Run the container
docker run -p 5000:5000 --env-file .env glamai-backend:latest
```

---

## 🔒 Security & Code Quality

| Tool                        | Purpose                                       | Stage           |
|-----------------------------|-----------------------------------------------|-----------------|
| **SonarQube**               | Static analysis (bugs, smells, vulnerabilities) | CI Pipeline   |
| **OWASP Dependency-Check**  | Scans npm packages for known CVEs             | CI Pipeline     |
| **Trivy (FS)**              | Filesystem vulnerability scanning             | CI Pipeline     |
| **Trivy (Image)**           | Docker image vulnerability scanning           | CI Pipeline     |
| **bcryptjs**                | Password hashing with salt rounds             | Runtime         |
| **JWT**                     | Stateless token-based authentication          | Runtime         |
| **Multer**                  | File type & size validation (JPG/PNG, ≤10 MB) | Runtime         |
| **CORS**                    | Origin-restricted cross-origin requests       | Runtime         |

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/glamai

# Authentication
JWT_SECRET=your_jwt_secret_key

# Frontend URL (CORS)
FORTEND_URL=http://localhost:3000

# ML Model API
MODEL_API_URL=http://localhost:8000
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20.x
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Docker](https://www.docker.com/) (for containerization)
- [KinD](https://kind.sigs.k8s.io/) + [kubectl](https://kubernetes.io/docs/tasks/tools/) (for Kubernetes)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Saroj-kr-tharu/GlamAI-backend-main.git
cd GlamAI-backend-main

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env   # Then edit .env with your values

# 4. Start in development mode (with nodemon)
npm start

# 5. Or start in production mode
npm run dev
```

The server will be running at `http://localhost:5000`.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ by the GlamAI Team**

</div>
