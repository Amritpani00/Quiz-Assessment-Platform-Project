import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import api from '../api/axios';

export default function ParticipantQuiz() {
  const { sessionId } = useParams(); // actually the join code in our routing
  const navigate = useNavigate();
  const { attemptId, quizId } = useSelector((state: RootState) => state.auth);

  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!quizId) return;
      try {
        const response = await api.get(`/quizzes/${quizId}/participant`);
        setQuizData(response.data);
        setTimeLeft(response.data.timeLimitMins * 60);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerChange = (questionId: number, optionId?: number, textAnswer?: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, selectedOptionId: optionId, textAnswer },
    }));
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    try {
      for (const key in answers) {
        await api.post(`/attempts/${attemptId}/answers`, answers[key]);
      }
      await api.post(`/attempts/${attemptId}/submit`);
      navigate(`/report/${attemptId}`);
    } catch (err) {
      alert("Submission failed or time expired.");
    }
  };

  if (!quizData) return <div className="p-10 text-center font-bold text-gray-600 animate-pulse">Loading Quiz...</div>;

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-6 border border-gray-100">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <h1 className="text-2xl font-bold">{quizData.title}</h1>
          <div className="flex items-center space-x-2 bg-indigo-700 px-4 py-2 rounded-lg font-mono text-lg font-bold shadow-inner">
            <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{Math.floor((timeLeft || 0) / 60)}:{String((timeLeft || 0) % 60).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-4 text-sm font-semibold text-indigo-500 tracking-wider uppercase">Question {currentQuestionIndex + 1} of {quizData.questions.length}</div>
          <h2 className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">{currentQuestion.text}</h2>

          <div className="space-y-4">
            {currentQuestion.type === 'MCQ' ? (
              currentQuestion.options.map((opt: any) => (
                <label key={opt.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${answers[currentQuestion.id]?.selectedOptionId === opt.id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'hover:bg-gray-50 border-gray-200'}`}>
                  <input
                    type="radio"
                    name={`q-${currentQuestion.id}`}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    checked={answers[currentQuestion.id]?.selectedOptionId === opt.id}
                    onChange={() => handleAnswerChange(currentQuestion.id, opt.id)}
                  />
                  <span className="ml-4 text-gray-700">{opt.text}</span>
                </label>
              ))
            ) : (
              <textarea
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm min-h-[150px]"
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id]?.textAnswer || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, undefined, e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-100">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Previous
          </button>
          {currentQuestionIndex < quizData.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(quizData.questions.length - 1, prev + 1))}
              className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition"
            >
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="px-8 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 shadow-md transition">
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
