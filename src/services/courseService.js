import api from './api';
import { API } from '../constants/api';

const multipartConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

// Cursos
export async function getCourses(params) {
  const { data } = await api.get(API.COURSES.BASE, { params });
  return data;
}

export async function getCourseById(id) {
  const { data } = await api.get(API.COURSES.BY_ID(id));
  return data;
}

export async function createCourse(body) {
  const { data } = await api.post(API.COURSES.BASE, body);
  return data;
}

export async function updateCourse(id, body) {
  const { data } = await api.put(API.COURSES.BY_ID(id), body);
  return data;
}

export async function uploadCourseCover(id, file) {
  const fd = new FormData();
  fd.append('coverImage', file);
  const { data } = await api.put(API.COURSES.BY_ID(id), fd, multipartConfig);
  return data;
}

export async function deleteCourse(id) {
  await api.delete(API.COURSES.BY_ID(id));
}

// Modulos
export async function getModules(courseId) {
  const { data } = await api.get(API.COURSES.MODULES(courseId));
  return data;
}

export async function getModuleById(courseId, moduleId) {
  const { data } = await api.get(API.COURSES.MODULE_BY_ID(courseId, moduleId));
  return data;
}

export async function createModule(courseId, body) {
  const { data } = await api.post(API.COURSES.MODULES(courseId), body);
  return data;
}

export async function updateModule(courseId, moduleId, body) {
  const { data } = await api.put(API.COURSES.MODULE_BY_ID(courseId, moduleId), body);
  return data;
}

export async function uploadModuleCover(courseId, moduleId, file) {
  const fd = new FormData();
  fd.append('coverImage', file);
  const { data } = await api.put(API.COURSES.MODULE_BY_ID(courseId, moduleId), fd, multipartConfig);
  return data;
}

export async function deleteModule(courseId, moduleId) {
  await api.delete(API.COURSES.MODULE_BY_ID(courseId, moduleId));
}

// Aulas
export async function getLessons(courseId, moduleId) {
  const { data } = await api.get(API.COURSES.LESSONS(courseId, moduleId));
  return data;
}

export async function getLessonById(courseId, moduleId, lessonId) {
  const { data } = await api.get(API.COURSES.LESSON_BY_ID(courseId, moduleId, lessonId));
  return data;
}

export async function createLesson(courseId, moduleId, body) {
  const { data } = await api.post(API.COURSES.LESSONS(courseId, moduleId), body);
  return data;
}

export async function updateLesson(courseId, moduleId, lessonId, body) {
  const { data } = await api.put(API.COURSES.LESSON_BY_ID(courseId, moduleId, lessonId), body);
  return data;
}

export async function uploadLessonVideo(courseId, moduleId, lessonId, file) {
  const fd = new FormData();
  fd.append('video', file);
  const { data } = await api.put(API.COURSES.LESSON_BY_ID(courseId, moduleId, lessonId), fd, multipartConfig);
  return data;
}

export async function deleteLesson(courseId, moduleId, lessonId) {
  await api.delete(API.COURSES.LESSON_BY_ID(courseId, moduleId, lessonId));
}

export async function getVideoStatus(lessonId) {
  const { data } = await api.get(API.COURSES.VIDEO_STATUS(lessonId));
  return data;
}

// Comentarios
export async function getComments(lessonId) {
  const { data } = await api.get(API.COURSES.COMMENTS(lessonId));
  return data;
}

export async function createComment(lessonId, body) {
  const { data } = await api.post(API.COURSES.COMMENTS(lessonId), body);
  return data;
}

export async function replyComment(commentId, body) {
  const { data } = await api.post(API.COURSES.COMMENT_REPLIES(commentId), body);
  return data;
}

export async function updateComment(commentId, body) {
  const { data } = await api.put(API.COURSES.COMMENT_BY_ID(commentId), body);
  return data;
}

export async function deleteComment(commentId) {
  await api.delete(API.COURSES.COMMENT_BY_ID(commentId));
}

export async function getPendingComments(params) {
  const { data } = await api.get(API.COURSES.COMMENTS_PENDING, { params });
  return data;
}

export async function moderateComment(commentId, body) {
  const { data } = await api.patch(API.COURSES.COMMENT_MODERATE(commentId), body);
  return data;
}

// Progresso
export async function markLessonComplete(lessonId) {
  const { data } = await api.post(API.COURSES.LESSON_COMPLETE(lessonId));
  return data;
}

export async function unmarkLessonComplete(lessonId) {
  await api.delete(API.COURSES.LESSON_COMPLETE(lessonId));
}

export async function getCourseProgress(courseId) {
  const { data } = await api.get(API.COURSES.COURSE_PROGRESS(courseId));
  return data;
}
