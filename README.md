# SecureNote

A full-stack web application for secure, private note-taking with user authentication.

## Features

- **Secure Authentication**: User login and registration with token-based authentication
- **Private Notes**: Create, read, update, and delete personal notes
- **Minimal UI**: Clean, distraction-free interface with modern design
- **Real-time Updates**: Instant note synchronization without page reloads
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **Vanilla JavaScript** - No frameworks, pure DOM manipulation
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with modern fonts and animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for REST API
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Project Structure

```
secure-note-app/
├── backend/                 # Node.js/Express server
│   ├── route/
│   │   ├── api.js          # Notes API endpoints
│   │   └── login.js        # Authentication endpoints
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .gitignore          # Git ignore rules
├── frontend/               # Static web files
│   ├── index.html          # Main application page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── script.js           # Frontend JavaScript
│   └── style.css           # Application styles
├── README.md               # This file
└── REPORT.md               # Technical report
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   # Add other environment variables as needed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

### Frontend Setup

The frontend consists of static HTML/CSS/JS files. You can serve them using any static file server or simply open the HTML files directly in a browser.

For development, you can use a simple HTTP server:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start a local server (using Python as an example):
   ```bash
   python -m http.server 8080
   ```

   Or using Node.js:
   ```bash
   npx serve .
   ```

## Usage

1. **Registration**: Visit the registration page to create a new account
2. **Login**: Use your credentials to log in and receive an authentication token
3. **Create Notes**: Write and save your private notes
4. **Manage Notes**: Edit or delete existing notes
5. **Security**: All notes are stored securely with user authentication

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Notes
- `GET /api/notes` - Get all user notes
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

Frontend: Open `frontend/index.html` in your browser or use a local server.

### Building for Production

1. Ensure all dependencies are installed
2. Set production environment variables
3. Run `npm start` in the backend directory
4. Serve the frontend files using a web server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes as part of Web Development Fundamentals & Architecture course.

## Technical Notes

- Frontend uses vanilla JavaScript with direct DOM manipulation
- Backend implements RESTful API with Express.js
- Authentication uses token-based system
- Data persistence through JSON file storage
- CORS enabled for cross-origin requests

For detailed technical analysis, see [REPORT.md](REPORT.md).
"# SECURE_NOTE" 
