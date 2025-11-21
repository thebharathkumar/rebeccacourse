const courses = require('./data.json');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract unique values
    const programs = [...new Set(courses.map(c => c.study_abroad_program).filter(Boolean))].sort();
    const credits = [...new Set(courses.map(c => String(c.foreign_course_credits)).filter(Boolean))].sort();
    const aoks = [...new Set(courses.map(c => c.aok).filter(Boolean))].sort();
    const schools = [...new Set(courses.map(c => c.pace_school).filter(Boolean))].sort();
    const departments = [...new Set(courses.map(c => c.pace_department).filter(Boolean))].sort();

    return res.status(200).json({
      programs,
      credits,
      aoks,
      schools,
      departments
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
