# 🛒 ShopKart — Full-Stack E-Commerce Application

ShopKart is a full-stack e-commerce web application built using the MERN stack. It allows users to browse products, manage their wishlist and shopping cart, complete checkout, and view their orders.

The project implements JWT-based authentication and Razorpay integration in Test Mode to demonstrate a secure online shopping workflow.

## ✨ Features

### 🔐 User Authentication
- User registration and login
- JWT-based authentication using HTTP-only cookies
- Protected routes for authenticated users

### 🛍️ Product Catalog
- Browse available products
- View product details
- Search and filter products by category
- Display product prices, images, and stock availability

### ❤️ Wishlist
- Add products to the wishlist
- Remove products from the wishlist
- View wishlisted products

### 🛒 Shopping Cart
- Add products to the cart
- Update product quantities
- Remove products from the cart
- Validate stock availability
- Display the cart and total price

### 💳 Checkout and Payments
- Collect shipping information
- Create orders using backend-validated cart data
- Integrate Razorpay Checkout in Test Mode
- Verify payment signatures on the backend
- Update order and payment statuses after successful verification
- Clear the cart after verified payment

### 📦 Order Management
- View order history
- View individual order details
- Track order and payment statuses

## 🧰 Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Cookie-based authentication
- Razorpay API

## 📁 Project Structure

```text
Shop-Kart/
├── .gitignore
├── backend/
│   ├── config/
│   │   └── razorpay.js
│   ├── controllers/
│   │   ├── cart.controller.js
│   │   ├── customer.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── order.model.js
│   │   └── product.model.js
│   ├── routes/
│   │   ├── cart.routes.js
│   │   ├── customer.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   ├── index.js
│   ├── package.json
│   └── .env
└── client/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env
```

## ⚙️ Prerequisites

Make sure you have the following installed:

- Node.js and npm
- MongoDB or a MongoDB Atlas database
- A Razorpay account with Test Mode credentials

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Shop-Kart
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory and configure the environment variables required by your application.

Example:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Use the exact environment variable names expected by your backend code. The names above are examples and may need to be adjusted to match your implementation.

### 3. Start the backend

```bash
npm run dev
```

If your backend does not define a `dev` script, use the appropriate start command configured in `backend/package.json`.

The backend runs on `http://localhost:8080` if configured with the port shown above.

### 4. Configure the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory if your frontend requires environment variables.

For example, if your Axios configuration uses a Vite environment variable for the backend URL:

```env
VITE_API_URL=http://localhost:8080
```

Ensure that the variable name matches your actual frontend configuration.

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL displayed by Vite, typically `http://localhost:5173`.

## 💰 Razorpay Test Mode

ShopKart integrates Razorpay to demonstrate payment processing during checkout.

- Use Razorpay Test Mode credentials for development.
- Keep the Razorpay Key Secret on the backend only.
- Never commit real API secrets or database credentials to GitHub.
- Verify payment signatures on the backend before marking an order as paid.
- Use Razorpay's official test payment methods and test credentials when testing transactions.

Test Mode payments are for development and do not represent real payment transactions.

## 🔒 Security

- Passwords should be securely hashed before storage.
- Authentication tokens are managed using HTTP-only cookies.
- Protected API routes require authentication.
- The backend validates cart quantities, product availability, and prices.
- Payment signatures must be verified on the server.
- Sensitive environment files are excluded from Git using `.gitignore`.

## 🧪 Testing the Application

A typical end-to-end test flow is:

1. Register a new user.
2. Log in to the application.
3. Browse the product catalog.
4. Add products to the wishlist and shopping cart.
5. Proceed to checkout and enter shipping details.
6. Complete a Razorpay test payment.
7. Verify that the order is created and its status is updated.
8. Confirm that the cart is cleared after successful payment.
9. Open the order history and view the order details.

## 🎯 Learning Objectives

This project demonstrates practical implementation of:

- Full-stack web application development
- REST API design and integration
- Authentication and protected routes
- MongoDB data modeling and relationships
- Shared React state for shopping cart management
- Payment gateway integration
- Server-side validation and payment verification
- Order creation and lifecycle management

## 👨‍💻 Author

Developed as part of a full-stack web development project.

## 📄 License

This project was developed for educational purposes.
