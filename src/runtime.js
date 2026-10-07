/* GEMEINSAME LAUFZEIT: CSS-Werte lesen und Listener, Observer und Animationen aufräumen.
   Responsive Effekte erhalten einen eigenen Lebenszyklus bei Größen-/Präferenzwechseln. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from './config.js';
gsap.registerPlugin(ScrollTrigger);
function lifecycle(runtime) {
  const controller = new AbortController();
  const cleanups = [];
  const context = gsap.context(() => {});
  let disposed = false;
  runtime.cleanup = (callback) => cleanups.push(callback);
  runtime.listen = (target, event, handler, options = {}) => {
    target?.addEventListener(event, (event) => context.add(() => handler(event)), {
      ...(typeof options === 'boolean' ? { capture: options } : options),
      signal: controller.signal,
    });
  };
  runtime.media = () => {
    const media = gsap.matchMedia();
    runtime.cleanup(() => media.revert());
    return media;
  };
  runtime.observer = (observer, target) => {
    observer.observe(target);
    runtime.cleanup(() => observer.disconnect());
    return observer;
  };
  runtime.run = (initialize) => context.add(() => initialize(runtime));
  runtime.dispose = () => {
    if (disposed) return;
    disposed = true;
    controller.abort();
    context.revert();
    for (const cleanup of cleanups.reverse()) cleanup();
  };
  return runtime;
}
export function createRuntime() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const css = (name) => styles.getPropertyValue('--' + name).trim();
  const runtime = lifecycle({
    gsap,
    ScrollTrigger,
    config,
    lenis: null,
    motion: {
      value: css,
      number(name) {
        const value = parseFloat(css(name));
        return Number.isFinite(value) ? value : 0;
      },
      pixels(name) {
        const value = css(name);
        const number = parseFloat(value) || 0;
        return value.endsWith('rem') ? number * parseFloat(styles.fontSize) : number;
      },
    },
    header: document.querySelector('.site-header'),
    get reduceMotion() {
      return window.matchMedia(config.media.reducedMotion).matches;
    },
    get coarsePointer() {
      return window.matchMedia(config.media.coarsePointer).matches;
    },
    get smallScreen() {
      return window.matchMedia(config.media.mobile).matches;
    },
    get headerHeight() {
      return runtime.header?.offsetHeight || 0;
    },
    asset(path) {
      return new URL('../assets/' + path, import.meta.url).href;
    },
  });
  runtime.runResponsive = (initialize) =>
    runtime.media().add(
      {
        mobile: config.media.mobile,
        desktop: config.media.desktop,
        motion: config.media.motionAllowed,
      },
      (context) => {
        if (!context.conditions.motion) return;
        const scope = lifecycle(Object.create(runtime));
        Object.defineProperty(scope, 'lenis', {
          get: () => runtime.lenis,
          set: (value) => {
            runtime.lenis = value;
          },
        });
        try {
          scope.run(initialize);
        } catch (error) {
          scope.dispose();
          throw error;
        }
        return () => scope.dispose();
      },
    );
  runtime.listen(window, 'pagehide', (event) => {
    if (!event.persisted) runtime.dispose();
  });
  runtime.listen(window, 'pageshow', (event) => {
    if (event.persisted) ScrollTrigger.refresh();
  });
  return runtime;
}
