# Pace University Course Equivalency Search

A modern, responsive web application for searching and filtering pre-approved foreign courses that transfer to Pace University. Built specifically for the Education Abroad program to help students find course equivalencies from partner institutions worldwide.

![Pace Education Abroad](public/Pace-EducationAbroad-SingleLineLeft-2Color-RGB%20-%20CLEAR%20background.png)

## 🌟 Features

### Search & Discovery
- **Instant Search**: Real-time search across all course fields with 300ms debounce
- **Smart Filtering**: Filter by Study Abroad Program, Area of Knowledge (AOK), Pace School, and Pace Department
- **Multi-field Search**: Search across foreign course titles, codes, home course equivalents, departments, and more
- **Sortable Columns**: Click any column header to sort results ascending or descending

### User Experience
- **3,133+ Course Equivalencies**: Comprehensive database from partner institutions worldwide
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Visual Tags**: Color-coded tags for AOK and Department fields
- **Loading States**: Smooth loading indicators for better user feedback
- **Error Handling**: Robust error handling with user-friendly messages

### Admin Features
- **Secure Admin Dashboard**: Protected login for authorized personnel
- **Excel Upload**: Upload and parse new course data from Excel files
- **Database Statistics**: View total courses and filter counts
- **Authentication**: Token-based authentication for secure access

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0**: Modern UI library with functional components and hooks
- **React Router DOM 6.28.0**: Client-side routing for SPA navigation
- **Tailwind CSS 3.4.15**: Utility-first CSS framework for responsive design
- **PostCSS 8.4.49**: CSS processing with autoprefixer

### Backend (Serverless)
- **Vercel Serverless Functions**: Node.js serverless API endpoints
- **File-based Storage**: JSON data file for fast, serverless-compatible storage
- **Express-style Routing**: API endpoints following REST principles

### Data Management
- **XLSX 0.18.5**: Excel file parsing and processing
- **JSON Storage**: 1.43 MB data file with 3,133 course records
- **Data Normalization**: Automated cleaning and standardization of school/department names

### Build & Development
- **Create React App 5.0.1**: Zero-config React build setup
- **Concurrently 8.2.2**: Run multiple npm scripts simultaneously
- **Node.js 18+**: JavaScript runtime environment

### Deployment
- **Vercel**: Serverless deployment platform with automatic CI/CD
- **GitHub Integration**: Automatic deployments on push
- **Environment Configuration**: Production-optimized builds

## 📂 Project Structure

```
rebeccacourse/
├── api/                          # Serverless API endpoints
│   ├── courses.js                # Course search and filtering endpoint
│   ├── filters.js                # Filter options endpoint
│   ├── login.js                  # Admin authentication
│   ├── debug.js                  # Debug/diagnostic endpoint
│   ├── data.json                 # Course database (3,133 records, 1.43 MB)
│   └── admin/                    # Admin-only endpoints
│       ├── upload.js             # Excel file upload handler
│       └── stats.js              # Database statistics
│
├── public/                       # Static assets
│   ├── index.html                # HTML entry point
│   ├── Pace-EducationAbroad-SingleLineLeft-2Color-RGB - CLEAR background.png
│   └── Pace-International-SingleLine-FlushLeft-2Color-PMS.jpg
│
├── src/                          # React application source
│   ├── App.js                    # Main application component
│   │   ├── SearchBar             # Search input component
│   │   ├── FilterPanel           # Multi-filter dropdown panel
│   │   ├── ResultsTable          # Sortable course results table
│   │   ├── HomePage              # Main search page
│   │   └── AdminPage             # Admin dashboard
│   ├── index.js                  # React entry point
│   └── index.css                 # Tailwind CSS + custom styles
│
├── VIEW ONLY Pre-Approved Foreign Courses Database.xlsx  # Source Excel data
├── package.json                  # Dependencies and scripts
├── vercel.json                   # Vercel deployment configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and **npm** installed
- Git for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/thebharathkumar/rebeccacourse.git
cd rebeccacourse
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development servers**
```bash
npm run dev
```

This runs both servers concurrently:
- **Backend API**: http://localhost:3001
- **React Frontend**: http://localhost:3000

### Running Separately

**Backend API only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## 🔌 API Documentation

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-app.vercel.app/api`

### Public Endpoints

#### `GET /api/courses`
Retrieve courses with optional search and filters.

