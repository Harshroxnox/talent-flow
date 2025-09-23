// --- Utils ---

export const randomDelay = () => {
  return new Promise(res => setTimeout(res, 200 + Math.random() * 1000));
}

export const maybeFail = () => {
  return
  // 5–10% error rate
  if (Math.random() < 0.1) {
    throw new Error('Simulated network error');
  }
}