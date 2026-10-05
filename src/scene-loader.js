/* SZENEN-START: Die optionale 3D-Szene erst sichtbar und auf geeigneten Geräten laden. */
export function initScene(runtime) {
  const canvas = document.getElementById('hero-scene');
  if (!canvas || navigator.connection?.saveData) return;
  runtime
    .media()
    .add(
      {
        desktop: runtime.config.media.desktop,
        reduced: runtime.config.media.reducedMotion,
      },
      (context) => {
        if (!context.conditions.desktop || context.conditions.reduced) return;
        let active = true;
        let dispose;
        const visibility = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return;
          visibility.disconnect();
          import('./scene.js')
            .then(({ startHeroScene }) => {
              if (active) dispose = startHeroScene(runtime);
            })
            .catch(() => {});
        });
        visibility.observe(canvas);
        return () => {
          active = false;
          visibility.disconnect();
          dispose?.();
        };
      },
    );
}
