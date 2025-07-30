let timer: NodeJS.Timeout | null = null;
let seconds = 0;

self.onmessage = (e: MessageEvent) => {
  const { type, value } = e.data;

  switch (type) {
    case 'start':
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        seconds--;
        self.postMessage({ type: 'tick', value: seconds });
        if (seconds === 0 && timer) {
            clearInterval(timer)
            timer = null
        }
      }, 1000);
      break;
    case 'pause':
      if (timer) clearInterval(timer);
      timer = null;
      break;
    case 'reset':
      if (timer) clearInterval(timer);
      timer = null;
      seconds = value;
      self.postMessage({ type: 'tick', value: seconds });
      break;
    case 'set':
        seconds = value;
        break;
  }
};

export {};
