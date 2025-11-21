const fs = require('fs');
const path = require('path');

// Load courses data once
const dataPath = path.join(__dirname, 'data.json');
let coursesData = null;

function getCourses() {
  if (!coursesData) {
    try {
      const rawData = fs.readFileSync(dataPath, 'utf8');
      coursesData = JSON.parse(rawData);
      console.log(`[filters] Loaded ${coursesData.length} courses from data.json`);
    } catch (error) {
      console.error('[filters] Error loading data:', error);
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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const courses = getCourses();

    // Extract unique values for each filter
    const programs = [...new Set(courses.map(c => c.study_abroad_program).filter(Boolean))].sort();
    const credits = [...new Set(courses.map(c => String(c.foreign_course_credits)).filter(Boolean))].sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      return numA - numB;
    });
    const aoks = [...new Set(courses.map(c => c.aok).filter(Boolean))].sort();
    const schools = [...new Set(courses.map(c => c.pace_school).filter(Boolean))].sort();
    const departments = [...new Set(courses.map(c => c.pace_department).filter(Boolean))].sort();

    const result = {
      programs,
      credits,
      aoks,
      schools,
      departments
    };

    console.log('[filters] Returning filters:', {
      programs: programs.length,
      credits: credits.length,
      aoks: aoks.length,
      schools: schools.length,
      departments: departments.length
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('[filters] Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
