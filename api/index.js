const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory data store (for Vercel serverless)
let courses = [];
let users = [{ id: 1, username: 'Rebslotkin', password: 'SA2026' }];

// Load data from JSON or Excel
function loadData() {
  const jsonPath = path.join(__dirname, 'courses.json');
  const excelPath = path.join(__dirname, '..', 'VIEW ONLY Pre-Approved Foreign Courses Database.xlsx');

  // Try JSON first
  if (fs.existsSync(jsonPath)) {
    try {
      courses = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log(`Loaded ${courses.length} courses from JSON`);
      return;
    } catch (e) {
      console.log('Error loading JSON:', e.message);
    }
  }

  // Fall back to Excel
  if (fs.existsSync(excelPath)) {
    try {
      const workbook = XLSX.readFile(excelPath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      courses = [];
      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[0] !== 'Foreign Course Title') {
          courses.push({
            id: i - 1,
            foreign_course_title: row[0] || '',
            foreign_course_code: row[1] || '',
            foreign_course_credits: row[2] || '',
            home_course_title: row[3] || '',
            aok: row[4] || '',
            home_course_code: row[5] || '',
            study_abroad_program: row[6] || '',
            course_notes: row[7] || '',
            pace_school: row[8] || '',
            pace_department: row[9] || ''
          });
        }
      }
      console.log(`Loaded ${courses.length} courses from Excel`);
    } catch (e) {
      console.log('Error loading Excel:', e.message);
    }
  }
}

loadData();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Simple token auth (stateless for serverless)
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'pace-admin-token-2024';

function checkAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  return token === AUTH_TOKEN;
}

// API Routes
app.get('/api/courses', (req, res) => {
  // Ensure data is loaded
  if (courses.length === 0) {
    loadData();
  }

  const { search, program, credits, aok, school, department, sort, order } = req.query;

  console.log('Search query:', search, 'Total courses:', courses.length);

  let results = [...courses];

  if (search) {
    const s = search.toLowerCase();
    results = results.filter(c =>
      (c.foreign_course_title || '').toLowerCase().includes(s) ||
      (c.home_course_title || '').toLowerCase().includes(s) ||
      (c.foreign_course_code || '').toLowerCase().includes(s) ||
      (c.home_course_code || '').toLowerCase().includes(s)
    );
    console.log('Filtered results:', results.length);
  }
  if (program) results = results.filter(c => c.study_abroad_program === program);
  if (credits) results = results.filter(c => c.foreign_course_credits === credits);
  if (aok) results = results.filter(c => (c.aok || '').includes(aok));
  if (school) results = results.filter(c => c.pace_school === school);
  if (department) results = results.filter(c => c.pace_department === department);

  if (sort) {
    results.sort((a, b) => {
      const aVal = (a[sort] || '').toLowerCase();
      const bVal = (b[sort] || '').toLowerCase();
      return order === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    });
  }

  res.json(results);
});

app.get('/api/filters', (req, res) => {
  // Ensure data is loaded
  if (courses.length === 0) {
    loadData();
  }

  const getUnique = (key) => [...new Set(courses.map(c => c[key]).filter(v => v))].sort();

  res.json({
    programs: getUnique('study_abroad_program'),
    credits: getUnique('foreign_course_credits'),
    aoks: getUnique('aok'),
    schools: getUnique('pace_school'),
    departments: getUnique('pace_department')
  });
});

// Auth routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ success: true, token: AUTH_TOKEN, username: user.username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/admin/stats', (req, res) => {
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // Ensure data is loaded
  if (courses.length === 0) {
    loadData();
  }

  const programs = new Set(courses.map(c => c.study_abroad_program).filter(v => v));
  res.json({ totalCourses: courses.length, totalPrograms: programs.size });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
