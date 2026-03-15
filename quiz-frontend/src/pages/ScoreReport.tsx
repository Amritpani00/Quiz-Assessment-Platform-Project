import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function ScoreReport() {
  const { attemptId } = useParams();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', attemptId],
    queryFn: async () => {
      const res = await api.get(`/attempts/${attemptId}/report`);
      return res.data;
    },
  });

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/attempts/${attemptId}/report/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `score_report_${attemptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to download PDF', error);
      alert('Failed to download PDF');
    }
  };

  if (isLoading) return <div className="text-center p-10 font-bold text-gray-500 animate-pulse">Loading Report...</div>;
  if (isError) return <div className="text-center p-10 text-red-500">Failed to load report. Make sure attempt ID is correct.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">{report.quizTitle}</h1>
            <p className="text-blue-100 font-medium tracking-wide">Participant: <span className="text-white font-bold">{report.participantName}</span></p>
          </div>
          <div className="text-center bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30 shadow-inner">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-100 mb-1">Total Score</p>
            <p className="text-4xl font-black drop-shadow-md">{report.totalScore}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              Detailed Breakdown
            </h2>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 shadow-md font-medium transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download PDF Report
            </button>
          </div>

          <div className="space-y-6">
            {report.questions.map((q: any, i: number) => (
              <div key={i} className="bg-gray-50 border border-gray-200 p-6 rounded-xl hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-800 max-w-[80%]"><span className="text-indigo-500 mr-2">{i + 1}.</span> {q.text}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${q.pointsAwarded > 0 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {q.pointsAwarded} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white p-4 rounded-lg border border-gray-100">
                  <div className="p-3 bg-red-50/50 rounded border border-red-100/50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      Your Answer
                    </p>
                    <p className={`font-medium ${q.pointsAwarded > 0 ? 'text-green-600' : 'text-red-600'}`}>{q.participantAnswer}</p>
                  </div>
                  <div className="p-3 bg-green-50/50 rounded border border-green-100/50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Correct Answer
                    </p>
                    <p className="font-medium text-gray-800">{q.correctAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
