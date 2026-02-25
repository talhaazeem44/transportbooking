"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";

interface Notification {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  vehiclePreference: string;
  pickupAt: string;
  pickupAddress?: string;
  destinationAddress?: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server (same origin as the app)
    const socketUrl = window.location.origin;
    console.log("[Notifications] Connecting to Socket.IO at:", socketUrl);
    
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      path: "/socket.io",
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Notifications] ✅ Connected to Socket.IO server. Socket ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("[Notifications] ❌ Connection error:", error);
    });

    socket.on("reservation:new", (data: Notification) => {
      console.log("[Notifications] 🔔 New reservation received:", data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show browser notification if permitted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`New Reservation: ${data.name}`, {
          body: `${data.serviceType} - ${data.vehiclePreference}`,
          icon: "/favicon.ico",
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("[Notifications] ⚠️ Disconnected from server. Reason:", reason);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("[Notifications] ✅ Reconnected after", attemptNumber, "attempts");
    });

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("[Notifications] Notification permission:", permission);
      });
    }

    return () => {
      console.log("[Notifications] Cleaning up socket connection");
      socket.disconnect();
    };
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen === false) {
      markAllAsRead();
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleToggle}
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          color: "#e5e7eb",
          cursor: "pointer",
          padding: "0.5rem",
          borderRadius: 6,
          fontSize: 20,
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "0.5rem",
              background: "#020617",
              border: "1px solid #1f2937",
              borderRadius: 8,
              width: 400,
              maxHeight: 500,
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          >
            <div
              style={{
                padding: "1rem",
                borderBottom: "1px solid #1f2937",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    setNotifications([]);
                    setUnreadCount(0);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
            <div>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: 14,
                  }}
                >
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/admin/reservations`}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: "block",
                      padding: "1rem",
                      borderBottom: "1px solid #1f2937",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#1f2937";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      New Reservation: {notif.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                      {notif.serviceType} · {notif.vehiclePreference}
                    </div>
                    {notif.pickupAddress && (
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
                        📍 {notif.pickupAddress}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
