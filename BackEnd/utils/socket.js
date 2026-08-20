// Shared Socket.io instance - set once, used everywhere
let io = null;

export const setIO = (socketIO) => {
  io = socketIO;
};

export const getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized yet');
    return null;
  }
  return io;
};

// Helper: emit to all connected clients
export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Helper: emit to a specific user by their userId
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
};

// Helper: emit to admin/role-based rooms
export const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};
