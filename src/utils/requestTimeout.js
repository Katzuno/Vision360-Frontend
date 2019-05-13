import { delayCallback, cancelDelayedCallback } from './delayCallback';

export const requestTimeout = (callback, delay) =>
  delayCallback(delay, callback);

export const clearRequestedTimeout = cancelDelayedCallback;
