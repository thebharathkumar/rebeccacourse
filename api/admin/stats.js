const fs = require('fs');
const path = require('path');

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'pace-admin-token-2024';

let coursesCache = null;

function loadCourses() {
  if (coursesCache) return coursesCache;

  const jsonPath = path.join(__dirname, '..', 'courses.json');
  try {
    coursesCache = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`Loaded ${coursesCache.length} courses`);
  } catch (e) {
    console.error('Error loading courses:', e);
    coursesCache = [];
  }
  return coursesCache;
}

function checkAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  return token === AUTH_TOKEN;
}

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const courses = loadCourses();
  const programs = new Set(courses.map(c => c.study_abroad_program).filter(v => v));

  res.json({
    totalCourses: courses.length,
    totalPrograms: programs.size
  });
};
