import type { Server as IOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var tbIo: IOServer | undefined;
  // eslint-disable-next-line no-var
  var io: IOServer | undefined;
}

export function setIo(io: IOServer) {
  globalThis.tbIo = io;
  globalThis.io = io;
}

export function getIo(): IOServer | undefined {
  return globalThis.tbIo || globalThis.io;
}
