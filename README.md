# Pace University Course Equivalency Search

A web application for searching pre-approved foreign courses that transfer to Pace University.

## Features

- Live search with instant results
- Multi-filter capability (Program, Credits, AOK, School, Department)
- Sortable results table
- Tag-style display for AOK and Pace School
- Admin dashboard with Excel upload
- Responsive design with Pace University branding

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development servers:
```bash
npm run dev
```

This runs:
- Backend API on http://localhost:3001
- React frontend on http://localhost:3000

### Running separately

Backend only:
```bash
npm run server
```

Frontend only:
```bash
npm run client
```

## Admin Access

- URL: `/admin`
- Username: `Rebslotkin`
- Password: `SA2026`

## Deployment to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. For production:
```bash
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-deploys on push

### Important Notes for Vercel

- Database uses `/tmp/courses.db` in production (ephemeral)
- Upload new Excel file after each deployment to populate data
- For persistent storage, consider upgrading to Vercel Postgres or external database

## Project Structure

```
/
├── api/
│   └── index.js        # Express server & API routes
├── public/
│   └── index.html      # HTML template
├── src/
│   ├── App.js          # React app with all components
│   ├── index.js        # React entry point
│   └── index.css       # Tailwind styles
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── README.md
```

## API Endpoints

- `GET /api/courses` - Get courses (with search/filter params)
- `GET /api/filters` - Get filter options
- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout
- `GET /api/auth/check` - Check auth status
- `POST /api/admin/upload` - Upload Excel file (auth required)
- `GET /api/admin/stats` - Get database stats (auth required)

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router
- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Excel Parsing**: xlsx library
- **Auth**: bcryptjs, express-session
