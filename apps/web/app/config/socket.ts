"use client";
import { io } from "socket.io-client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://stackpilot-api-7w8q.onrender.com";

export const socket = io(API_BASE_URL, {
  autoConnect: false,
  transports: ["polling", "websocket"],
});
