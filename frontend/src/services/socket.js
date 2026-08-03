import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialize socket connection with auth token.
 * Call this after user logs in.
 */
export function connectSocket(token) {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
}

/**
 * Disconnect socket.
 * Call this when user logs out.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get current socket instance.
 */
export function getSocket() {
  return socket;
}

/**
 * Join a match room to receive live score updates.
 */
export function joinMatchRoom(matchId) {
  if (socket?.connected) {
    socket.emit('join-match', matchId);
  }
}

/**
 * Leave a match room.
 */
export function leaveMatchRoom(matchId) {
  if (socket?.connected) {
    socket.emit('leave-match', matchId);
  }
}

/**
 * Listen for score updates on a match.
 * Returns an unsubscribe function.
 */
export function onScoreUpdate(matchId, callback) {
  if (!socket) return () => {};

  const handler = (data) => {
    if (data.matchId === matchId) {
      callback(data);
    }
  };

  socket.on('match:score', handler);
  return () => socket.off('match:score', handler);
}

/**
 * Listen for match events.
 * Returns an unsubscribe function.
 */
export function onMatchEvent(matchId, callback) {
  if (!socket) return () => {};

  const handler = (data) => {
    if (data.matchId === matchId) {
      callback(data);
    }
  };

  socket.on('match:event', handler);
  return () => socket.off('match:event', handler);
}

/**
 * Listen for match status changes.
 * Returns an unsubscribe function.
 */
export function onMatchStatusChange(matchId, callback) {
  if (!socket) return () => {};

  const handler = (data) => {
    if (data.matchId === matchId) {
      callback(data);
    }
  };

  socket.on('match:status', handler);
  return () => socket.off('match:status', handler);
}

/**
 * Listen for notifications.
 * Returns an unsubscribe function.
 */
export function onNotification(callback) {
  if (!socket) return () => {};

  socket.on('notification', callback);
  return () => socket.off('notification', callback);
}

/**
 * Listen for gamification events (points, badges, level-ups).
 * Returns an unsubscribe function.
 */
export function onGamificationEvent(callback) {
  if (!socket) return () => {};

  socket.on('gamification', callback);
  return () => socket.off('gamification', callback);
}

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinMatchRoom,
  leaveMatchRoom,
  onScoreUpdate,
  onMatchEvent,
  onMatchStatusChange,
  onNotification,
  onGamificationEvent
};
