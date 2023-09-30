# Votepoll Backend

## Description

This project serves as the backend component of the Votepoll system, aiming to provide a robust and secure platform for online voting management. It is built using Node.js, Express, and MongoDB, with various dependencies to enhance functionality.

## Features

- **Authentication:** Secure user authentication with JSON Web Tokens (JWT) and bcrypt for password hashing.
- **API Endpoints:** Implement API endpoints for user registration, authentication, and voting operations.
- **Data Storage:** Utilize MongoDB for data storage and management.
- **Error Handling:** Implement error handling and logging for robustness.
- **Email Notifications:** Send email notifications using Nodemailer for user interaction.
- **Middleware:** Use middleware packages like Body Parser, CORS, and Morgan to enhance server functionality.

## Getting Started

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Set up environment variables using a `.env` file (refer to `.env.example`).
4. Start the development server with `npm run dev`.
5. Access the API via `http://localhost:PORT`, where `PORT` is the configured port (default is 3000).

## Project Structure

- `index.js`: Entry point for the Node.js application.
- `routes/`: Contains route definitions for various API endpoints.
- `models/`: Defines MongoDB schema and models.
- `controllers/`: Implements logic for API endpoints.

## Dependencies

- Node.js
- Express
- MongoDB
- Bcrypt
- JSON Web Tokens (JWT)
- Nodemailer
- Day.js
- Multer
- Morgan
- Body Parser
- CORS
- Dotenv
- Email Validator

## Scripts

- `npm run dev`: Start the development server with nodemon.
- `npm test`: Run tests (add test scripts as needed).
- `npm start`: Start the production server.

## License

- This project is licensed under the [ISC License](LICENSE).

## Contact

- For questions or support, please contact Muhammad Zeeja at muhammadzeejah1122@gmail.com.
