# CodeCommerce

A production-ready full-stack e-commerce platform built with React, Node.js, Express, and MongoDB. It includes a complete customer storefront, secure authentication, order management, payment integration, and a powerful admin dashboard with analytics.

> Built to prove that I can do more than center a button and call myself a full-stack developer.

---

## Live Demo

* **Frontend:** [https://commerce-core-frontend.vercel.app](https://commerce-core-frontend.vercel.app)
* **Backend API:** [https://commerce-core-backend.vercel.app/api/health](https://commerce-core-backend.vercel.app/api/health)
* **GitHub Repository:** [https://github.com/shakthi-jayan/commerce-core](https://github.com/shakthi-jayan/commerce-core)

---

## Features

### Customer Features

* User registration and login
* JWT-based authentication
* Browse products by category
* Product details with images and reviews
* Add to cart and wishlist
* Checkout flow
* Razorpay payment integration
* Order history and order tracking
* User profile management
* Dark mode UI

### Admin Features

* Secure admin login
* Dashboard overview with analytics
* Product management (CRUD)
* Category management
* Order management
* User management
* Review moderation
* Sales reports and charts
* Settings page

### Technical Features

* RESTful API architecture
* Image uploads via Cloudinary
* MongoDB Atlas integration
* Vercel deployment
* Environment-based configuration
* Responsive design
* Error handling and validation

---

## Tech Stack

### Frontend

* React.js
* Vite
* Redux Toolkit
* React Router
* Axios
* Bootstrap / Custom CSS
* Chart.js or Recharts

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Bcrypt.js
* Multer
* Cloudinary SDK
* Razorpay SDK
* Nodemailer

### Deployment

* Vercel (Frontend + Backend)
* MongoDB Atlas
* Cloudinary

---

## Project Structure

```text
commerce-core/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── public/
│
├── backend/                  # Node.js + Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── vercel.json
└── README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shakthi-jayan/commerce-core.git
cd commerce-core
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d
JWT_COOKIE_EXPIRE=7

USE_REDIS=false

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@codecommerce.com

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123

LOG_LEVEL=info
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_CURRENCY=INR
VITE_TAX_RATE=18
VITE_MAX_REVIEW_IMAGES=5
VITE_MAX_IMAGE_SIZE_MB=5
```

---

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

### Open in Browser

```text
http://localhost:5173
```

---

## API Endpoints

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `GET /api/auth/profile`

### Products

* `GET /api/products`
* `GET /api/products/:id`
* `POST /api/products`
* `PUT /api/products/:id`
* `DELETE /api/products/:id`

### Categories

* `GET /api/categories`
* `POST /api/categories`

### Orders

* `POST /api/orders`
* `GET /api/orders/my-orders`

### Admin

* `POST /api/admin/login`
* `GET /api/admin/dashboard`
* `GET /api/admin/reports`

---

## Deployment

### Frontend Deployment (Vercel)

Set environment variables:

```env
VITE_API_URL=https://commerce-core-backend.vercel.app/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### Backend Deployment (Vercel)

Set all backend environment variables in the Vercel dashboard.

### MongoDB Atlas

Add the following IP access entry:

```text
0.0.0.0/0
```

This allows Vercel serverless functions to connect to MongoDB Atlas.

---

## Screenshots

### Admin Dashboard

* Dashboard Overview
* Product Management
* Order Management
* User Management
* Category Management
* Reviews
* Reports & Analytics
* Settings

### Customer Storefront

* Home Page
* Product Page
* Cart
* Checkout
* Order History

---

## Challenges Solved

During development, I worked through:

* CORS configuration issues
* Vite environment variable handling
* MongoDB Atlas network access restrictions
* Serverless deployment constraints on Vercel
* Razorpay integration
* Image uploads with Cloudinary
* Authentication and route protection

Because no meaningful project is complete until you've stared at a `500 Internal Server Error` long enough to question your life choices.

---

## Learning Outcomes

This project helped me strengthen my skills in:

* Full-stack architecture
* REST API development
* State management with Redux Toolkit
* Authentication and authorization
* Payment integration
* Cloud deployment
* Debugging production issues

---

## Future Improvements

* Coupon and discount system
* Inventory alerts
* Email notifications
* Multi-vendor support
* Real-time order updates
* Unit and integration tests
* Docker deployment

---

## Author

**Shakthi Jayan**

* LinkedIn: [https://www.linkedin.com/in/shakthi-jayan/](https://www.linkedin.com/in/shakthi-jayan/)
* GitHub: [https://github.com/shakthi-jayan](https://github.com/shakthi-jayan)

---

## License

This project is licensed under the MIT License.

---

## Support

If you found this project useful:

* Star the repository
* Share it on LinkedIn
* Connect with me

Building software is hard. Deploying it is harder. Explaining to MongoDB that Vercel is not an enemy combatant is somewhere in between.
