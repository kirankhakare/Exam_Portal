// path: frontend/src/admin/api/examApi.js
import axios from "axios";

export const createExam = (payload) => axios.post("/api/admin/exams", payload);
export const getExams = () => axios.get("/api/admin/exams");
export const getExam = (id) => axios.get(`/api/admin/exams/${id}`);
export const updateExam = (id, payload) => axios.put(`/api/admin/exams/${id}`, payload);
export const deleteExam = (id) => axios.delete(`/api/admin/exams/${id}`);
