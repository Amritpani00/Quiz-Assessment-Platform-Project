import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import JoinSession from './pages/JoinSession';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateQuiz from './pages/CreateQuiz';
import QuizSession from './pages/QuizSession';
import ParticipantQuiz from './pages/ParticipantQuiz';
import ScoreReport from './pages/ScoreReport';

function App() {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  const ProtectedInstructorRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated || role !== 'INSTRUCTOR') {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const ProtectedParticipantRoute = ({ children }: { children: React.ReactNode }) => {
    // Also allow instructors to view report for demonstration or manual grading
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<JoinSession />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Instructor Routes */}
          <Route path="/instructor" element={
            <ProtectedInstructorRoute>
              <InstructorDashboard />
            </ProtectedInstructorRoute>
          } />
          <Route path="/instructor/create-quiz" element={
            <ProtectedInstructorRoute>
              <CreateQuiz />
            </ProtectedInstructorRoute>
          } />
          <Route path="/instructor/session/:sessionId" element={
            <ProtectedInstructorRoute>
              <QuizSession />
            </ProtectedInstructorRoute>
          } />

          {/* Participant Routes */}
          <Route path="/quiz/:sessionId" element={
            <ProtectedParticipantRoute>
              <ParticipantQuiz />
            </ProtectedParticipantRoute>
          } />
          <Route path="/report/:attemptId" element={
            <ProtectedParticipantRoute>
              <ScoreReport />
            </ProtectedParticipantRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
