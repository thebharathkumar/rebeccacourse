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
      console.log('[filters] Successfully loaded', coursesData.length, 'courses');
    } catch (error) {
      console.error('[filters] Failed to load data:', error.message);
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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const courses = loadCourses();

    if (courses.length === 0) {
      return res.status(500).json({ error: 'No course data available' });
    }

    const programs = [...new Set(courses.map(c => c.study_abroad_program).filter(Boolean))].sort();
    const credits = [...new Set(courses.map(c => String(c.foreign_course_credits)).filter(Boolean))].sort();

    // Split AOK values by comma to get individual values only (AOK 2, not "AOK 2, AOK 4")
    const aoks = [...new Set(
      courses
        .map(c => c.aok)
        .filter(Boolean)
        .flatMap(aok => aok.split(',').map(a => a.trim()))
        .filter(Boolean)
    )].sort();

    const schools = [...new Set(courses.map(c => c.pace_school).filter(Boolean))].sort();
    const departments = [...new Set(courses.map(c => c.pace_department).filter(Boolean))].sort();

    console.log('[filters] Returning filters');
    return res.status(200).json({
      programs,
      credits,
      aoks,
      schools,
      departments
    });
  } catch (error) {
    console.error('[filters] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