**Query Parameters:**
- `search` (string): Search across all course fields
- `program` (string): Filter by Study Abroad Program
- `aok` (string): Filter by Area of Knowledge (individual values)
- `school` (string): Filter by Pace School
- `department` (string): Filter by Pace Department

**Response:**
```json
[
  {
    "id": 1,
    "foreign_course_title": "Basic Course in C Programming",
    "foreign_course_code": "ELEC-A7100",
    "foreign_course_credits": "5",
    "home_course_title": "Introduction to Computer Science",
    "aok": "",
    "home_course_code": "CS 121",
    "study_abroad_program": "Aalto University (Seidenberg students only)",
    "course_notes": "Spring ",
    "pace_school": "Seidenberg School of CSIS",
    "pace_department": "Computer Science"
  }
]
```

#### `GET /api/filters`
Get all available filter options.

**Response:**
```json
{
  "programs": ["Aalto University", "..."],
  "credits": ["3", "5", "6", "..."],
  "aoks": ["AOK 2", "AOK 3", "AOK 4", "AOK 5"],
  "schools": ["College of Health Professions", "Dyson College of Arts and Sciences", "..."],
  "departments": ["Accounting", "Art", "Biology", "..."]
}
```

#### `POST /api/login`
Admin authentication.

**Request Body:**
```json
{
  "username": "Rebslotkin",
  "password": "SA2026"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "auth_token_here"
}
```

### Admin Endpoints (Requires Authentication)

#### `POST /api/admin/upload`
Upload new Excel file to update course database.

**Headers:**
- `Authorization: Bearer <token>`

**Request:** Multipart form data with Excel file

**Response:**
```json
{
  "message": "Upload successful",
  "courses": 3133
}
```

