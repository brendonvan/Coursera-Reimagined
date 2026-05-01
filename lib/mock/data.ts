import { Course, TranscriptChunk } from '@/types';

export const mockCourse: Course = {
  id: 'course-1',
  title: 'Introduction to Machine Learning',
  lessons: [
    { id: 'lesson-1', title: '1. What is Machine Learning?', duration: '10:24' },
    { id: 'lesson-2', title: '2. Supervised Learning', duration: '15:30' },
    { id: 'lesson-3', title: '3. Unsupervised Learning', duration: '12:15' },
    { id: 'lesson-4', title: '4. Neural Networks Intro', duration: '18:45' },
  ],
};

export const mockTranscriptChunks: TranscriptChunk[] = [
  // --- Lesson 1 ---
  {
    id: 'chunk-1-1',
    courseId: 'course-1',
    lessonId: 'lesson-1',
    source: 'video',
    startTime: '00:00:00',
    endTime: '00:01:30',
    text: 'Welcome to this introduction to machine learning. In this lesson, we will cover the fundamental concepts that form the basis of modern AI systems.',
  },
  {
    id: 'chunk-1-2',
    courseId: 'course-1',
    lessonId: 'lesson-1',
    source: 'video',
    startTime: '00:01:30',
    endTime: '00:03:00',
    text: 'Machine learning is a subset of artificial intelligence that allows systems to learn and improve from experience without being explicitly programmed.',
  },
  {
    id: 'chunk-1-3',
    courseId: 'course-1',
    lessonId: 'lesson-1',
    source: 'video',
    startTime: '00:03:00',
    endTime: '00:05:00',
    text: 'There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning. We will explore each in detail throughout the course.',
  },
  {
    id: 'chunk-1-4',
    courseId: 'course-1',
    lessonId: 'lesson-1',
    source: 'video',
    startTime: '00:05:00',
    endTime: '00:07:30',
    text: 'Applications of machine learning are everywhere: recommendation systems, image recognition, natural language processing, fraud detection, and autonomous vehicles.',
  },
  {
    id: 'chunk-1-5',
    courseId: 'course-1',
    lessonId: 'lesson-1',
    source: 'video',
    startTime: '00:07:30',
    endTime: '00:10:24',
    text: 'By the end of this course, you will understand core ML algorithms and be able to apply them to real-world problems using Python and popular libraries like scikit-learn.',
  },

  // --- Lesson 2 ---
  {
    id: 'chunk-2-1',
    courseId: 'course-1',
    lessonId: 'lesson-2',
    source: 'video',
    startTime: '00:00:00',
    endTime: '00:02:30',
    text: 'Supervised learning is the most common type of machine learning. The algorithm learns from labeled training data to make predictions on new, unseen examples.',
  },
  {
    id: 'chunk-2-2',
    courseId: 'course-1',
    lessonId: 'lesson-2',
    source: 'video',
    startTime: '00:02:30',
    endTime: '00:06:00',
    text: 'Common supervised learning algorithms include linear regression for continuous outputs, and logistic regression and decision trees for classification tasks.',
  },
  {
    id: 'chunk-2-3',
    courseId: 'course-1',
    lessonId: 'lesson-2',
    source: 'video',
    startTime: '00:06:00',
    endTime: '00:10:00',
    text: 'Overfitting is a major challenge in supervised learning. Regularization techniques like L1 (Lasso) and L2 (Ridge) help prevent the model from memorizing the training data.',
  },
  {
    id: 'chunk-2-4',
    courseId: 'course-1',
    lessonId: 'lesson-2',
    source: 'video',
    startTime: '00:10:00',
    endTime: '00:15:30',
    text: 'Model evaluation uses metrics like accuracy, precision, recall, and F1 score for classification. For regression we use MSE, RMSE, and R-squared.',
  },
];
