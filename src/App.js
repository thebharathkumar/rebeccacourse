import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

// Search Bar Component
function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search courses, programs, or course codes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-6 py-4 text-lg text-gray-800 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
      />
      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}

// Filter Panel Component
function FilterPanel({ filters, selected, onChange, onReset }) {
  const filterConfig = [
    { key: 'program', label: 'Study Abroad Program', options: filters.programs || [] },
    { key: 'credits', label: 'Foreign Course Credits', options: filters.credits || [] },
    { key: 'aok', label: 'Area of Knowledge (AOK)', options: filters.aoks || [] },
    { key: 'school', label: 'Pace School', options: filters.schools || [] },
    { key: 'department', label: 'Pace Department', options: filters.departments || [] },
  ];

  const hasActiveFilters = Object.values(selected).some(v => v);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        {hasActiveFilters && (
          <button onClick={onReset} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Reset All
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {filterConfig.map(({ key, label, options }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <select
              value={selected[key] || ''}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
            >
              <option value="">All</option>
              {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// Results Table Component
function ResultsTable({ courses, sort, onSort }) {
  const columns = [
    { key: 'foreign_course_title', label: 'Foreign Course' },
    { key: 'foreign_course_code', label: 'Code' },
    { key: 'foreign_course_credits', label: 'Credits' },
    { key: 'home_course_title', label: 'Pace Equivalent' },
    { key: 'home_course_code', label: 'Pace Code' },
    { key: 'study_abroad_program', label: 'Program' },
    { key: 'aok', label: 'AOK' },
    { key: 'pace_school', label: 'School' },
  ];

  const handleSort = (key) => {
    const newOrder = sort.key === key && sort.order === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-500">No courses found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {sort.key === key && (
                      <span>{sort.order === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map((course, idx) => (
              <tr key={course.id || idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800">{course.foreign_course_title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{course.foreign_course_code}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">{course.foreign_course_credits}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{course.home_course_title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{course.home_course_code}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{course.study_abroad_program}</td>
                <td className="px-4 py-3">
                  {course.aok && course.aok.split(',').map((a, i) => (
                    <span key={i} className="tag-aok">{a.trim()}</span>
                  ))}
                </td>
                <td className="px-4 py-3">
                  {course.pace_school && <span className="tag-school">{course.pace_school}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
        Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// Main Home Page
function HomePage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [courses, setCourses] = useState([]);
  const [sort, setSort] = useState({ key: '', order: 'asc' });
  const [loading, setLoading] = useState(false);

  // Fetch filter options
  useEffect(() => {
    fetch(`${API_BASE}/api/filters`, { credentials: 'include' })
      .then(r => r.json())
      .then(setFilters)
      .catch(console.error);
  }, []);

  // Fetch courses with debounce
  const fetchCourses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedFilters.program) params.set('program', selectedFilters.program);
    if (selectedFilters.credits) params.set('credits', selectedFilters.credits);
    if (selectedFilters.aok) params.set('aok', selectedFilters.aok);
    if (selectedFilters.school) params.set('school', selectedFilters.school);
    if (selectedFilters.department) params.set('department', selectedFilters.department);
    if (sort.key) {
      params.set('sort', sort.key);
      params.set('order', sort.order);
    }

    fetch(`${API_BASE}/api/courses?${params}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, selectedFilters, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSelectedFilters({});
    setSearch('');
  };

  const handleSort = (key, order) => {
    setSort({ key, order });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span style={{color: '#002D72'}}>PACE </span>
                <span style={{color: '#5DADE2'}}>UNIVERSITY</span>
              </h1>
              <p style={{color: '#5DADE2'}} className="text-sm font-medium">International</p>
            </div>
            <Link to="/admin" className="text-gray-500 hover:text-gray-700 text-sm">
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pace-gradient text-white pb-16 pt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Find Your Course Equivalencies</h2>
          <p className="text-blue-200 mb-8">Search pre-approved foreign courses that transfer to Pace University</p>
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 -mt-6 pb-12">
        <div className="space-y-6">
          <FilterPanel
            filters={filters}
            selected={selectedFilters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500">Loading courses...</p>
            </div>
          ) : (
            <ResultsTable courses={courses} sort={sort} onSort={handleSort} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>Pace University Study Abroad - Course Equivalency Database</p>
        </div>
      </footer>
    </div>
  );
}

// Admin Page
function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAuthenticated(true);
      fetchStats(token);
    }
  }, []);

  const fetchStats = (token) => {
    fetch(`${API_BASE}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      setAuthenticated(true);
      fetchStats(data.token);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAuthenticated(false);
    navigate('/');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Login
            </button>
          </form>
          <Link to="/" className="block text-center mt-4 text-blue-600 hover:text-blue-800 text-sm">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span style={{color: '#002D72'}}>PACE </span>
              <span style={{color: '#5DADE2'}}>UNIVERSITY</span>
            </h1>
            <p style={{color: '#5DADE2'}} className="text-sm font-medium">Admin Dashboard</p>
          </div>
          <div className="flex gap-4">
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">View Site</Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
                <p className="text-gray-500">Total Courses</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-blue-600">{stats.totalPrograms}</p>
                <p className="text-gray-500">Study Abroad Programs</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Database Information</h3>
            <p className="text-sm text-gray-500">
              To update courses, replace the Excel file in the repository and redeploy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// App Component
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
