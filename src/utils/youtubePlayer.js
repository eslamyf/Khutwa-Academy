/**
 * YouTube IFrame API Singleton Loader & URL Parser
 */

let apiPromise = null;

/**
 * Loads YouTube IFrame API script once across the entire application lifecycle.
 * Returns a Promise that resolves to the window.YT object.
 */
export function loadYouTubeIframeAPI() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));

  // If already loaded and ready
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  // Return existing singleton promise if already loading
  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise((resolve, reject) => {
    // If the script tag is already in DOM
    const existingScript = document.getElementById('youtube-iframe-api-singleton');

    // Setup global callback handler
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevCallback === 'function') {
        try {
          prevCallback();
        } catch {
          /* ignore error */
        }

      }
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
      } else {
        reject(new Error('YouTube API loaded but YT.Player is unavailable'));
      }
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api-singleton';
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = (err) => {
        apiPromise = null;
        reject(new Error('فشل تحميل مشغل يوتيوب. يرجى التحقق من اتصال الإنترنت.'));
      };
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    }

    // Safety timeout after 10 seconds
    setTimeout(() => {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
      } else if (!window.YT) {
        apiPromise = null;
        reject(new Error('انتهت مهلة تحميل مشغل يوتيوب. يرجى إعادة المحاولة.'));
      }
    }, 10000);
  });

  return apiPromise;
}

/**
 * Parses and validates YouTube video ID from any format:
 * - Direct 11-char ID (e.g., 'edBBbWSdfAg')
 * - Standard URL (e.g., 'https://www.youtube.com/watch?v=edBBbWSdfAg&t=10s')
 * - Short URL (e.g., 'https://youtu.be/edBBbWSdfAg')
 * - Embed URL (e.g., 'https://www.youtube.com/embed/edBBbWSdfAg')
 * - Shorts URL (e.g., 'https://www.youtube.com/shorts/edBBbWSdfAg')
 */
export function parseYouTubeVideoId(input) {
  if (!input) {
    return { valid: false, videoId: '', error: 'لا يوجد رابط أو معرّف فيديو' };
  }

  const str = String(input).trim();

  // Known fallback replacement for placeholder demo id if any
  if (str.includes('R6Ygwllc_a8')) {
    return { valid: true, videoId: 'X1ulCwyhCVM' };
  }

  // Check if raw 11 characters
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return { valid: true, videoId: str };
  }

  // Extract from full URLs
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = str.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return { valid: true, videoId: match[1] };
  }

  return {
    valid: false,
    videoId: '',
    error: 'معرّف الفيديو غير صالح (يجب أن يتكون من 11 رمزاً صحيحاً)'
  };
}

/**
 * Maps YouTube error code to friendly Arabic message
 */
export function getYouTubeErrorMessage(errorCode) {
  switch (errorCode) {
    case 2:
      return 'معرّف الفيديو غير صالح أو يحتوي على رموز غير صحيحة.';
    case 5:
      return 'حدث خطأ في تقنية المشغل أو تشغيل الفيديو عبر متصفحك.';
    case 100:
      return 'هذا الفيديو غير متاح حالياً أو تم حذفه أو ضبطه كخاص.';
    case 101:
    case 150:
      return 'مالك هذا الفيديو يمنع تشغيله وتضمينه خارج منصة يوتيوب.';
    default:
      return 'حدث خطأ أثناء تحميل الفيديو. تأكد من اتصال الإنترنت ثم اضغط إعادة المحاولة.';
  }
}
