
let timer: NodeJS.Timeout | null = null;
let seconds = 0;
let mode: 'pomodoro' | 'shortBreak' | 'longBreak' = 'pomodoro';

const saveState = () => {
  const timestamp = timer ? Date.now() : null;
  self.postMessage({ type: 'saveState', value: { seconds, mode, timestamp } });
};

self.onmessage = (e: MessageEvent) => {
  const { type, value } = e.data;

  switch (type) {
    case 'start':
      if (timer) return;
      timer = setInterval(() => {
        if (seconds > 0) {
          seconds--;
          self.postMessage({ type: 'tick', value: seconds });
          if (seconds === 0) {
            if (timer) clearInterval(timer);
            timer = null;
            self.postMessage({ type: 'alarm', value: mode });
            saveState();
          }
        }
      }, 1000);
      saveState();
      break;

    case 'pause':
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      saveState();
      break;

    case 'reset':
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      seconds = value;
      self.postMessage({ type: 'tick', value: seconds });
      saveState();
      break;
    
    case 'setMode':
      mode = value;
      break;

    case 'setState':
        seconds = value.seconds;
        mode = value.mode;
        break;

    case 'set': 
        seconds = value;
        break;
  }
};

export {};
