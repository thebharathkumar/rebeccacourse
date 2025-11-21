const express = require('express');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/courses.db' : './courses.db';
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foreign_course_title TEXT,
    foreign_course_code TEXT,
    foreign_course_credits TEXT,
    home_course_title TEXT,
    aok TEXT,
    home_course_code TEXT,
    study_abroad_program TEXT,
    course_notes TEXT,
    pace_school TEXT,
    pace_department TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
`);

// Insert default admin user
const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('SA2026', 10);
try {
  db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)').run('Rebslotkin', hashedPassword);
} catch (e) {}

// Seed database from Excel
function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) as count FROM courses').get();
  if (count.count > 0) return;

  const excelPath = path.join(__dirname, '..', 'VIEW ONLY Pre-Approved Foreign Courses Database.xlsx');
  try {
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Skip first row (instructions), second row is headers
    const insert = db.prepare(`
      INSERT INTO courses (foreign_course_title, foreign_course_code, foreign_course_credits,
        home_course_title, aok, home_course_code, study_abroad_program, course_notes, pace_school, pace_department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        if (row[0] && row[0] !== 'Foreign Course Title') {
          insert.run(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9]);
        }
      }
    });

    insertMany(data.slice(2));
    console.log('Database seeded successfully');
  } catch (e) {
    console.log('Excel file not found or error seeding:', e.message);
  }
}

seedDatabase();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'pace-course-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'build')));
}

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// API Routes
app.get('/api/courses', (req, res) => {
  const { search, program, credits, aok, school, department, sort, order } = req.query;

  let query = 'SELECT * FROM courses WHERE 1=1';
  const params = [];

  if (search) {
    query += ` AND (foreign_course_title LIKE ? OR home_course_title LIKE ? OR foreign_course_code LIKE ? OR home_course_code LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  if (program) {
    query += ' AND study_abroad_program = ?';
    params.push(program);
  }
  if (credits) {
    query += ' AND foreign_course_credits = ?';
    params.push(credits);
  }
  if (aok) {
    query += ' AND aok LIKE ?';
    params.push(`%${aok}%`);
  }
  if (school) {
    query += ' AND pace_school = ?';
    params.push(school);
  }
  if (department) {
    query += ' AND pace_department = ?';
    params.push(department);
  }

  if (sort) {
    const validSorts = ['foreign_course_title', 'home_course_title', 'study_abroad_program', 'pace_school', 'pace_department'];
    if (validSorts.includes(sort)) {
      query += ` ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
    }
  }

  const courses = db.prepare(query).all(...params);
  res.json(courses);
});

app.get('/api/filters', (req, res) => {
  const programs = db.prepare('SELECT DISTINCT study_abroad_program FROM courses WHERE study_abroad_program IS NOT NULL AND study_abroad_program != "" ORDER BY study_abroad_program').all();
  const credits = db.prepare('SELECT DISTINCT foreign_course_credits FROM courses WHERE foreign_course_credits IS NOT NULL AND foreign_course_credits != "" ORDER BY foreign_course_credits').all();
  const aoks = db.prepare('SELECT DISTINCT aok FROM courses WHERE aok IS NOT NULL AND aok != "" ORDER BY aok').all();
  const schools = db.prepare('SELECT DISTINCT pace_school FROM courses WHERE pace_school IS NOT NULL AND pace_school != "" ORDER BY pace_school').all();
  const departments = db.prepare('SELECT DISTINCT pace_department FROM courses WHERE pace_department IS NOT NULL AND pace_department != "" ORDER BY pace_department').all();

  res.json({
    programs: programs.map(p => p.study_abroad_program),
    credits: credits.map(c => c.foreign_course_credits),
    aoks: aoks.map(a => a.aok),
    schools: schools.map(s => s.pace_school),
    departments: departments.map(d => d.pace_department)
  });
});

// Auth routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = { id: user.id, username: user.username };
    res.json({ success: true, username: user.username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ authenticated: true, username: req.session.user.username });
  } else {
    res.json({ authenticated: false });
  }
});

// Admin routes
const upload = multer({ dest: '/tmp/uploads/' });

app.post('/api/admin/upload', requireAuth, upload.single('file'), (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Clear existing data
    db.prepare('DELETE FROM courses').run();

    // Insert new data
    const insert = db.prepare(`
      INSERT INTO courses (foreign_course_title, foreign_course_code, foreign_course_credits,
        home_course_title, aok, home_course_code, study_abroad_program, course_notes, pace_school, pace_department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        if (row[0] && row[0] !== 'Foreign Course Title') {
          insert.run(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9]);
        }
      }
    });

    insertMany(data.slice(2));
    res.json({ success: true, count: data.length - 2 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/stats', requireAuth, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM courses').get();
  const programs = db.prepare('SELECT COUNT(DISTINCT study_abroad_program) as count FROM courses').get();
  res.json({ totalCourses: total.count, totalPrograms: programs.count });
});

// Catch-all for React in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
