import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Careers from './pages/Careers';
import Roadmaps from './pages/Roadmaps';
import Courses from './pages/Courses';
import PdfAssistant from './pages/PdfAssistant';
import AiTutor from './pages/AiTutor';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-brand-dark text-white">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/careers" element={<ProtectedRoute><Careers /></ProtectedRoute>} />
              <Route path="/roadmaps" element={<ProtectedRoute><Roadmaps /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
              <Route path="/pdf-assistant" element={<ProtectedRoute><PdfAssistant /></ProtectedRoute>} />
              <Route path="/ai-tutor" element={<ProtectedRoute><AiTutor /></ProtectedRoute>} />
              <Route path="/resume-analyzer" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            </Routes>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(15,15,25,0.9)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                },
              }}
            />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
