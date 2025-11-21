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
      console.log(`[courses] Loaded ${coursesData.length} courses from data.json`);
    } catch (error) {
      console.error('[courses] Error loading data:', error);
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
    const { search, program, credits, aok, school, department, sort, order } = req.query;

    console.log('[courses] Query:', { search, program, credits, aok, school, department, sort, order });
    console.log('[courses] Total courses before filter:', courses.length);

    let results = [...courses];

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      results = results.filter(course => {
        return (
          (course.foreign_course_title && course.foreign_course_title.toLowerCase().includes(searchLower)) ||
          (course.foreign_course_code && course.foreign_course_code.toLowerCase().includes(searchLower)) ||
          (course.home_course_title && course.home_course_title.toLowerCase().includes(searchLower)) ||
          (course.home_course_code && course.home_course_code.toLowerCase().includes(searchLower)) ||
          (course.study_abroad_program && course.study_abroad_program.toLowerCase().includes(searchLower))
        );
      });
      console.log('[courses] After search filter:', results.length);
    }

    // Apply program filter
    if (program && program.trim()) {
      results = results.filter(course => course.study_abroad_program === program);
      console.log('[courses] After program filter:', results.length);
    }

    // Apply credits filter
    if (credits && credits.trim()) {
      results = results.filter(course => String(course.foreign_course_credits) === String(credits));
      console.log('[courses] After credits filter:', results.length);
    }

    // Apply AOK filter
    if (aok && aok.trim()) {
      results = results.filter(course => course.aok && course.aok.includes(aok));
      console.log('[courses] After aok filter:', results.length);
    }

    // Apply school filter
    if (school && school.trim()) {
      results = results.filter(course => course.pace_school === school);
      console.log('[courses] After school filter:', results.length);
    }

    // Apply department filter
    if (department && department.trim()) {
      results = results.filter(course => course.pace_department === department);
      console.log('[courses] After department filter:', results.length);
    }

    // Apply sorting
    if (sort && sort.trim()) {
      results.sort((a, b) => {
        const aVal = String(a[sort] || '').toLowerCase();
        const bVal = String(b[sort] || '').toLowerCase();
        const comparison = aVal.localeCompare(bVal);
        return order === 'desc' ? -comparison : comparison;
      });
    }

    console.log('[courses] Final results:', results.length);
    res.status(200).json(results);
  } catch (error) {
    console.error('[courses] Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
