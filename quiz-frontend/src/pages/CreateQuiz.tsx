import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [questions, setQuestions] = useState<any[]>([]);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, { text: '', type: 'MCQ', points: 10, options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }]);
  };

  const updateQuestion = (index: number, key: string, value: any) => {
    const updated = [...questions];
    updated[index][key] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: '', isCorrect: false });
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, key: string, value: any) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex][key] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: quiz } = await api.post('/quizzes', { title, description, timeLimitMins: timeLimit });
      for (let i = 0; i < questions.length; i++) {
        await api.post(`/quizzes/${quiz.id}/questions`, { ...questions[i], position: i + 1 });
      }
      navigate('/instructor');
    } catch (err) {
      alert("Failed to create quiz");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title</label>
          <input className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea className="w-full border p-2 rounded" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Time Limit (mins)</label>
          <input type="number" className="w-full border p-2 rounded" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} required />
        </div>

        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Questions</h2>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Question {qIndex + 1}</span>
            </div>
            <input className="w-full border p-2 rounded mb-2" placeholder="Question Text" value={q.text} onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} required />
            <div className="flex gap-4 mb-4">
              <select className="border p-2 rounded flex-1" value={q.type} onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}>
                <option value="MCQ">Multiple Choice</option>
                <option value="SHORT">Short Answer</option>
              </select>
              <input type="number" className="border p-2 rounded w-24" placeholder="Points" value={q.points} onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))} required />
            </div>

            {q.type === 'MCQ' && (
              <div className="pl-4 border-l-2 border-indigo-200">
                <h4 className="font-bold text-sm mb-2 text-gray-600">Options (Check the correct one)</h4>
                {q.options.map((opt: any, oIndex: number) => (
                  <div key={oIndex} className="flex items-center gap-2 mb-2">
                    <input type="checkbox" checked={opt.isCorrect} onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)} className="w-5 h-5" />
                    <input className="flex-1 border p-2 rounded" placeholder={`Option ${oIndex + 1}`} value={opt.text} onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)} required />
                  </div>
                ))}
                <button type="button" onClick={() => addOption(qIndex)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2">+ Add Option</button>
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={addQuestion} className="w-full border-2 border-dashed border-gray-300 py-3 rounded-lg text-gray-600 font-bold hover:bg-gray-50 mb-6">+ Add Question</button>

        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Save Quiz</button>
      </form>
    </div>
  );
}
