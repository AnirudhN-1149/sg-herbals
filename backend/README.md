# SG Herbals — Backend API

Node.js + Express + MongoDB Atlas REST API for the SG Herbals e-commerce platform.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Then edit .env with your actual values
```

### 3. Run the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## 🗄️ MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in
2. Create a new **Project** → **Build a Database** → choose **Free (M0)**
3. Set a username & password → click **Create**
4. Under **Network Access** → Add IP Address → `0.0.0.0/0` (allow all, for dev)
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<username>`, `<password>`, and `<dbname>` in the URI:
   ```
   MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/sg-herbals
   ```

---

## ☁️ Cloudinary Setup

1. Go to [https://cloudinary.com](https://cloudinary.com) and create a free account
2. From your **Dashboard**, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Add them to `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

---

## ⚙️ .env Configuration

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sg-herbals

# JWT secret (use a long random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Allowed CORS origins
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:5173

# Server port
PORT=5000
```

---

## 🌱 Seeding the Database

After configuring `.env`, run the seed script to populate all 6 products and create the default admin:

```bash
node src/data/seed.js
```

**Default Admin Credentials:**
| Field    | Value                  |
|----------|------------------------|
| Email    | admin@sgherbals.com    |
| Password | Admin@123              |

> ⚠️ Change the admin password immediately after first login in production.

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api`

### 🟢 Products (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products?category=soaps` | Filter by category |
| GET | `/products?active=true` | Filter by visibility |
| GET | `/products?featured=true` | Get featured only |
| GET | `/products/:id` | Get single product |

### 🔐 Products (Admin — requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product (multipart/form-data) |
| PUT | `/products/:id` | Update product |
| PATCH | `/products/:id/toggle` | Toggle visibility |
| DELETE | `/products/:id` | Delete product + Cloudinary images |

### 📦 Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Place order (public) |
| GET | `/orders` | Get all orders (admin) |
| GET | `/orders?status=pending` | Filter by status |
| GET | `/orders?page=1&limit=20` | Paginated orders |
| GET | `/orders/:id` | Get single order (admin) |
| PATCH | `/orders/:id/status` | Update order status (admin) |
| DELETE | `/orders/:id` | Delete order (admin) |

### 🔑 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Admin login → returns JWT token |
| POST | `/auth/logout` | Logout (client-side token removal) |
| GET | `/auth/me` | Get current admin (requires token) |

### 🖼️ Image Upload (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/image` | Upload single image to Cloudinary |
| DELETE | `/upload/image/:publicId` | Delete image from Cloudinary |

---

## 📂 Project Structure

```
backend/
├── server.js              # Express app entry point
├── package.json
├── .env.example           # Environment template
├── vercel.json            # Vercel deployment config
└── src/
    ├── config/
    │   ├── db.js          # MongoDB connection
    │   └── cloudinary.js  # Cloudinary + multer config
    ├── models/
    │   ├── Product.model.js
    │   ├── Order.model.js
    │   └── Admin.model.js
    ├── routes/
    │   ├── index.js
    │   ├── products.routes.js
    │   ├── orders.routes.js
    │   ├── auth.routes.js
    │   └── upload.routes.js
    ├── controllers/
    │   ├── products.controller.js
    │   ├── orders.controller.js
    │   └── auth.controller.js
    ├── middleware/
    │   ├── auth.middleware.js
    │   └── upload.middleware.js
    └── data/
        └── seed.js        # DB seed script
```

---

## 🌐 Deployment (Vercel)

1. Push your `backend/` folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import the repo
3. Set **Root Directory** to `backend`
4. Add all environment variables from `.env` in Vercel's project settings
5. Deploy — the `vercel.json` handles routing automatically

---

## 🔒 Auth Flow

1. POST `/api/auth/login` with `{ email, password }`
2. Receive `{ token, admin }` in response
3. Store `token` in `localStorage` or memory
4. Send `Authorization: Bearer <token>` header on all protected requests
