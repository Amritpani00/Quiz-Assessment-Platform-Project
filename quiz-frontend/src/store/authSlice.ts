import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  name: string | null;
  role: 'INSTRUCTOR' | 'PARTICIPANT' | null;
  isAuthenticated: boolean;
  attemptId?: number | null;
  quizId?: number | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  name: localStorage.getItem('name'),
  role: localStorage.getItem('role') as 'INSTRUCTOR' | 'PARTICIPANT' | null,
  isAuthenticated: !!localStorage.getItem('token'),
  attemptId: localStorage.getItem('attemptId') ? Number(localStorage.getItem('attemptId')) : null,
  quizId: localStorage.getItem('quizId') ? Number(localStorage.getItem('quizId')) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; name: string; role: 'INSTRUCTOR' | 'PARTICIPANT'; attemptId?: number; quizId?: number }>
    ) => {
      const { token, name, role, attemptId, quizId } = action.payload;
      state.token = token;
      state.name = name;
      state.role = role;
      state.isAuthenticated = true;
      state.attemptId = attemptId || null;
      state.quizId = quizId || null;
      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('role', role);
      if (attemptId) localStorage.setItem('attemptId', attemptId.toString());
      if (quizId) localStorage.setItem('quizId', quizId.toString());
    },
    logout: (state) => {
      state.token = null;
      state.name = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
      localStorage.removeItem('attemptId');
      localStorage.removeItem('quizId');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
