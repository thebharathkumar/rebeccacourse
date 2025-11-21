import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

// Search Bar Component
function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-3xl mx-auto fade-in">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search by course name, code, or program..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input pl-14"
      />
    </div>
  );
}

// Filter Panel Component
function FilterPanel({ filters, selected, onChange, onReset }) {
  const filterConfig = [
    { key: 'program', label: 'Study Abroad Program', options: filters.programs || [] },
    { key: 'aok', label: 'Area of Knowledge (AOK)', options: filters.aoks || [] },
    { key: 'school', label: 'Pace School', options: filters.schools || [] },
    { key: 'department', label: 'Pace Department', options: filters.departments || [] },
  ];

  const hasActiveFilters = Object.values(selected).some(v => v);

  return (
    <div className="filter-card p-6 fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-800">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button onClick={onReset} className="btn-secondary">
            ✕ Reset All
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filterConfig.map(({ key, label, options }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <select
              value={selected[key] || ''}
              onChange={(e) => onChange(key, e.target.value)}
              className="filter-select"
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
    { key: 'pace_department', label: 'Department' },
  ];

  const handleSort = (key) => {
    const newOrder = sort.key === key && sort.order === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  if (courses.length === 0) {
    return (
      <div className="results-card p-16 text-center fade-in">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xl font-semibold text-gray-600 mb-2">No courses found</p>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="results-card fade-in">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200">
            <tr>
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-2">
                    {label}
                    {sort.key === key && (
                      <span className="text-blue-600 text-sm">{sort.order === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course, idx) => (
              <tr key={course.id || idx} className="table-row">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.foreign_course_title}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{course.foreign_course_code}</td>
                <td className="px-6 py-4 text-sm text-gray-600 text-center font-semibold">{course.foreign_course_credits}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.home_course_title}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{course.home_course_code}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{course.study_abroad_program}</td>
                <td className="px-6 py-4">
                  {course.aok && course.aok.split(',').map((a, i) => (
                    <span key={i} className="tag-aok">{a.trim()}</span>
                  ))}
                </td>
                <td className="px-6 py-4">
                  {course.pace_department && <span className="tag-school">{course.pace_department}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t-2 border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            Showing <span className="text-blue-600">{courses.length}</span> course{courses.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Click column headers to sort</span>
          </div>
        </div>
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
    fetch(`${API_BASE}/api/filters`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch filters');
        return r.json();
      })
      .then(data => {
        console.log('Filters loaded:', data);
        setFilters(data);
      })
      .catch(err => {
        console.error('Error loading filters:', err);
      });
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

    console.log('Fetching courses with params:', params.toString());
    fetch(`${API_BASE}/api/courses?${params}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch courses');
        return r.json();
      })
      .then(data => {
        console.log('Courses loaded:', data.length);
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading courses:', err);
        setLoading(false);
      });
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
      <div className="pace-gradient text-white pb-20 pt-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="mb-6">
            <h2 className="text-5xl font-extrabold mb-3 tracking-tight">Find Your Course Equivalencies</h2>
            <p className="text-xl text-blue-100 mb-2">Search pre-approved foreign courses that transfer to Pace University</p>
            <p className="text-sm text-blue-200">Explore over 3,000 course equivalencies from partner institutions worldwide</p>
          </div>
          <div className="mt-10">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 -mt-10 pb-16 relative z-20">
        <div className="space-y-8">
          <FilterPanel
            filters={filters}
            selected={selectedFilters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />

          {loading ? (
            <div className="results-card p-16 text-center fade-in">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-600">Loading courses...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="filter-card p-10 w-full max-w-md fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Admin Login</h2>
            <p className="text-sm text-gray-600">Enter your credentials to access the dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="filter-select"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="filter-select"
                placeholder="Enter password"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>
          <Link to="/" className="btn-secondary w-full text-center block mt-4">
            ← Back to Search
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
            <div className="grid grid-cols-2 gap-6 fade-in">
              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-4xl font-extrabold text-blue-600 mb-1">{stats.totalCourses.toLocaleString()}</p>
                <p className="text-sm font-semibold text-gray-600">Total Courses</p>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Global</span>
                </div>
                <p className="text-4xl font-extrabold text-purple-600 mb-1">{stats.totalPrograms}</p>
                <p className="text-sm font-semibold text-gray-600">Study Abroad Programs</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="filter-card p-6 fade-in">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Database Information</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              To update courses, replace the Excel file in the repository and redeploy the application. The data will automatically refresh on the next build.
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
