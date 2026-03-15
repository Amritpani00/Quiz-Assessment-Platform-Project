import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../api/axios';

export default function QuizSession() {
  const { sessionId } = useParams();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    // Fetch initial leaderboard
    api.get(`/sessions/${sessionId}/leaderboard`).then(res => setLeaderboard(res.data));

    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/session.${sessionId}.leaderboard`, (message) => {
          if (message.body) {
            setLeaderboard(JSON.parse(message.body));
          }
        });
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [sessionId]);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Live Session Leaderboard</h1>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-600 text-white font-bold">
              <th className="p-4 border-b border-indigo-700">Rank</th>
              <th className="p-4 border-b border-indigo-700">Participant</th>
              <th className="p-4 border-b border-indigo-700 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
                <td className="p-4 font-bold text-gray-500">{index + 1}</td>
                <td className="p-4 font-medium text-gray-800">{entry.participantName}</td>
                <td className="p-4 text-right font-bold text-indigo-600">{entry.score}</td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500 italic">No participants have submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
