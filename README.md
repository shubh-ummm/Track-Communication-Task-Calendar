# Communication Task Calendar
A modern web application for managing company communications and tasks with an intuitive calendar interface and notification system.
![Screenshot (55)](https://github.com/user-attachments/assets/3ef8ef4d-04f5-49e5-b93e-bc8af1f7b5a3)
  - Red: Overdue communications
  - Yellow: Due today
  - Green: Completed tasks
  - Blue: Upcoming tasks

## Live Demo

https://track-communication-task-calendar-app.vercel.app/

Email:"user@user.com" Password:"user"
Note: Please log in as a User and Admin using different browsers.
![Screenshot (49)](https://github.com/user-attachments/assets/f68cff8a-d4b6-4ad9-ae58-db42867624d3)
![Screenshot (56)](https://github.com/user-attachments/assets/48a62930-19ec-445c-81b4-0a0365372935)
![Screenshot (57)](https://github.com/user-attachments/assets/ceedddbe-1f0b-40eb-8cd2-5fc3919d6ef5)
![Screenshot (58)](https://github.com/user-attachments/assets/86ee373f-c1e7-451e-bcec-f0eeee8b3668)
![Screenshot (59)](https://github.com/user-attachments/assets/7737c186-a65c-4e4e-b1e5-3d6a19ff6aca)
![Screenshot (60)](https://github.com/user-attachments/assets/a66c4536-be1a-4ad5-9256-5f472182969d)
![Screenshot (50)](https://github.com/user-attachments/assets/0a1075d4-45b2-4702-9d5c-2b73678b762c)
![Screenshot (51)](https://github.com/user-attachments/assets/63a4c5f7-61cf-497f-998e-4576ad0dc82c)
![Screenshot (52)](https://github.com/user-attachments/assets/3637f8bf-4e8a-4f56-8bab-37b7481ddf76)
![Screenshot (53)](https://github.com/user-attachments/assets/cc4f0adf-f86d-4cb1-b345-c5ab8fdcf75b)
![Screenshot (54)](https://github.com/user-attachments/assets/409b93cc-0df2-4bd1-b554-a9216ca654ac)

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
