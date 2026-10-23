import { useState, useEffect, useRef, useCallback } from 'react';

// Safe localStorage utilities with "khutwa:" prefix
function safeGetItem(key, defaultValue) {
  try {
    const raw = localStorage.getItem(`khutwa:${key}`);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[useProgress] Failed to read "khutwa:${key}" from storage:`, err);
    return defaultValue;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(`khutwa:${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`[useProgress] Failed to save "khutwa:${key}" to storage:`, err);
  }
}

/**
 * useProgress(courseId)
 * Manages user progress, completed lessons, last active lesson, and debounced notes.
 */
export function useProgress(courseId = 'frontend') {
  const cid = courseId || 'frontend';

  // 1. Completed Lessons
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    const saved = safeGetItem(`progress:${cid}:done`, []);
    return Array.isArray(saved) ? saved : [];
  });

  // 2. Last active lesson ID
  const [lastLessonId, setLastLessonIdState] = useState(() => {
    return safeGetItem(`progress:${cid}:last`, '');
  });

  // 3. Notes dictionary in memory for fast access { [lessonId]: noteText }
  const [notes, setNotes] = useState(() => {
    const saved = safeGetItem(`notes:${cid}`, {});
    return (saved && typeof saved === 'object') ? saved : {};
  });

  // Debounce timers reference
  const debounceTimersRef = useRef({});

  // Sync state when courseId changes
  useEffect(() => {
    const savedDone = safeGetItem(`progress:${cid}:done`, []);
    setCompletedLessonIds(Array.isArray(savedDone) ? savedDone : []);

    const savedLast = safeGetItem(`progress:${cid}:last`, '');
    setLastLessonIdState(savedLast || '');

    const savedNotes = safeGetItem(`notes:${cid}`, {});
    setNotes((savedNotes && typeof savedNotes === 'object') ? savedNotes : {});
  }, [cid]);

  // Set last viewed lesson
  const setLastLesson = useCallback((lessonId) => {
    if (!lessonId) return;
    setLastLessonIdState(lessonId);
    safeSetItem(`progress:${cid}:last`, lessonId);
  }, [cid]);

  // Mark lesson as completed
  const markCompleted = useCallback((lessonId) => {
    if (!lessonId) return;
    setCompletedLessonIds((prev) => {
      if (prev.includes(lessonId)) return prev;
      const next = [...prev, lessonId];
      safeSetItem(`progress:${cid}:done`, next);
      return next;
    });
  }, [cid]);

  // Toggle completion of lesson
  const toggleCompleted = useCallback((lessonId) => {
    if (!lessonId) return;
    setCompletedLessonIds((prev) => {
      const exists = prev.includes(lessonId);
      const next = exists ? prev.filter((id) => id !== lessonId) : [...prev, lessonId];
      safeSetItem(`progress:${cid}:done`, next);
      return next;
    });
  }, [cid]);

  const isCompleted = useCallback((lessonId) => {
    return completedLessonIds.includes(lessonId);
  }, [completedLessonIds]);

  // Get note for specific lesson
  const getNote = useCallback((lessonId) => {
    if (!lessonId) return '';
    return notes[lessonId] || '';
  }, [notes]);

  // Save note with 500ms debounce
  const saveNote = useCallback((lessonId, noteText) => {
    if (!lessonId) return;

    // Immediate state update for smooth input response
    setNotes((prev) => {
      const updated = { ...prev, [lessonId]: noteText };

      // Debounce saving to localStorage (~500ms)
      if (debounceTimersRef.current[lessonId]) {
        clearTimeout(debounceTimersRef.current[lessonId]);
      }

      debounceTimersRef.current[lessonId] = setTimeout(() => {
        safeSetItem(`notes:${cid}`, updated);
        delete debounceTimersRef.current[lessonId];
      }, 500);

      return updated;
    });
  }, [cid]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const calculateProgressPercent = useCallback((totalLessonsCount) => {
    if (!totalLessonsCount || totalLessonsCount <= 0) return 0;
    const completedCount = completedLessonIds.length;
    return Math.min(100, Math.round((completedCount / totalLessonsCount) * 100));
  }, [completedLessonIds]);

  return {
    completedLessonIds,
    lastLessonId,
    setLastLesson,
    markCompleted,
    toggleCompleted,
    isCompleted,
    getNote,
    saveNote,
    calculateProgressPercent
  };
}

export default useProgress;
