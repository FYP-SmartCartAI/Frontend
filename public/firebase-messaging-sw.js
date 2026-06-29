//public/firebase-messaging-sw.js
/* eslint-disable no-undef */

importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyD46eTFPIlPcIO5HtTkQIwMKOLcPeb3HyA",
  authDomain: "inzaar-backend-22082.firebaseapp.com",
  projectId: "inzaar-backend-22082",
  storageBucket: "inzaar-backend-22082.firebasestorage.app",
  messagingSenderId: "616913079346",
  appId: "1:616913079346:web:bb1a3b6aec21ff8674c02b",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    // icon: '/firebase-logo.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});