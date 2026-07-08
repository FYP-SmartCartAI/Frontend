import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { getToken as getAuthToken } from './utils/tokenHelpers'
import { BACKEND_URL } from './config/api'

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyD46eTFPIlPcIO5HtTkQIwMKOLcPeb3HyA',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'inzaar-backend-22082.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'inzaar-backend-22082',
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || '616913079346',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:616913079346:web:bb1a3b6aec21ff8674c02b',
}

const vapidKey =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BAB6J0xu0nOIrmCP93iZX2BfR4ijkmd9uoxgtz4C7mKpvpN_GHi6L8b5J5ATqiw-a-qTZPTwfW7edy8gYwCwT3k'

const app = initializeApp(firebaseConfig)

let messagingInstance = null
let messagingInitPromise = null
let swRegistration = null
let foregroundListenerReady = false

async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance
  if (!messagingInitPromise) {
    messagingInitPromise = isSupported().then((supported) => {
      if (!supported) {
        console.warn('[FCM] Push messaging is not supported in this browser.')
        return null
      }
      messagingInstance = getMessaging(app)
      return messagingInstance
    })
  }
  return messagingInitPromise
}

async function registerFirebaseServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  if (swRegistration) return swRegistration

  swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/',
  })
  await navigator.serviceWorker.ready
  return swRegistration
}

function getPayloadContent(payload) {
  return {
    title: payload.notification?.title || payload.data?.title || 'SmartCart',
    body: payload.notification?.body || payload.data?.body || '',
    data: payload.data || {},
  }
}

export async function showPushNotification(payload) {
  const { title, body, data } = getPayloadContent(payload)
  if (Notification.permission !== 'granted') return false

  try {
    const registration = swRegistration || (await navigator.serviceWorker.ready)
    await registration.showNotification(title, {
      body,
      tag: data.notificationId || data.type || 'smartcart-push',
      renotify: true,
      data,
    })
    return true
  } catch (err) {
    console.error('[FCM] showNotification failed:', err)
    return false
  }
}

export const sendFcmTokenToBackend = async (fcmToken) => {
  const apiToken = getAuthToken()
  if (!apiToken) {
    if (fcmToken) localStorage.setItem('fcm_pending', fcmToken)
    return
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send FCM token: ${response.statusText}`)
    }

    localStorage.removeItem('fcm_pending')
  } catch (err) {
    console.error('Error sending FCM token to backend', err)
  }
}

const flushPendingFcmToken = async () => {
  const pending = localStorage.getItem('fcm_pending')
  if (pending) await sendFcmTokenToBackend(pending)
}

async function ensureForegroundListener() {
  if (foregroundListenerReady) return
  const messaging = await getMessagingInstance()
  if (!messaging) return

  onMessage(messaging, async (payload) => {
    await showPushNotification(payload)
  })

  foregroundListenerReady = true
}

export const initPushNotifications = async () => {
  const messaging = await getMessagingInstance()
  if (!messaging) return null

  await registerFirebaseServiceWorker()
  await ensureForegroundListener()

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null
  } else if (Notification.permission !== 'granted') {
    return null
  }

  const currentToken = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: swRegistration,
  })

  if (!currentToken) return null

  await sendFcmTokenToBackend(currentToken)
  await flushPendingFcmToken()
  return currentToken
}

export const requestAndSaveToken = () => initPushNotifications()
