import { delayCallback, cancelDelayedCallback } from './delayCallback';

export const requestInterval = (callback, delay) =>
  delayCallback(delay, callback, true);

export const clearRequestedInterval = cancelDelayedCallback;