#### `GET /api/admin/stats`
Get database statistics.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalCourses": 3133,
  "programs": 98,
  "schools": 6,
  "departments": 49
}
```

#### `GET /api/debug`
Diagnostic endpoint for troubleshooting file system issues.

**Response:**
```json
{
  "cwd": "/var/task",
  "dirname": "/var/task/api",
  "dataPath": "/var/task/api/data.json",
  "dataExists": true,
  "dataSize": 1500000,
  "dataSizeMB": "1.43 MB"
}
```

## 🎓 Admin Access

**URL**: `/admin`

**Credentials:**
- **Username**: `Rebslotkin`
- **Password**: `SA2026`

**Features:**
- View total course count and filter statistics
- Upload new Excel files to update course database
- Secure token-based authentication

## 📊 Database Schema

Each course record contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier |
| `foreign_course_title` | String | Title of foreign course |
| `foreign_course_code` | String | Course code at foreign institution |
| `foreign_course_credits` | String | Credit hours for foreign course |
| `home_course_title` | String | Pace University equivalent course title |
| `aok` | String | Area of Knowledge (comma-separated if multiple) |
| `home_course_code` | String | Pace course code |
| `study_abroad_program` | String | Partner institution/program name |
| `course_notes` | String | Additional notes (term offerings, etc.) |
| `pace_school` | String | Pace University school |
| `pace_department` | String | Pace University department |

## 🔄 Updating Course Data

### Method 1: Admin Dashboard (Recommended)
1. Log in to `/admin`
2. Click "Upload New Course Data"
3. Select the updated Excel file
4. Click "Upload and Process"
5. Data is automatically parsed and updated

### Method 2: Manual Update
1. Place updated Excel file in project root
2. Run the parsing script:
```bash
node -e "
const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('VIEW ONLY Pre-Approved Foreign Courses Database.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const allData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

const courses = [];
for (let i = 2; i < allData.length; i++) {
  const row = allData[i];
  if (row && row.length > 0 && row[0]) {
    courses.push({
      id: courses.length + 1,
      foreign_course_title: String(row[0] || ''),
      foreign_course_code: String(row[1] || ''),
      foreign_course_credits: String(row[2] || ''),
      home_course_title: String(row[3] || ''),
      aok: String(row[4] || ''),
      home_course_code: String(row[5] || ''),
      study_abroad_program: String(row[6] || ''),
      course_notes: String(row[7] || ''),
      pace_school: String(row[8] || ''),
      pace_department: String(row[9] || '')
    });
  }
}

fs.writeFileSync('api/data.json', JSON.stringify(courses, null, 2));
console.log('Updated', courses.length, 'courses');
"
```
3. Commit and push changes
4. Vercel will auto-deploy

### Excel File Format
The Excel file must have:
- **Row 1**: Instructions (ignored)
- **Row 2**: Headers (ignored)
- **Row 3+**: Data rows

**Required columns (in order):**
1. Foreign Course Title
2. Foreign Course Code
3. Foreign Course Credits
4. Home Course Title Equivalent
5. AOK
6. Home Course Code Equivalent
7. Study Abroad Program
8. Course Notes
9. Pace School
10. Pace Department

## 🌐 Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)

### Method 1: GitHub Integration (Recommended)

1. **Push code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings (use defaults)
   - Click "Deploy"

3. **Automatic Deployments**
   - Every push to `main` triggers a production deployment
   - Pull requests get preview deployments

### Method 2: Vercel CLI

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy to preview**
```bash
vercel
```

3. **Deploy to production**
```bash
vercel --prod
```

### Vercel Configuration

The `vercel.json` file configures:
- **Memory**: 2048 MB (2GB) for serverless functions
- **Max Duration**: 10 seconds per function
- **CORS Headers**: Allow all origins for API access
- **Build Environment**: Production Node environment

### Important Notes

- ✅ **Data Persistence**: Course data is stored in `api/data.json` and persists across deployments
- ✅ **Serverless Compatible**: Uses `__dirname` for reliable file paths in serverless environment
- ✅ **Optimized Memory**: 2GB allocation handles large data files efficiently
- ✅ **Fast Deploys**: Typically complete in 1-2 minutes

## 🎨 Customization

### Updating Branding

**Logo:**
Replace `/public/Pace-EducationAbroad-SingleLineLeft-2Color-RGB - CLEAR background.png`

**Colors:**
Edit `src/index.css`:
```css
.pace-gradient {
  background: linear-gradient(135deg, #002D72 0%, #5DADE2 100%);
}
```

**Tailwind Theme:**
Edit `tailwind.config.js` to customize colors, fonts, spacing, etc.

### Adding Features

**New Filter:**
1. Add field to `api/filters.js`
2. Add dropdown to `FilterPanel` in `src/App.js`
3. Add filter logic to `api/courses.js`

**New Column:**
1. Add field to data parsing script
2. Add column to `ResultsTable` in `src/App.js`

## 🐛 Troubleshooting

### Search Not Working

**Symptom**: Search returns errors or no results

**Solution**: Check that all fields are converted to strings in `api/courses.js`:
```javascript
String(c.foreign_course_title).toLowerCase().includes(s)
```

### Data Not Loading

**Symptom**: "No course data available" error

**Solution**:
1. Check `/api/debug` endpoint for file system info
2. Verify `api/data.json` exists and is valid JSON
3. Ensure `__dirname` is used for file paths (not `process.cwd()`)

### Vercel Deployment Failures

**Memory Error**: Increase memory in `vercel.json` (max 3008 MB for Pro, 2048 MB for Hobby)

**Timeout Error**: Increase `maxDuration` in `vercel.json` (max 10s for Hobby, 60s for Pro)

**Build Error**: Check build logs in Vercel dashboard, ensure all dependencies are in `package.json`

### Filter Duplicates

**Symptom**: Duplicate entries in filter dropdowns

**Solution**: Data normalization has been implemented. If issues persist, check `api/filters.js` for proper deduplication.

## 🔐 Security Considerations

- ✅ Admin credentials should be changed in production
- ✅ Token-based authentication for admin endpoints
- ✅ CORS configured for API access
- ✅ No sensitive data exposed in client-side code
- ⚠️ Consider implementing environment variables for secrets
- ⚠️ Consider adding rate limiting for API endpoints

## 📈 Performance Optimizations

- **Debounced Search**: 300ms delay prevents excessive API calls
- **Memoization**: React useCallback for stable function references
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: PNG logo with transparent background (115KB vs 1.2MB JPG)
- **Data Caching**: Filters loaded once per session
- **Serverless Functions**: Auto-scaling based on traffic

## 📝 License

This project is proprietary and confidential. All rights reserved by Pace University.

## 👥 Credits

**Developed for**: Pace University Education Abroad Program
**Administrator**: Rebecca Slotkin
**Year**: 2024

## 📞 Support

For issues, questions, or feature requests:
1. Check this README first
2. Review the Troubleshooting section
3. Check Vercel deployment logs
4. Contact the development team

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Total Courses**: 3,133
**Partner Institutions**: 98+
