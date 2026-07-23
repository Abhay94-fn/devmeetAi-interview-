import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CandidateDashboard from './pages/candidate/DashboardPage';
import InterviewSetupPage from './pages/candidate/InterviewSetupPage';
import InterviewRoomPage from './pages/candidate/InterviewRoomPage';
import ReportPage from './pages/candidate/ReportPage';
import QuestionBankPage from './pages/candidate/QuestionBankPage';
import ProfilePage from './pages/candidate/ProfilePage';
import LeaderboardPage from './pages/candidate/LeaderboardPage';
import InterviewerDashboard from './pages/interviewer/DashboardPage';
import SchedulePage from './pages/interviewer/SchedulePage';
import LiveRoomPage from './pages/interviewer/LiveRoomPage';
import EvaluatePage from './pages/interviewer/EvaluatePage';
import CandidatesPage from './pages/interviewer/CandidatesPage';
import QuestionManagerPage from './pages/interviewer/QuestionManagerPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      {/* Candidate */}
      <Route path="/dashboard" element={<ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>} />
      <Route path="/interview/setup" element={<ProtectedRoute role="candidate"><InterviewSetupPage /></ProtectedRoute>} />
      <Route path="/interview/:sessionId" element={<ProtectedRoute role="candidate"><InterviewRoomPage /></ProtectedRoute>} />
      <Route path="/report/:sessionId" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/questions" element={<ProtectedRoute><QuestionBankPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="candidate"><ProfilePage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      {/* Interviewer */}
      <Route path="/interviewer/dashboard" element={<ProtectedRoute role="interviewer"><InterviewerDashboard /></ProtectedRoute>} />
      <Route path="/interviewer/schedule" element={<ProtectedRoute role="interviewer"><SchedulePage /></ProtectedRoute>} />
      <Route path="/interviewer/room/:sessionId" element={<ProtectedRoute role="interviewer"><LiveRoomPage /></ProtectedRoute>} />
      <Route path="/interviewer/evaluate/:sessionId" element={<ProtectedRoute role="interviewer"><EvaluatePage /></ProtectedRoute>} />
      <Route path="/interviewer/candidates" element={<ProtectedRoute role="interviewer"><CandidatesPage /></ProtectedRoute>} />
      <Route path="/interviewer/questions" element={<ProtectedRoute role="interviewer"><QuestionManagerPage /></ProtectedRoute>} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
