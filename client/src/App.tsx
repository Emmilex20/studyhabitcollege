// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AcademicsPage from './pages/AcademicsPage';
import ContactPage from './pages/ContactPage';
import AdmissionsPage from './pages/AdmissionsPage';
import StudentLifePage from './pages/StudentLifePage';
import EventsCalendarPage from './pages/EventsCalendarPage';
import NewsArchivePage from './pages/NewsArchivePage';
import CampusLifePage from './pages/CampusLifePage';
import NewsEventsPage from './pages/NewsEventsPage';
import Faculty from './pages/Faculty';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Gallery from './pages/Gallery';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';

// ✨ NEW IMPORT: EventDetailPage ✨
import EventDetailPage from './pages/EventDetailPage'; // Assuming you'll place it in 'src/pages'

// === ADMIN DASHBOARD PAGES ===
import AdminUsersPage from './pages/dashboard/AdminUsersPage';
import AdminCoursesPage from './pages/dashboard/AdminCoursesPage';
import AdminStudentsPage from './pages/dashboard/AdminStudentsPage';
import AdminGradesPage from './pages/dashboard/AdminGradesPage';
import AdminAttendancePage from './pages/dashboard/AdminAttendancePage';
import AdminEventsPage from './pages/dashboard/AdminEventsPage';
import AdminAnnouncementsPage from './pages/dashboard/AdminAnnouncementsPage';
import GalleryManagement from './pages/dashboard/GalleryManagement';
import SettingsPage from './pages/dashboard/SettingsPage';

// === TEACHER DASHBOARD PAGES ===
import TeacherCoursesPage from './pages/dashboard/TeacherCoursesPage';
import TeacherStudentsPage from './pages/dashboard/TeacherStudentsPage';
import TeacherGradebookPage from './pages/dashboard/TeacherGradebookPage';
import TeacherAttendancePage from './pages/dashboard/TeacherAttendancePage';

// === STUDENT DASHBOARD PAGES ===
import MyCoursesPage from './pages/dashboard/student/MyCoursesPage';
import MyGradesPage from './pages/dashboard/student/MyGradesPage';
import AttendancePage from './pages/dashboard/student/AttendancePage';

// === PARENT DASHBOARD PAGES ===
import ParentChildrenPage from './pages/dashboard/parent/ParentChildrenPage';
import ChildGradesPage from './pages/dashboard/parent/ChildGradesPage';
import ChildAttendancePage from './pages/dashboard/parent/ChildAttendancePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="/student-life" element={<StudentLifePage />} />
              {/* ✨ NEW ROUTE FOR SINGLE EVENT DETAIL ✨ */}
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/news" element={<NewsEventsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/events-calendar" element={<EventsCalendarPage />} />
              <Route path="/news-archive" element={<NewsArchivePage />} />
              <Route path="/campus-life" element={<CampusLifePage />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/gallery" element={<Gallery />} />

              {/* Protected Dashboard Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              >
                {/* Dashboard Overview (default for /dashboard) */}
                <Route
                  index
                  element={<DashboardOverview />}
                />

                {/* Admin Routes */}
                <Route
                  path="users"
                  element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>}
                />
                <Route
                  path="courses"
                  element={<ProtectedRoute allowedRoles={['admin']}><AdminCoursesPage /></ProtectedRoute>}
                />
                <Route
                  path="students"
                  element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><AdminStudentsPage /></ProtectedRoute>}
                />
                <Route
                  path="grades"
                  element={<ProtectedRoute allowedRoles={['admin']}><AdminGradesPage /></ProtectedRoute>}
                />
                <Route
                  path="attendance"
                  element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendancePage /></ProtectedRoute>}
                />
                {/* Events and Announcements can be accessed by multiple roles */}
                <Route
                  path="events"
                  element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}><AdminEventsPage /></ProtectedRoute>}
                />
                <Route
                  path="announcements"
                  element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}><AdminAnnouncementsPage /></ProtectedRoute>}
                />
                {/* 🎨 Admin Gallery Management Route */}
                <Route
                  path="gallery"
                  element={<ProtectedRoute allowedRoles={['admin']}><GalleryManagement /></ProtectedRoute>}
                />
                {/* ⭐ Settings Page (Admin only) ⭐ */}
                <Route
                  path="settings"
                  element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}><SettingsPage /></ProtectedRoute>}
                />


                {/* Teacher Routes */}
                <Route
                  path="teacher-courses"
                  element={<ProtectedRoute allowedRoles={['teacher']}><TeacherCoursesPage /></ProtectedRoute>}
                />
                <Route
                  path="teacher-students"
                  element={<ProtectedRoute allowedRoles={['teacher']}><TeacherStudentsPage /></ProtectedRoute>}
                />
                <Route
                  path="teacher-gradebook"
                  element={<ProtectedRoute allowedRoles={['teacher']}><TeacherGradebookPage /></ProtectedRoute>}
                />
                <Route
                  path="teacher-attendance"
                  element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAttendancePage /></ProtectedRoute>}
                />

                {/* Student Routes */}
                <Route
                  path="student-course"
                  element={<ProtectedRoute allowedRoles={['student']}><MyCoursesPage /></ProtectedRoute>}
                />
                <Route
                  path="student-grades"
                  element={<ProtectedRoute allowedRoles={['student']}><MyGradesPage /></ProtectedRoute>}
                />
                <Route
                  path="student-attendance"
                  element={<ProtectedRoute allowedRoles={['student']}><AttendancePage /></ProtectedRoute>}
                />

                {/* ✅ PARENT ROUTES with NESTING */}
                <Route
                  path="child"
                  element={<ProtectedRoute allowedRoles={['parent']}><ParentChildrenPage /></ProtectedRoute>}
                >
                  <Route
                    path=":studentId/grades"
                    element={<ChildGradesPage />}
                  />
                  <Route
                    path=":studentId/attendance"
                    element={<ChildAttendancePage />}
                  />
                </Route>
              </Route>

              {/* Catch-all for 404 */}
              <Route path="*" element={<h1 className="text-center py-20 text-3xl font-bold text-red-500">404 - Page Not Found</h1>} />
            </Routes>
          </main>
          <Footer />
        </div>
        {/* Render the Chatbot component outside the main content flow but within the Router and AuthProvider */}
        <Chatbot />
      </AuthProvider>
    </Router>
  );
}

export default App;