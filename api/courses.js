const fs = require('fs');
const path = require('path');

// Load data once when the function starts - use __dirname for Vercel compatibility
const dataPath = path.join(__dirname, 'data.json');
let coursesData = null;

function loadCourses() {
  if (!coursesData) {
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      coursesData = JSON.parse(fileContent);
      console.log('[courses] Successfully loaded', coursesData.length, 'courses');
    } catch (error) {
      console.error('[courses] Failed to load data:', error.message);
      coursesData = [];
    }
  }
  return coursesData;
}

module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-API-Version', 'v2-dirname-fix');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const courses = loadCourses();

    if (courses.length === 0) {
      return res.status(500).json({ error: 'No course data available' });
    }

    const { search, program, credits, aok, school, department } = req.query;
    console.log('[courses] Query params received:', { search, program, credits, aok, school, department });

    let results = courses;
    console.log('[courses] Total courses before filtering:', results.length);

    // Apply search
    if (search) {
      const s = search.toLowerCase();
      console.log('[courses] Applying search filter for:', s);
      results = results.filter(c =>
        (c.foreign_course_title && c.foreign_course_title.toLowerCase().includes(s)) ||
        (c.foreign_course_code && c.foreign_course_code.toLowerCase().includes(s)) ||
        (c.home_course_title && c.home_course_title.toLowerCase().includes(s)) ||
        (c.home_course_code && c.home_course_code.toLowerCase().includes(s)) ||
        (c.study_abroad_program && c.study_abroad_program.toLowerCase().includes(s)) ||
        (c.foreign_course_credits && String(c.foreign_course_credits).includes(s)) ||
        (c.aok && c.aok.toLowerCase().includes(s)) ||
        (c.pace_school && c.pace_school.toLowerCase().includes(s)) ||
        (c.pace_department && c.pace_department.toLowerCase().includes(s))
      );
      console.log('[courses] After search filter:', results.length, 'courses');
    }

    // Apply filters
    if (program) results = results.filter(c => c.study_abroad_program === program);
    if (credits) results = results.filter(c => String(c.foreign_course_credits) === String(credits));
    if (aok) results = results.filter(c => c.aok && c.aok.includes(aok));
    if (school) results = results.filter(c => c.pace_school === school);
    if (department) results = results.filter(c => c.pace_department === department);

    console.log('[courses] Returning', results.length, 'results for query:', req.query);
    return res.status(200).json(results);
  } catch (error) {
    console.error('[courses] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
