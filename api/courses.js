const fs = require('fs');
const path = require('path');

let coursesCache = null;

function loadCourses() {
  if (coursesCache) return coursesCache;

  const jsonPath = path.join(__dirname, 'courses.json');
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
};
