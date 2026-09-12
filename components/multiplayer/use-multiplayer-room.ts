"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  MultiplayerError,
  MultiplayerGameKey,
  MultiplayerRoomAction,
  MultiplayerRoomSnapshot,
  PublicPlayerIdentity,
  RoomChatMessage,
  ServerToClientEvents,
} from "@/lib/multiplayer/contracts";
import type { SafeAccount } from "@/lib/auth/contracts";

const DEVICE_KEY = "aventura-vida.multiplayer-device.v1";
const defaultIdentity: PublicPlayerIdentity = { id: "", nickname: "Luz viajera", avatar: "✦" };

function readIdentity(): PublicPlayerIdentity {
  try {
    const stored = window.localStorage.getItem(DEVICE_KEY);
    if (stored) {
      const candidate = JSON.parse(stored) as Partial<PublicPlayerIdentity>;
      if (typeof candidate.id === "string" && /^[a-zA-Z0-9_-]{12,80}$/.test(candidate.id) && typeof candidate.nickname === "string" && typeof candidate.avatar === "string") return { id: candidate.id, nickname: candidate.nickname.slice(0, 20), avatar: candidate.avatar.slice(0, 8) };
    }
    const identity = { id: `device_${crypto.randomUUID().replaceAll("-", "")}`, nickname: `Luz${Math.floor(100 + Math.random() * 900)}`, avatar: "✦" };
    window.localStorage.setItem(DEVICE_KEY, JSON.stringify(identity));
    return identity;
  } catch { return { id: `device_${Date.now()}${Math.floor(Math.random() * 99999)}`, nickname: "Luz viajera", avatar: "✦" }; }
}

type MultiplayerConnection = "connecting" | "connected" | "offline";

export function useMultiplayerRoom(gameKey: MultiplayerGameKey) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const roomRef = useRef<MultiplayerRoomSnapshot | null>(null);
  const identityRef = useRef<PublicPlayerIdentity>(defaultIdentity);
  const [identity, setIdentity] = useState<PublicPlayerIdentity>(defaultIdentity);
  const [room, setRoom] = useState<MultiplayerRoomSnapshot | null>(null);
  const [connection, setConnection] = useState<MultiplayerConnection>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);

  useEffect(() => { roomRef.current = room; }, [room]);

  useEffect(() => {
    const nextIdentity = readIdentity();
    identityRef.current = nextIdentity;
    setIdentity(nextIdentity);
    void fetch("/api/auth/me").then((response) => response.ok ? response.json() as Promise<{ account: SafeAccount | null }> : null).then((result) => {
      if (!result?.account) return;
      const accountIdentity = { id: `user_${result.account.id}`, nickname: result.account.nickname, avatar: result.account.avatarKey };
      identityRef.current = accountIdentity;
      setIdentity(accountIdentity);
    }).catch(() => undefined);
    const serverUrl = process.env.NEXT_PUBLIC_MULTIPLAYER_SERVER_URL ?? "http://localhost:3001";
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, { transports: ["websocket", "polling"], reconnectionAttempts: 4, timeout: 5_000, withCredentials: true });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnection("connected");
      setError(null);
      const previousRoom = roomRef.current;
      if (previousRoom) socket.emit("room:join", { code: previousRoom.code, player: identityRef.current }, (response) => {
        if (response.room) setRoom(response.room);
        if (response.error) setError(response.error.message);
      });
    });
    socket.on("disconnect", () => setConnection("offline"));
    socket.on("connect_error", () => setConnection("offline"));
    socket.on("room:state", (nextRoom) => setRoom(nextRoom));
    socket.on("room:error", (nextError) => setError(nextError.message));
    socket.on("room:chat", (message) => setChatMessages((current) => current.some((item) => item.id === message.id) ? current : [...current.slice(-49), message]));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  const request = useCallback((event: "room:create" | "room:join" | "room:leave" | "room:start" | "room:action", payload: Parameters<ClientToServerEvents[typeof event]>[0]) => {
    const socket = socketRef.current;
    if (!socket?.connected) { setError("El servidor de salas no está conectado. Inicia el servicio multijugador o revisa su URL."); return; }
    // Socket.IO conserva los contratos de cada evento; la sobrecarga se unifica aquí para la interfaz infantil.
    (socket.emit as (name: string, data: unknown, callback: (response: { room?: MultiplayerRoomSnapshot; error?: MultiplayerError }) => void) => void)(event, payload, (response) => {
      if (response.room) { setRoom(response.room); setError(null); }
      if (response.error) setError(response.error.message);
    });
  }, []);

  const createRoom = useCallback((maxPlayers: number) => request("room:create", { gameKey, maxPlayers, player: identityRef.current }), [gameKey, request]);
  const joinRoom = useCallback((code: string) => request("room:join", { code: code.trim().toUpperCase(), player: identityRef.current }), [request]);
  const leaveRoom = useCallback(() => { if (roomRef.current) request("room:leave", { code: roomRef.current.code }); }, [request]);
  const startRoom = useCallback(() => { if (roomRef.current) request("room:start", { code: roomRef.current.code }); }, [request]);
  const sendAction = useCallback((action: MultiplayerRoomAction) => { if (roomRef.current?.status === "PLAYING") request("room:action", { code: roomRef.current.code, action }); }, [request]);
  const sendPositiveMessage = useCallback((presetKey: "great_job" | "keep_going" | "good_game" | "you_can_do_it" | "bless_you") => {
    const socket = socketRef.current;
    const activeRoom = roomRef.current;
    if (!socket?.connected || !activeRoom) { setError("Primero entra a una sala."); return; }
    socket.emit("room:chat", { code: activeRoom.code, presetKey }, (response) => {
      if (response.error) setError(response.error.message);
      else setError(null);
    });
  }, []);

  return { identity, room, connection, error, chatMessages, createRoom, joinRoom, leaveRoom, startRoom, sendAction, sendPositiveMessage };
}
