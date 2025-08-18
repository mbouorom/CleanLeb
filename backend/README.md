# Lebanon Waste Management System

A simplified full-stack application for reporting and managing waste issues in Lebanon.

## Features

- 🔐 User authentication (register/login)
- 📍 Report waste issues with GPS location and photos
- 🗺️ View all reports with filtering options
- 🏆 Gamification with points and leaderboard
- 👨‍💼 Admin dashboard for managing reports
- 📱 Responsive design for mobile and desktop

## Tech Stack

**Frontend:**
- React 18 with JavaScript
- React Router for navigation
- Axios for API calls
- CSS3 for styling

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for image uploads
- Multer for file handling

## Setup Instructions

### Backend Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create a `.env` file with the following variables:
\`\`\`
MONGODB_URI=mongodb://localhost:27017/lebanon-waste
JWT_SECRET=your-secret-key-here
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
\`\`\`

3. Start the server:
\`\`\`bash
npm run dev
\`\`\`

### Frontend Setup

1. Navigate to the client folder:
\`\`\`bash
cd client
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the React app:
\`\`\`bash
npm start
\`\`\`

## Usage

1. Register a new account or login
2. Create waste reports with photos and GPS location
3. View all reports and vote on them
4. Check the leaderboard and earn points
5. Admins can manage report statuses and priorities

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id/vote` - Vote on a report
- `GET /api/users/leaderboard` - Get user leaderboard
- `GET /api/stats` - Get system statistics
- `PUT /api/admin/reports/:id` - Update report (admin only)

## File Structure

\`\`\`
├── server.js              # Main backend server
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── client/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   ├── public/
│   │   └── index.html     # HTML template
│   └── package.json       # Frontend dependencies
└── README.md              # This file
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
