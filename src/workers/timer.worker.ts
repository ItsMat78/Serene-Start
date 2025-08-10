let timer: NodeJS.Timeout | null = null;
let seconds = 0;
let mode = 'pomodoro';
let timestamp = 0;

const saveState = () => {
  timestamp = Date.now();
  self.postMessage({ type: 'saveState', value: { seconds, mode, timestamp } });
};

self.onmessage = (e: MessageEvent) => {
  const { type, value } = e.data;

  switch (type) {
    case 'start':
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        seconds--;
        self.postMessage({ type: 'tick', value: seconds });
        if (seconds <= 0) {
          if (timer) clearInterval(timer);
          timer = null;
          self.postMessage({ type: 'alarm', value: mode });
        }
        saveState();
      }, 1000);
      break;
    case 'pause':
      if (timer) clearInterval(timer);
      timer = null;
      saveState();
      break;
    case 'reset':
      if (timer) clearInterval(timer);
      timer = null;
      seconds = value;
      self.postMessage({ type: 'tick', value: seconds });
      saveState();
      break;
    case 'set':
      seconds = value;
      saveState();
      break;
    case 'setMode':
      mode = value;
      saveState();
      break;
    case 'restoreState':
      const { seconds: savedSeconds, mode: savedMode, timestamp: savedTimestamp } = value;
      seconds = savedSeconds;
      mode = savedMode;

      if (savedTimestamp && timer === null) {
        const elapsedSeconds = Math.round((Date.now() - savedTimestamp) / 1000);
        seconds = Math.max(0, seconds - elapsedSeconds);
      }

      self.postMessage({ type: 'tick', value: seconds });
      break;
  }
};

export {};
