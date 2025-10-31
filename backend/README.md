# Gradious Scholar Hub Backend

A Node.js/Express backend for the Gradious Scholar Hub application, built with TypeScript and MySQL.

## Features

- RESTful API for scholarships and applications
- MySQL database integration
- TypeScript for type safety
- CORS and security middleware
- Error handling

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   - Create a MySQL database named `gradious_scholar_hub`
   - Run the SQL script in `src/database.sql` to create tables and insert sample data

3. Configure environment variables:
   - Copy `.env` file and update database credentials if needed

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Scholarships
- `GET /api/scholarships` - Get all scholarships
- `GET /api/scholarships/:id` - Get scholarship by ID
- `POST /api/scholarships` - Create new scholarship
- `PUT /api/scholarships/:id` - Update scholarship
- `DELETE /api/scholarships/:id` - Delete scholarship

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Submit new application
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Delete application

### Health Check
- `GET /api/health` - Server health check

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MySQL2
- CORS
- Helmet
- Dotenv
