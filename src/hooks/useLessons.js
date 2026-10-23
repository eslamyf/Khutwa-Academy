import { useState, useEffect } from 'react';
import { COURSES_LESSONS } from '../data/lessons.js';

/**
 * useLessons(courseId)
 * Hook to retrieve course lessons and details.
 * Abstracted so that in the future, the local data source can be replaced
 * with an API request in this single file without changing any UI components.
 */
export function useLessons(courseId = 'frontend') {
  const [data, setData] = useState({
    course: null,
    lessons: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    // Simulate async resolution to match future API behavior
    const targetCourse = COURSES_LESSONS[courseId] || COURSES_LESSONS['frontend'] || null;

    if (!targetCourse) {
      if (isMounted) {
        setData({
          course: null,
          lessons: [],
          loading: false,
          error: 'المسار التدريبي غير موجود'
        });
      }
      return;
    }

    if (isMounted) {
      setData({
        course: {
          id: targetCourse.id,
          title: targetCourse.title,
          instructor: targetCourse.instructor,
          instructorRole: targetCourse.instructorRole,
          price: targetCourse.price
        },
        lessons: targetCourse.lessons || [],
        loading: false,
        error: null
      });
    }

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  return data;
}

export default useLessons;
