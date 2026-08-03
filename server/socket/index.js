const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

let io = null;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        const decoded = jwt.verify(token, config.jwtAccessSecret);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userType = decoded.type;
      }
      // Allow anonymous (non-authenticated) connections too — they can still join match rooms
      next();
    } catch (error) {
      // Invalid token — allow connection but without userId
      logger.warn(`Socket auth failed: ${error.message}`);
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}${socket.userId ? ` (user: ${socket.userId})` : ''}`);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on('join-match', (matchId) => {
      if (matchId) {
        socket.join(`match:${matchId}`);
        logger.debug(`Socket ${socket.id} joined match:${matchId}`);
      }
    });

    socket.on('leave-match', (matchId) => {
      if (matchId) {
        socket.leave(`match:${matchId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
}

function emitMatchUpdate(matchId, eventType, data) {
  if (!io) return;
  io.to(`match:${matchId}`).emit(`match:${eventType}`, {
    matchId,
    ...data,
    timestamp: new Date().toISOString()
  });
}

function emitScoreUpdate(matchId, homeScore, awayScore, minute) {
  if (!io) return;
  io.to(`match:${matchId}`).emit('match:score', {
    matchId,
    homeScore,
    awayScore,
    minute,
    timestamp: new Date().toISOString()
  });
}

function sendUserNotification(userId, notification) {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification', notification);
}

function emitGamificationEvent(userId, event) {
  if (!io) return;
  io.to(`user:${userId}`).emit('gamification', event);
}

module.exports = {
  initializeSocket,
  getIO,
  emitMatchUpdate,
  emitScoreUpdate,
  sendUserNotification,
  emitGamificationEvent
};
