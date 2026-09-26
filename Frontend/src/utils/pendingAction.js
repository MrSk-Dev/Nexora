const KEY = 'nexora_pending_action';

export const savePendingAction = (action) => {
  sessionStorage.setItem(KEY, JSON.stringify(action));
};

export const getPendingAction = () => {
  const raw = sessionStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearPendingAction = () => {
  sessionStorage.removeItem(KEY);
};