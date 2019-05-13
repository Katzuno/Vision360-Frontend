export const delayCallback = (delay, callback, loop = false) => {
  let start = performance.now();
  let handle;

  const _loop = loop
    ? () => {
        const timePassed = performance.now() - start;

        if (timePassed >= delay) {
          callback();
          start = performance.now();
        }

        handle = window.requestAnimationFrame(_loop);
      }
    : () => {
        const timePassed = performance.now() - start;

        if (timePassed >= delay) {
          callback();
        } else {
          handle = window.requestAnimationFrame(_loop);
        }
      };

  handle = window.requestAnimationFrame(_loop);

  return handle;
};

export const cancelDelayedCallback = handle =>
  window.cancelAnimationFrame(handle);
