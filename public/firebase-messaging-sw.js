/* eslint-disable no-undef */

importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: 'AIzaSyD46eTFPIlPcIO5HtTkQIwMKOLcPeb3HyA',
  authDomain: 'inzaar-backend-22082.firebaseapp.com',
  projectId: 'inzaar-backend-22082',
  storageBucket: 'inzaar-backend-22082.firebasestorage.app',
  messagingSenderId: '616913079346',
  appId: '1:616913079346:web:bb1a3b6aec21ff8674c02b',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

function getPayloadContent(payload) {
  return {
    title: payload.notification?.title || payload.data?.title || 'SmartCart',
    body: payload.notification?.body || payload.data?.body || '',
    data: payload.data || {},
  }
}

async function displayNotification(payload) {
  const { title, body, data } = getPayloadContent(payload)

  try {
    await self.registration.showNotification(title, {
      body,
      tag: data.notificationId || data.type || 'smartcart-push',
      renotify: true,
      data,
    })
  } catch (err) {
    console.error('[FCM SW] showNotification failed:', err)
  }
}

messaging.onBackgroundMessage((payload) => displayNotification(payload))

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) {
        return windowClients[0].focus()
      }
      return clients.openWindow('/')
    }),
  )
})
