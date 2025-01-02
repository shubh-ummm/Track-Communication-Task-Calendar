A modern web application for managing company communications and tasks with an intuitive calendar interface and notification system.

## Live Demo

https://track-communication-task-calendar-app.vercel.app/

## Features

### User Authentication

- Secure login and registration system
- Role-based access control (Admin/User)
- Protected routes with automatic redirection
- JWT-based authentication

### Dashboard

- Modern, responsive UI built with Material-UI (MUI)
- Real-time notifications for overdue and due tasks
- Color-coded status indicators:
  - Red: Overdue communications
  - Yellow: Due today
  - Green: Completed tasks
  - Blue: Upcoming tasks

### Communication Management

- View all company communications in a structured table
- Multi-select functionality for batch completion
- Detailed view of each communication
- Ability to toggle color highlights per company
- Filter and sort capabilities

### Calendar Integration

- Interactive calendar view using FullCalendar
- Color-coded events based on status
- Hide/show adjacent months
- Click events for detailed view
- Mark tasks as complete directly from calendar

### Notification System

- Badge counter for pending notifications
- Separate views for overdue and today's tasks
- Quick actions from notification panel
- Real-time updates

## Tech Stack

### Frontend

- React 18
- Vite
- Material-UI (MUI)
- React Router DOM
- Date-fns for date manipulation
- FullCalendar for calendar view
- React Hot Toast for notifications
- Axios for API calls

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- CORS enabled

## Project Structure

```
ETENT/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Admin.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── Backend/
    ├── controllers/
    │   ├── Admin.js
    │   └── User.js
    ├── models/
    │   ├── Company.js
    │   ├── Communication.js
    │   └── CommunicationType.js
    ├── routes/
    │   ├── AdminRoutes.js
    │   └── UserRoutes.js
    ├── middlewares/
    │   └── verifyToken.js
    ├── utils/
    │   └── db.js
    ├── index.js
    └── package.json
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:

   ```bash
   cd Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file with the following variables:

   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the Frontend directory:

   ```bash
   cd Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file with:

   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### User Routes

- GET `/api/user/communications` - Get all communications
- PATCH `/api/user/communications/:id/complete` - Mark communication as complete
- POST `/api/user/communications/complete-multiple` - Complete multiple communications

### Admin Routes

- GET `/api/admin/communications` - Get all communications (admin view)
- POST `/api/admin/communications` - Create new communication
- PUT `/api/admin/communications/:id` - Update communication
- DELETE `/api/admin/communications/:id` - Delete communication

## Security Features

- CORS protection
- JWT authentication
- Protected routes
- Role-based access control
- Environment variable management
- Error handling middleware

## Development Guidelines

### Code Style

- Modern ES6+ JavaScript
- React Hooks for state management
- Functional components
- Material-UI theming
- Consistent error handling
- Proper TypeScript definitions

### Best Practices

- Component-based architecture
- Responsive design
- Error boundaries
- Loading states
- Proper date handling
- Consistent styling
- Clean code principles

## Production Deployment

### Backend

1. Set production environment variables
2. Enable MongoDB authentication
3. Configure CORS for production domain
4. Set up proper error logging
5. Enable HTTPS

### Frontend

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Configure production API endpoints
3. Set up CDN for static assets
4. Enable HTTPS
5. Configure caching
