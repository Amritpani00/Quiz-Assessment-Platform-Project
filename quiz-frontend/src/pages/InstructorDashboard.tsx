import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimitMins: number;
  status: string;
}

export default function InstructorDashboard() {
  const navigate = useNavigate();

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const response = await api.get('/quizzes');
      return response.data as Quiz[];
    },
  });

  const startSession = async (quizId: number) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/session/start`);
      // response.data contains joinCode and sessionId
      navigate(`/instructor/session/${response.data.id}`);
    } catch (err) {
      alert("Failed to start session");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1>
        <Link to="/instructor/create-quiz" className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow">
          + Create New Quiz
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Loading quizzes...</div>
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{quiz.title}</h2>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${quiz.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {quiz.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 h-12 overflow-hidden">{quiz.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {quiz.timeLimitMins} mins
                </div>

                <button
                  onClick={() => startSession(quiz.id)}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium shadow-sm transition"
                >
                  Start Live Session
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">You haven't created any quizzes yet.</p>
          <Link to="/instructor/create-quiz" className="text-indigo-600 font-medium hover:underline">
            Create your first quiz
          </Link>
        </div>
      )}
    </div>
  );
}
