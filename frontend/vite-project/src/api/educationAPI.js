import api from './api.js';

export const educationAPI = {
  getQuizzes: () => api.get('/education/quizzes'),
  getQuiz: (id) => api.get(`/education/quizzes/${id}`),
  submitQuiz: (id, answers) => api.post(`/education/quizzes/${id}/submit`, { answers }),
  getUserQuizHistory: () => api.get('/education/user/quiz-history'),
};