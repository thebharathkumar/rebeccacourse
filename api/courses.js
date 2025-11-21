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
    // Get query parameters
    const { search, program, credits, aok, school, department } = req.query;

    let results = courses;

    // Apply filters
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(c =>
        (c.foreign_course_title && c.foreign_course_title.toLowerCase().includes(s)) ||
        (c.foreign_course_code && c.foreign_course_code.toLowerCase().includes(s)) ||
        (c.home_course_title && c.home_course_title.toLowerCase().includes(s)) ||
        (c.home_course_code && c.home_course_code.toLowerCase().includes(s)) ||
        (c.study_abroad_program && c.study_abroad_program.toLowerCase().includes(s))
      );
    }

    if (program) {
      results = results.filter(c => c.study_abroad_program === program);
    }

    if (credits) {
      results = results.filter(c => String(c.foreign_course_credits) === String(credits));
    }

    if (aok) {
      results = results.filter(c => c.aok && c.aok.includes(aok));
    }

    if (school) {
      results = results.filter(c => c.pace_school === school);
    }

    if (department) {
      results = results.filter(c => c.pace_department === department);
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
