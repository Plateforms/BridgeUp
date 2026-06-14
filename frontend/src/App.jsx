import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InternshipList from './pages/InternshipList';
import InternshipDetail from './pages/InternshipDetail';
import InternshipCreate from './pages/InternshipCreate';
import ApplicationList from './pages/ApplicationList';
import InterviewList from './pages/InterviewList';
import CompanyList from './pages/CompanyList';
import CompanyProfile from './pages/CompanyProfile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/internships" element={<ProtectedRoute><InternshipList /></ProtectedRoute>} />
              <Route path="/internships/create" element={<ProtectedRoute roles={['company','admin']}><InternshipCreate /></ProtectedRoute>} />
              <Route path="/internships/:id" element={<ProtectedRoute><InternshipDetail /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><ApplicationList /></ProtectedRoute>} />
              <Route path="/interviews" element={<ProtectedRoute><InterviewList /></ProtectedRoute>} />
              <Route path="/companies" element={<ProtectedRoute><CompanyList /></ProtectedRoute>} />
              <Route path="/companies/:id" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
