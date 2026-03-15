import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { setCredentials } from '../store/authSlice';

export default function JoinSession() {
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/sessions/join', { joinCode: joinCode.toUpperCase(), displayName });
      dispatch(setCredentials(response.data));
      // Store session info locally for the participant
      localStorage.setItem('currentSessionCode', joinCode.toUpperCase());

      // Need to find session id to redirect
      // For simplicity, we can fetch session details or pass it in response.
      // Let's modify the flow slightly or just go to a loading screen.
      // Assuming join doesn't return sessionId directly in the current backend, let's just go to /quiz/joinCode
      navigate(`/quiz/${joinCode.toUpperCase()}`);
    } catch (err) {
      setError('Invalid join code or session is closed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Quiz Platform</h1>
        <p className="text-center text-gray-500 mb-8">Join a live quiz session</p>

        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Join Code</label>
            <input
              type="text"
              placeholder="e.g. A1B2C3"
              className="w-full px-4 py-3 mt-1 font-mono text-center uppercase border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-3 text-white font-bold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out">
            Join Quiz
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Instructor Login
          </Link>
        </div>
      </div>
    </div>
  );
}
