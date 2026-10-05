/* MONTAGEVIDEO: Native Bedienung behalten; automatische Wiedergabe respektiert Präferenzen.
   Verhalten in config.js. Kein Download bei aktiviertem Datensparen. */
export function initVideo(runtime) {
  const { config } = runtime;
  const video = document.querySelector('.manual-book video');
  if (!video) return;
  video.controls = true;
  video.muted = true;
  video.playsInline = true;
  video.poster = config.assets.manualBookPoster;
  runtime.media().add(config.media.motionAllowed, () => {
    if (navigator.connection?.saveData) return;
    video.controls = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        video.currentTime = 0;
        video.play().catch(() => {
          video.controls = true;
        });
      },
      { threshold: config.video.visibilityThreshold },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
      video.controls = true;
    };
  });
}
