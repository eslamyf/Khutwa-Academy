import React, { useState, useRef } from 'react';

// Subtitle segments synced with the video
const CAPTIONS = [
  { start: 0, end: 3.5, text: 'أهلاً بك في أكاديمية خطوة — رفيقك للانطلاق في سوق العمل' },
  { start: 3.5, end: 7.5, text: 'معاك خطوة بخطوة لحد ما توصل للقمة، بتطبيق عملي حقيقي' },
  { start: 7.5, end: 11.5, text: 'معسكرات متخصصة في تطوير الويب وتصميم UX/UI والتسويق الرقمي' },
  { start: 11.5, end: 16.0, text: 'إشراف وتوجيه فردي أسبوعي 1-on-1 ومراجعة لمشاريعك أولاً بأول' },
  { start: 16.0, end: 21.0, text: 'تبني بورتفوليو قوي يؤهلك للعمل الحر والوظائف بثقة تامة' },
  { start: 21.0, end: 35.0, text: 'ابدأ خطوتك الآن نحو المستقبل مع أكاديمية خطوة!' }
];

export function HeroSection() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration || 0);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch(() => {
        videoRef.current.muted = true;
        setIsMuted(true);
        videoRef.current.play();
        setIsPlaying(true);
        setHasStarted(true);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const currentCaption = CAPTIONS.find((c) => currentTime >= c.start && currentTime <= c.end)?.text;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="hero">
      {/* 1. Right Zone: Powerful Headline & CTA */}
      <div className="hero-text-col">
        <h1 className="hero-title">
          <span className="l l-brand"><span>أكاديمية خطوة —</span></span>
          <span className="l l-main"><span>معاك خطوة بخطوة لحد ما توصل للقمة</span></span>
          <span className="l l-sub"><span>من غير وعود وهمية بخطوات حقيقية</span></span>
        </h1>
        <div className="hero-cta-wrap">
          <a className="btn hero-cta-btn" href="#j">شوف المسارات</a>
        </div>
      </div>

      {/* 2. Center Zone: Interactive Training Stairs */}
      <div className="hero-stairs-col">
        <div className="stairs-wrapper">
          <div className="stairs" aria-hidden="true">
            <i style={{ '--n': 1 }}></i><i style={{ '--n': 2 }}></i><i style={{ '--n': 3 }}></i>
            <i style={{ '--n': 4 }}></i><i style={{ '--n': 5 }}></i><i style={{ '--n': 6 }}></i>
            <img className="hop logo-d" src="assets/icon-cyan.png" alt="أكاديمية خطوة" width="54" height="47" fetchPriority="high" />
            <img className="hop logo-l" src="assets/icon-color.png" alt="أكاديمية خطوة" width="54" height="47" fetchPriority="high" />
          </div>
        </div>
      </div>

      {/* 3. Left Zone: Enlarged Smartphone Frame & Video */}
      <div className="hero-phone-col">
        <div className="hero-phone-mockup">
          <div className="hero-phone-glow" aria-hidden="true" />
          <div className="hero-phone-case">
            <div className="hero-phone-island">
              <span className="hero-phone-lens" />
              <span className="hero-phone-sensor" />
            </div>

            <div className="hero-phone-screen">
              <video
                ref={videoRef}
                className="hero-phone-video"
                src="media/khutwa-academy-promo.mp4"
                preload="metadata"
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
              >
                <track
                  src="media/khutwa-promo-subtitles.vtt"
                  kind="subtitles"
                  srcLang="ar"
                  label="العربية"
                  default
                />
              </video>

              {(!isPlaying || !hasStarted) && (
                <div className="hero-phone-poster" onClick={togglePlay}>
                  <div className="hero-phone-play-btn" title="شاهد الفيديو بالصوت">
                    <i className="fa-solid fa-play"></i>
                  </div>
                  <span className="hero-phone-play-label">شاهد فيديو خطوة</span>
                </div>
              )}

              {showCaptions && currentCaption && isPlaying && (
                <div className="hero-phone-caption">
                  <p>{currentCaption}</p>
                </div>
              )}

              <div className="hero-phone-controls">
                <div className="hero-phone-scrubber">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progressPercent}
                    onChange={handleSeek}
                    className="hero-phone-slider"
                    aria-label="مؤشر وقت الفيديو"
                  />
                  <div className="hero-phone-slider-fill" style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="hero-phone-btns-row">
                  <button
                    type="button"
                    className="hero-phone-btn"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
                  >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                  </button>

                  <button
                    type="button"
                    className="hero-phone-btn"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                  >
                    <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
                  </button>

                  <button
                    type="button"
                    className={`hero-phone-btn ${showCaptions ? 'active-cc' : ''}`}
                    onClick={() => setShowCaptions(!showCaptions)}
                    aria-label="الترجمة"
                  >
                    CC
                  </button>

                  <span className="hero-phone-time">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Glowing Flow Connector linking Phone to Stairs */}
      <div className="hero-flow-connector" aria-hidden="true">
        <svg viewBox="0 0 520 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="flow-svg">
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2bb9d3" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#2bb9d3" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#5ce1e6" stopOpacity="1" />
            </linearGradient>
            <filter id="flowGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Smooth curved flow line from phone (left) into first step of stairs, then ascending toward summit */}
          <path
            d="M 45 155 C 130 155, 175 130, 240 100 S 375 60, 460 22"
            className="flow-path-base"
          />
          <path
            d="M 45 155 C 130 155, 175 130, 240 100 S 375 60, 460 22"
            className="flow-path-animated"
            filter="url(#flowGlow)"
          />
          {/* Elegant arrowhead directed upwards at the summit */}
          <polygon
            points="465,14 445,28 454,34"
            className="flow-arrow-head"
            filter="url(#flowGlow)"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
