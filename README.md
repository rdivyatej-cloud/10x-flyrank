# Smart Expense Tracker

## Problem
People often find it difficult to keep track of where their money is being spent. Managing daily expenses manually can be tedious and prone to errors.

## Solution
Smart Expense Tracker is a simple full-stack web application that allows users to seamlessly record their expenses, organize them into predefined categories, and view real-time spending summaries to maintain better control of their finances.

## 10x Claim
Smart Expense Tracker makes personal expense tracking significantly easier by automatically organizing expenses and providing instant spending summaries instead of requiring users to manually calculate their spending.

## Features
- User registration and JWT-based authentication
- Add, edit, and delete daily expenses
- View categorized spending summaries and total expenses
- AI-powered spending insights based on monthly data
- Generate and download PDF expense reports
- Clean and intuitive dashboard UI

## Technology Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (with Docker)
- **Security:** bcrypt, jsonwebtoken (JWT)
- **AI Integration:** Google GenAI SDK (Gemini)
- **PDF Generation:** pdfkit
- **Frontend:** HTML, CSS, Vanilla JavaScript

## Architecture
The application follows a standard MVC-inspired pattern:
- **Routes (`src/routes`)**: Define the API endpoints and attach middleware.
- **Controllers (`src/controllers`)**: Handle incoming requests, execute business logic, and format responses.
- **Services (`src/services`)**: Encapsulate complex logic like AI communication.
- **Database (`src/database`)**: Manage PostgreSQL connections and initial schema.
- **Jobs (`src/jobs`)**: Background tasks like monthly summary generation.

## FlyRank Concepts
1. **API endpoints**: Implemented throughout `src/routes` and `src/controllers` (e.g., `/api/expenses`, `/api/summary`).
2. **Database**: PostgreSQL used for all data persistence (`src/database/db.js`).
3. **Authentication**: JWT authentication implemented in `src/controllers/authController.js` and protected via `src/middleware/authMiddleware.js`.
4. **Background jobs**: Implemented using `node-cron` in `src/jobs/monthlySummaryJob.js` to calculate previous month's spending.
5. **Reporting — PDF**: Implemented in `src/controllers/reportController.js` using `pdfkit`.
6. **LLM integration**: Implemented in `src/services/ai/insightService.js` to analyze monthly spending using Gemini.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Expenses
- `POST /api/expenses` - Add an expense
- `GET /api/expenses` - List all expenses
- `GET /api/expenses/:id` - Get a single expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Dashboard & Features
- `GET /api/summary` - Get spending summaries
- `POST /api/insights` - Generate AI spending insights
- `POST /api/reports` - Generate PDF report
- `GET /api/health` - Server health check

## Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Ensure Docker is running.
4. Run `docker-compose up -d` to start the PostgreSQL database.

## Environment Variables
Create a `.env` file in the root directory. Use `.env.example` as a template:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/expense_tracker
JWT_SECRET=your_super_secret_jwt_key
LLM_PROVIDER=gemini
LLM_MODEL=gemini-1.5-flash
LLM_API_KEY=your_gemini_api_key
```

## Running the Application
- **Development**: `npm run dev`
- **Production**: `npm start`
- The application will run at `http://localhost:3000`. Open this URL in your browser to view the UI.

## Testing
Run the test suite using:
```bash
npm test
```

## Demo
To quickly demonstrate the application:
1. Run `node scripts/seed.js` to populate demo data.
2. Start the app: `npm run dev`
3. Open `http://localhost:3000` in the browser.
4. Login with: `demo@example.com` / `password123`.
5. View the dashboard showing total spending and category breakdown.
6. Add a new expense (e.g., Food, ₹200) and watch totals update.
7. Click "Get AI Spending Insights" to view generated recommendations.
8. Click "Generate PDF Report" to download the summary.

## Limitations
- Single-user demo focus (though the backend supports multi-user separation).
- Background job is simplified to run daily and checks last month's data.

## Future Improvements
- Add charts (e.g., using Chart.js) for visual breakdown.
- Implement email notifications for monthly summaries.
- Add budget goals per category.
