let timer: NodeJS.Timeout | null = null;
let seconds = 0;
let mode = 'pomodoro';

const saveState = () => {
  self.postMessage({ type: 'saveState', value: { seconds, mode } });
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
      seconds = value.seconds;
      mode = value.mode;
      self.postMessage({ type: 'tick', value: seconds });
      break;
  }
};

export {};
