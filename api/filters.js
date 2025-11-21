const fs = require('fs');
const path = require('path');

let coursesCache = null;

function loadCourses() {
  if (coursesCache) return coursesCache;

  const jsonPath = path.join(__dirname, 'data.json');
  try {
    coursesCache = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`Loaded ${coursesCache.length} courses`);
  } catch (e) {
    console.error('Error loading courses:', e);
    coursesCache = [];
  }
  return coursesCache;
}

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const courses = loadCourses();
  const getUnique = (key) => [...new Set(courses.map(c => c[key]).filter(v => v))].sort();

  res.json({
    programs: getUnique('study_abroad_program'),
    credits: getUnique('foreign_course_credits'),
    aoks: getUnique('aok'),
    schools: getUnique('pace_school'),
    departments: getUnique('pace_department')
  });
};
