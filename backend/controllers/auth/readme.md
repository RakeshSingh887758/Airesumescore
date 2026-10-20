Node.js Authentication API

A RESTful authentication API built with Node.js, Express.js, MongoDB, and Mongoose. It supports user registration, login, forgot password, password reset, JWT authentication, and logout with token blacklisting.

Features
User registration with password hashing using bcrypt
User login with JWT authentication
Forgot password with email reset link
Secure password reset with an expiring, single-use token
Protected routes using JWT middleware
Logout using MongoDB-backed JWT blacklisting
Automatic cleanup of expired blacklist records using MongoDB TTL indexes
Get the currently authenticated user
Environment-based configuration
Tech Stack
Node.js
Express.js
MongoDB
Mongoose
JSON Web Token (JWT)
bcryptjs
Nodemailer
dotenv

Installation
1. Clone the repository
git clone <your-repository-url>
cd backend


Replace <your-repository-url> with your repository URL.

2. Install dependencies
npm install


If you are setting up the project from scratch, install the required packages:

npm install express mongoose bcryptjs jsonwebtoken dotenv nodemailer
npm install --save-dev nodemon

3. Configure environment variables

Create a .env file in the project root:

PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/auth_db

JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d

FRONTEND_URL=http://localhost:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-google-app-password


Generate a strong JWT secret:

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"


Configure your MongoDB connection and SMTP credentials before testing password-reset emails.

Important: Never commit your .env file or expose your JWT secret and email credentials.

4. Configure package scripts

Add these scripts to the scripts section of package.json:

{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}

5. Start the server

Development:

npm run dev


Production:

npm start


Base URL:

http://localhost:5000/api/auth

API Endpoints
Method	Endpoint	Description	Authentication
POST	/register	Register a new user	Not required
POST	/login	Log in a user	Not required
POST	/forgot-password	Request password reset	Not required
POST	/reset-password	Reset password	Reset token required
POST	/logout	Log out and blacklist JWT	Required
GET	/me	Get current user	Required
API Usage

All request bodies below use JSON.

1. Register User

Endpoint: POST /api/auth/register

Request body:

{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "StrongPass123!"
}


Success response — 201 Created:

{
  "message": "Registration successful",
  "user": {
    "id": "USER_ID",
    "name": "Rahul",
    "email": "rahul@example.com"
  },
  "token": "YOUR_JWT_TOKEN"
}

2. Login User

Endpoint: POST /api/auth/login

Request body:

{
  "email": "rahul@example.com",
  "password": "StrongPass123!"
}


Success response — 200 OK:

{
  "message": "Login successful",
  "user": {
    "id": "USER_ID",
    "name": "Rahul",
    "email": "rahul@example.com"
  },
  "token": "YOUR_JWT_TOKEN"
}


Save the returned JWT for subsequent protected requests.

3. Forgot Password

Endpoint: POST /api/auth/forgot-password

Request body:

{
  "email": "rahul@example.com"
}


Success response — 200 OK:

{
  "message": "If the account exists, password reset instructions will be sent."
}


If the email belongs to a registered user and email delivery succeeds, the user receives a password-reset link. The reset token expires after 15 minutes.

4. Reset Password

Endpoint: POST /api/auth/reset-password

Request body:

{
  "token": "RESET_TOKEN_FROM_EMAIL",
  "password": "NewStrongPass456!"
}


Success response — 200 OK:

{
  "message": "Password reset successful. Please log in again."
}


The reset token is single-use. The user must log in with the new password afterward.

5. Logout User

Endpoint: POST /api/auth/logout

No request body is required.

Request header:

Authorization: Bearer YOUR_JWT_TOKEN


Success response — 200 OK:

{
  "message": "Logout successful"
}


The server adds the JWT's unique identifier (jti) to the MongoDB blacklist. Subsequent requests using that token are rejected by the authentication middleware.

6. Get Current User

Endpoint: GET /api/auth/me

No request body is required.

Request header:

Authorization: Bearer YOUR_JWT_TOKEN


Success response — 200 OK:

{
  "user": {
    "id": "USER_ID",
    "name": "Rahul",
    "email": "rahul@example.com"
  }
}


If the token is missing, invalid, expired, or blacklisted, the endpoint returns 401 Unauthorized.

Authentication Flow
A user registers or logs in.
The server verifies the credentials and issues a signed JWT.
The client sends the JWT in the Authorization header for protected requests.
The authentication middleware verifies the token and checks the MongoDB blacklist.
When the user logs out, the JWT's jti is blacklisted.
MongoDB eventually removes expired blacklist records through its TTL index.
Testing with Postman
Start the backend using npm run dev.
Set the request URL to http://localhost:5000/api/auth.
Select the required HTTP method and endpoint.
For requests with JSON payloads, choose Body → raw → JSON.
Register a user and log in to receive a JWT.
For /me and /logout, select Authorization → Bearer Token and paste the JWT.
Test logout by calling /me again with the same token. The request should return 401 Unauthorized.
To test password reset, configure SMTP and check the registered email inbox.
Security Notes
Passwords are hashed before being stored in MongoDB.
JWT secrets and SMTP credentials must be kept private.
Password-reset tokens are stored as hashes and expire after 15 minutes.
Password-reset requests use a generic response to reduce account enumeration.
JWT blacklist entries are removed automatically after their expiration time.
Logout revokes the current token, not every active session for the user.
Password reset does not automatically revoke previously issued JWTs in this implementation.
Use HTTPS, rate limiting, request validation, and appropriate production CORS settings before deployment.
For browser applications, consider secure HttpOnly cookies with appropriate CSRF protection.
License

This project is available under the MIT License. Add a LICENSE file if you intend to distribute it under that license.