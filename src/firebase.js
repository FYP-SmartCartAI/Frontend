import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getToken as getAuthToken } from "./utils/tokenHelpers";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyD46eTFPIlPcIO5HtTkQIwMKOLcPeb3HyA",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "inzaar-backend-22082.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "inzaar-backend-22082",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "616913079346",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:616913079346:web:bb1a3b6aec21ff8674c02b",
};

const vapidKey =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  "BAB6J0xu0nOIrmCP93iZX2BfR4ijkmd9uoxgtz4C7mKpvpN_GHi6L8b5J5ATqiw-a-qTZPTwfW7edy8gYwCwT3k";
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const sendFcmTokenToBackend = async (fcmToken) => {
  const apiToken = getAuthToken();
  if (!apiToken) {
    if (fcmToken) {
      localStorage.setItem("fcm_pending", fcmToken);
    }
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send FCM token: ${response.statusText}`);
    }

    localStorage.removeItem("fcm_pending");
  } catch (err) {
    console.error("Error sending FCM token to backend", err);
  }
};

export const requestAndSaveToken = async (onTokenSaved) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const currentToken = await getToken(messaging, { vapidKey });
    if (!currentToken) return null;

    await sendFcmTokenToBackend(currentToken);

    if (onTokenSaved) onTokenSaved(currentToken);
    return currentToken;
  } catch (err) {
    console.error("Error getting or saving FCM token", err);
    return null;
  }
};

export const onMessageListener = (cb) => {
  return onMessage(messaging, (payload) => {
    cb(payload);
  });
};