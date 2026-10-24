import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useKhutwa, useLessons, useProgress } from '../../hooks';
import { loadYouTubeIframeAPI, parseYouTubeVideoId, getYouTubeErrorMessage } from '../../utils';
import '../../styles/watch.css';

// Helper for Arabic digits formatting
function toArabicDigits(num) {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}

export function WatchView({ cid = 'frontend', lid }) {
  const { user, getEnrollment, setDialogContent, setPend } = useKhutwa();
  const { course, lessons, loading: lessonsLoading, error: lessonsError } = useLessons(cid);
  const {
    completedLessonIds,
    lastLessonId,
    setLastLesson,
    markCompleted,
    toggleCompleted,
    isCompleted,
    getNote,
    saveNote,
    calculateProgressPercent
  } = useProgress(cid);

  // Active tab state: 'overview' | 'notes' | 'resources'
  const [activeTab, setActiveTab] = useState('overview');

  // Autoplay next toggle (persisted locally)
  const [autoPlayNext, setAutoPlayNext] = useState(() => {
    try {
      const saved = localStorage.getItem('khutwa:autoplay_next');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Player state
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(true);

  // Active lesson resolution
  const activeIndex = useMemo(() => {
    if (!lessons || lessons.length === 0) return 0;
    if (!lid) {
      if (lastLessonId) {
        const found = lessons.findIndex((l) => l.id === lastLessonId);
        if (found !== -1) return found;
      }
      return 0;
    }
    const idx = lessons.findIndex((l) => l.id === lid);
    return idx !== -1 ? idx : 0;
  }, [lessons, lid, lastLessonId]);

  const currentLesson = lessons && lessons.length > 0 ? lessons[activeIndex] : null;

  // Access rights check
  const enrollment = getEnrollment(user, cid);
  const isAdmin = user && user.role === 'admin';
  const isEnrolled = !!enrollment || isAdmin;
  const isLessonAccessible = currentLesson ? (currentLesson.isFree || isEnrolled) : false;

  // Redirect if lid in URL is invalid or missing
  useEffect(() => {
    if (lessons && lessons.length > 0) {
      const matched = lessons.find((l) => l.id === lid);
      if (!matched) {
        const targetId = lastLessonId && lessons.some((l) => l.id === lastLessonId)
          ? lastLessonId
          : lessons[0].id;
        window.location.hash = `#/watch/${cid}/${targetId}`;
      }
    }
  }, [cid, lid, lessons, lastLessonId]);

  // Update last accessed lesson
  useEffect(() => {
    if (currentLesson && currentLesson.id) {
      setLastLesson(currentLesson.id);
    }
  }, [currentLesson, setLastLesson]);

  // Smooth scroll up to player when lesson changes
  const scrollToPlayer = useCallback(() => {
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToLesson = useCallback((lessonId) => {
    if (!lessonId) return;
    setPlayerError(null);
    window.location.hash = `#/watch/${cid}/${lessonId}`;
    scrollToPlayer();
  }, [cid, scrollToPlayer]);

  // Toggle autoplay state
  const handleToggleAutoPlay = () => {
    setAutoPlayNext((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('khutwa:autoplay_next', JSON.stringify(next));
      } catch {
        /* ignore local storage error */
      }

      return next;
    });
  };

  // Video ended handler
  const handleVideoEnded = useCallback(() => {
    if (!currentLesson) return;
    markCompleted(currentLesson.id);

    if (autoPlayNext && activeIndex < lessons.length - 1) {
      const nextLesson = lessons[activeIndex + 1];
      goToLesson(nextLesson.id);
    }
  }, [currentLesson, activeIndex, lessons, autoPlayNext, markCompleted, goToLesson]);

  // Initialize YouTube Player API singleton
  useEffect(() => {
    let isCancelled = false;

    loadYouTubeIframeAPI()
      .then((YT) => {
        if (isCancelled) return;
        setPlayerReady(true);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('[WatchView] YouTube API Load Error:', err);
        setPlayerError('فشل تحميل مشغل الفيديو. تحقق من اتصال الإنترنت.');
        setPlayerLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Setup and update YouTube Player instance
  useEffect(() => {
    if (!playerReady || !currentLesson || !window.YT) return;

    // If lesson is locked, do not load or play video
    if (!isLessonAccessible) {
      if (playerRef.current && playerRef.current.stopVideo) {
        playerRef.current.stopVideo();
      }
      setPlayerLoading(false);
      return;
    }

    const { valid, videoId, error: parseError } = parseYouTubeVideoId(currentLesson.videoId);

    if (!valid || !videoId) {
      setPlayerError(parseError || 'معرّف الفيديو غير متوفر لهذا الدرس.');
      setPlayerLoading(false);
      return;
    }

    setPlayerError(null);
    setPlayerLoading(true);

    // If player already initialized, reuse it via loadVideoById
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
        setPlayerLoading(false);
      } catch (err) {
        console.warn('[WatchView] Error loading video in existing player:', err);
      }
      return;
    }

    // Otherwise create the single player instance
    try {
      playerRef.current = new window.YT.Player('youtube-player-element', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            setPlayerLoading(false);
          },
          onStateChange: (event) => {
            // YT.PlayerState.ENDED is 0
            if (event.data === 0) {
              handleVideoEnded();
            }
          },
          onError: (event) => {
            const msg = getYouTubeErrorMessage(event.data);
            setPlayerError(msg);
            setPlayerLoading(false);
          }
        }
      });
    } catch (err) {
      console.error('[WatchView] Failed to instantiate YT.Player:', err);
      setPlayerError('حدث خطأ أثناء تهيئة مشغل الفيديو.');
      setPlayerLoading(false);
    }
  }, [playerReady, currentLesson, isLessonAccessible, handleVideoEnded]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          /* ignore player destroy error */
        }

        playerRef.current = null;
      }
    };
  }, []);

  // Keyboard navigation shortcuts (← Next, → Prev, D Done)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when focused in text fields
      if (/TEXTAREA|INPUT|SELECT/i.test(e.target.tagName)) return;

      if (e.key === 'ArrowLeft') {
        // In Arabic RTL, left arrow points forward (Next)
        if (activeIndex < lessons.length - 1) {
          goToLesson(lessons[activeIndex + 1].id);
        }
      } else if (e.key === 'ArrowRight') {
        // In Arabic RTL, right arrow points backward (Prev)
        if (activeIndex > 0) {
          goToLesson(lessons[activeIndex - 1].id);
        }
      } else if (e.key.toLowerCase() === 'd') {
        if (currentLesson) {
          toggleCompleted(currentLesson.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, lessons, currentLesson, goToLesson, toggleCompleted]);

  // Retry video playback
  const handleRetryVideo = () => {
    setPlayerError(null);
    setPlayerLoading(true);
    if (currentLesson && playerRef.current && playerRef.current.loadVideoById) {
      const { valid, videoId } = parseYouTubeVideoId(currentLesson.videoId);
      if (valid) {
        playerRef.current.loadVideoById(videoId);
      }
    }
  };

  // Subscription / Payment dialog trigger
  const handleOpenSubscribe = () => {
    if (!user) {
      setPend(cid);
      window.location.hash = '#/auth/register';
      return;
    }
    setDialogContent({
      type: 'vodafone_insta_pay',
      course: course || { id: cid, title: 'المسار التدريبي' }
    });
  };

  // Progress metrics
  const totalCount = lessons ? lessons.length : 0;
  const progressPercent = calculateProgressPercent(totalCount);
  const doneCount = completedLessonIds.length;
  const isDone = currentLesson ? isCompleted(currentLesson.id) : false;

  // Note management
  const noteContent = currentLesson ? getNote(currentLesson.id) : '';
  const handleNoteChange = (e) => {
    if (currentLesson) {
      saveNote(currentLesson.id, e.target.value);
    }
  };

  if (lessonsLoading) {
    return (
      <div className="watch-page-container" style={{ display: 'grid', placeContent: 'center', minHeight: '80vh' }}>
        <div className="video-loading-spinner" style={{ width: 44, height: 44, margin: '0 auto 16px' }} />
        <p style={{ fontWeight: 700, color: 'var(--cyan)' }}>جاري تجهيز محتوى المسار التدريبي...</p>
      </div>
    );
  }

  if (lessonsError || !course) {
    return (
      <div className="watch-page-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>المسار التدريبي غير متاح</h2>
        <p style={{ color: 'var(--cyt)', margin: '14px 0 24px' }}>لم يتم العثور على محتوى هذا المسار حالياً.</p>
        <a href="#j" className="watch-cta-btn">العودة لكل المسارات</a>
      </div>
    );
  }

  return (
    <div className="watch-page-container">
      {/* 1. Sticky Header */}
      <header className="watch-header">
        <a className="watch-back-link" href={`#/course/${course.id}`}>
          <i className="fa-solid fa-arrow-right"></i>
          <span>رجوع للكورس</span>
        </a>

        <span className="watch-course-title">
          {course.title} · {course.instructor}
        </span>

        {/* Circular SVG Progress Ring */}
        <div className="watch-progress-ring">
          <svg width="30" height="30" viewBox="0 0 36 36" aria-hidden="true">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="var(--line)"
              strokeWidth="3.5"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="94.2"
              strokeDashoffset={94.2 * (1 - progressPercent / 100)}
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <span>{toArabicDigits(progressPercent)}٪</span>
        </div>
      </header>

      {/* 2. Main Two-Column Layout */}
      <main className="watch-wrap">
        {/* Left Column: Player, Controls, Tabs */}
        <section>
          {/* Stage Area with 16:9 Player & Offset Cyan Backing Frame */}
          <div className="watch-stage" ref={playerContainerRef}>
            <div className="watch-vid-container">
              {/* YouTube Element Mount Target */}
              <div id="youtube-player-element" className="watch-player-slot" />

              {/* Locked Lesson Overlay */}
              {!isLessonAccessible && (
                <div className="watch-ov on">
                  <div className="watch-ov-icon"><i className="fa-solid fa-lock"></i></div>
                  <b>الدرس ده ضمن الاشتراك</b>
                  <span>اشترك مرة واحدة وافتح كل المحطات مع إشراف وتطبيق عملي كل أسبوع.</span>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
                    <button className="watch-cta-btn" onClick={handleOpenSubscribe}>
                      ابدأ الرحلة · {toArabicDigits(course.price)} ج.م
                    </button>
                    {lessons.length > 0 && lessons[0].isFree && (
                      <button
                        className="watch-ghost-btn"
                        style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                        onClick={() => goToLesson(lessons[0].id)}
                      >
                        ارجع للدرس المجاني
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {isLessonAccessible && playerError && (
                <div className="watch-ov on">
                  <div className="watch-ov-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
                  <b>تعذر تحميل الفيديو</b>
                  <span>{playerError}</span>
                  <button className="watch-cta-btn" onClick={handleRetryVideo}>
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {/* Loading Overlay */}
              {isLessonAccessible && !playerError && playerLoading && (
                <div className="watch-ov on" style={{ background: 'rgba(5, 22, 63, 0.95)' }}>
                  <div className="video-loading-spinner" />
                  <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>جاري تشغيل الدرس...</span>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Title & Details */}
          <div className="watch-info-bar">
            <h1>
              {toArabicDigits(activeIndex + 1)}. {currentLesson ? currentLesson.title : ''}
            </h1>
          </div>

          {/* Chips Row */}
          <div className="watch-chips-row">
            <span className="watch-chip">
              <i className="fa-regular fa-clock" style={{ marginInlineEnd: '4px' }}></i> {toArabicDigits(currentLesson?.duration || 0)} دقيقة
            </span>
            <span className="watch-chip">
              المحطة {toArabicDigits(activeIndex + 1)} من {toArabicDigits(totalCount)}
            </span>
            {currentLesson?.isFree && (
              <span className="watch-chip-free">مجاني</span>
            )}
          </div>

          {/* Action Buttons & Autoplay Switch */}
          <div className="watch-actions-row">
            <button
              className={`watch-cta-btn ${isDone ? 'ok' : ''}`}
              onClick={() => currentLesson && toggleCompleted(currentLesson.id)}
            >
              <i className={isDone ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle-check'}></i>
              <span>{isDone ? 'تم إنهاء الدرس' : 'خلصت الدرس'}</span>
            </button>

            {activeIndex > 0 && (
              <button
                className="watch-ghost-btn"
                onClick={() => goToLesson(lessons[activeIndex - 1].id)}
              >
                <i className="fa-solid fa-chevron-right" style={{ marginInlineEnd: '4px' }}></i> السابق
              </button>
            )}

            {activeIndex < totalCount - 1 && (
              <button
                className="watch-ghost-btn"
                onClick={() => goToLesson(lessons[activeIndex + 1].id)}
              >
                التالي <i className="fa-solid fa-chevron-left" style={{ marginInlineStart: '4px' }}></i>
              </button>
            )}

            <label className="watch-autoplay-switch" title="تشغيل الدرس التالي تلقائياً عند انتهاء الفيديو">
              <input
                type="checkbox"
                checked={autoPlayNext}
                onChange={handleToggleAutoPlay}
              />
              <span>تشغيل التالي تلقائياً</span>
            </label>
          </div>

          {/* Tabs Navigation */}
          <div className="watch-tabs-nav" role="tablist">
            <button
              className={`watch-tab-btn ${activeTab === 'overview' ? 'on' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              نظرة عامة
            </button>
            <button
              className={`watch-tab-btn ${activeTab === 'notes' ? 'on' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              ملاحظاتي
            </button>
            <button
              className={`watch-tab-btn ${activeTab === 'resources' ? 'on' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              ملفات الدرس
            </button>
          </div>

          {/* Tab 1: Overview Pane */}
          <div className={`watch-tab-pane ${activeTab === 'overview' ? 'on' : ''}`}>
            <h3>هتتعلم إيه في الدرس ده؟</h3>
            <p>{currentLesson?.description}</p>
            {currentLesson?.objectives && currentLesson.objectives.length > 0 && (
              <ul>
                {currentLesson.objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            )}
            <p className="watch-shortcuts-hint">
              اختصارات الكيبورد: <kbd>←</kbd> التالي · <kbd>→</kbd> السابق · <kbd>D</kbd> تحديد كمنتهي
            </p>
          </div>

          {/* Tab 2: Notes Pane */}
          <div className={`watch-tab-pane ${activeTab === 'notes' ? 'on' : ''}`}>
            <textarea
              value={noteContent}
              onChange={handleNoteChange}
              placeholder="اكتب ملاحظاتك على الدرس، بتتحفظ تلقائياً..."
              aria-label="ملاحظات الدرس"
            />
            <span className="watch-notes-status">
              <i className="fa-solid fa-cloud-arrow-up" style={{ marginInlineEnd: 4 }}></i>
              يتم حفظ ملاحظاتك تلقائياً على جهازك.
            </span>
          </div>

          {/* Tab 3: Resources Pane */}
          <div className={`watch-tab-pane ${activeTab === 'resources' ? 'on' : ''}`}>
            {currentLesson?.resources && currentLesson.resources.length > 0 ? (
              currentLesson.resources.map((res, idx) => (
                <div className="watch-resource-item" key={idx}>
                  <i className={res.type === 'pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-code'} style={{ color: 'var(--cyan)' }}></i>
                  <span>{res.name}</span>
                </div>
              ))
            ) : (
              <>
                <div className="watch-resource-item">
                  <i className="fa-solid fa-file-pdf" style={{ color: 'var(--cyan)' }}></i>
                  <span>ملف الدرس التوجيهي (PDF)</span>
                </div>
                <div className="watch-resource-item">
                  <i className="fa-solid fa-code" style={{ color: 'var(--cyan)' }}></i>
                  <span>الكود المصدري للتطبيقات والتمارين</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Right Column: Course Content Sidebar */}
        <aside className="watch-sidebar">
          <h2>محتوى الكورس</h2>

          {/* Linear Progress Bar */}
          <div className="watch-progress-bar">
            <i
              className="watch-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="watch-progress-label">
            خلصت {toArabicDigits(doneCount)} من {toArabicDigits(totalCount)} دروس
          </span>

          {/* Lessons Queue */}
          <ul className="watch-lessons-queue">
            {lessons.map((item, idx) => {
              const itemDone = isCompleted(item.id);
              const isCur = idx === activeIndex;
              const isLocked = !item.isFree && !isEnrolled;

              return (
                <li key={item.id}>
                  <button
                    className={`watch-lesson-btn ${isCur ? 'on' : ''} ${itemDone ? 'dn' : ''} ${isLocked ? 'lc' : ''}`}
                    onClick={() => goToLesson(item.id)}
                    title={item.title}
                  >
                    <span className="watch-lesson-num">
                      {itemDone ? <i className="fa-solid fa-check"></i> : toArabicDigits(idx + 1)}
                    </span>
                    <span className="watch-lesson-info">
                      <span className="watch-lesson-title">{item.title}</span>
                      <small className="watch-lesson-meta">
                        <i className="fa-regular fa-clock" style={{ fontSize: '10px' }}></i> {toArabicDigits(item.duration)} د {isLocked && <> · <i className="fa-solid fa-lock" style={{ fontSize: '10px' }}></i></>}
                      </small>
                    </span>
                    {item.isFree && (
                      <span className="watch-chip-free" style={{ fontSize: 11, padding: '1px 8px' }}>
                        مجاني
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </main>
    </div>
  );
}

export default WatchView;
