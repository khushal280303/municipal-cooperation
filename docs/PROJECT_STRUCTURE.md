# Project Structure

Municipal Cooperation is a full-stack application with the following structure:

```
municipal-cooperation/
├── server/                 # Backend (Node.js/Express)
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── controllers/       # Business logic
│   ├── index.js          # Entry point
│   └── package.json
│
├── client/                # Frontend (React)
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   └── package.json
│
├── docs/                  # Documentation
├── .gitignore
├── package.json          # Root package.json
└── README.md
```

## Key Directories

### Backend (`/server`)
- **models/**: Mongoose schemas for User, Complaint, Tax, WasteManagement
- **routes/**: API endpoints for authentication, complaints, tax, waste management
- **controllers/**: Business logic for handling requests
- **middleware/**: Authentication, validation, error handling

### Frontend (`/client`)
- **components/**: Reusable UI components
- **pages/**: Page-level components (Dashboard, Complaints, etc.)
- **utils/**: API calls, helpers, constants

## Getting Started

1. Install dependencies: `npm run install-all`
2. Set up MongoDB and configure `.env` in `/server`
3. Run in development: `npm run dev`
4. Server runs on `http://localhost:5000`
5. Client runs on `http://localhost:3000`
