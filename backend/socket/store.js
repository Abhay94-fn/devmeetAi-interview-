/**
 * Shared socket store.
 * Holds the Socket.IO server instance so any module can emit events
 * without creating a circular dependency back to server.js.
 *
 * Usage:
 *   // In server.js after creating io:
 *   import { setIO } from './socket/store.js';
 *   setIO(io);
 *
 *   // Anywhere else (e.g. controllers):
 *   import { getIO } from './socket/store.js';
 *   getIO()?.to(room).emit('event', data);
 */

let _io = null;

export const setIO = (io) => {
  _io = io;
};

export const getIO = () => _io;
