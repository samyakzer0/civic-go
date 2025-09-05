# CivicGo Enhanced Notification System - Setup Guide for Beginners

This guide will walk you through setting up and understanding the Enhanced Notification System implemented in CivicGo. Whether you're a beginner developer or just new to this codebase, this document will help you understand how notifications work and how to configure the system.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Firebase Setup](#firebase-setup)
4. [Project Configuration](#project-configuration)
5. [Key Components](#key-components)
6. [Testing Your Notifications](#testing-your-notifications)
7. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
8. [Advanced Customization](#advanced-customization)

## Overview

The Enhanced Notification System for CivicGo includes:

- **In-app notifications** - Displayed through the notification center
- **Push notifications** - Delivered through Firebase Cloud Messaging (FCM)
- **Email notifications** - For important updates (through a backend service)
- **User preferences** - Allow users to control what notifications they receive
- **Do Not Disturb mode** - For quiet hours

## Prerequisites

Before you begin, make sure you have:

1. Node.js and npm installed (v14+ recommended)
2. Firebase account (free tier is sufficient)
3. Basic knowledge of React and TypeScript
4. CivicGo codebase cloned locally

## Firebase Setup

Follow these steps to set up Firebase for push notifications:

1. **Create a Firebase project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Give your project a name (e.g., "CivicGo")
   - Enable Google Analytics (optional)
   - Create the project

2. **Add a Web app to your Firebase project**:
   - From the project overview, click the web icon (</>) 
   - Register your app with a nickname (e.g., "CivicGo Web")
   - Check "Set up Firebase Hosting" if you plan to deploy with Firebase
   - Click "Register app"
   - Copy the Firebase configuration object - you'll need this later

3. **Enable Firebase Cloud Messaging**:
   - In the Firebase console, go to "Project settings"
   - Navigate to the "Cloud Messaging" tab
   - Generate a new Web Push certificate (click "Generate key pair")
   - Copy the Web Push certificate - this is your VAPID key

4. **Install Firebase in your project**:
   ```bash
   npm install firebase
   ```

## Project Configuration

1. **Create the Firebase Service**:

   Create a new file `src/services/firebase.ts` with the following content:
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { 
     getMessaging, 
     getToken, 
     onMessage,
     isSupported 
   } from 'firebase/messaging';
   import { createNotification } from './EnhancedNotificationService';

   // Replace with your actual Firebase configuration
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   // Initialize Firebase - only if browser supports it
   let messaging: any = null;
   let firebaseApp: any = null;

   export const initializeFirebaseMessaging = async () => {
     try {
       // Check if browser supports Firebase Messaging
       const isFirebaseSupported = await isSupported();
       
       if (!isFirebaseSupported) {
         console.log('Firebase messaging is not supported in this browser');
         return false;
       }
       
       // Initialize Firebase app if not already initialized
       if (!firebaseApp) {
         firebaseApp = initializeApp(firebaseConfig);
         messaging = getMessaging(firebaseApp);
         console.log('Firebase initialized successfully');
       }
       
       return true;
     } catch (error) {
       console.error('Error initializing Firebase:', error);
       return false;
     }
   };

   // Request notification permission and get FCM token
   export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
     try {
       const isInitialized = await initializeFirebaseMessaging();
       
       if (!isInitialized || !messaging) {
         console.log('Firebase messaging not initialized or not supported');
         return null;
       }
       
       // Check if permission is already granted
       if (Notification.permission === 'granted') {
         // Get FCM token
         const token = await getToken(messaging, {
           vapidKey: 'YOUR_VAPID_KEY'
         });
         
         console.log('FCM Token:', token);
         return token;
       }
       
       // Request permission
       const permission = await Notification.requestPermission();
       
       if (permission === 'granted') {
         // Get FCM token
         const token = await getToken(messaging, {
           vapidKey: 'YOUR_VAPID_KEY'
         });
         
         console.log('FCM Token:', token);
         return token;
       } else {
         console.log('Notification permission denied');
         return null;
       }
     } catch (error) {
       console.error('Error requesting notification permission:', error);
       return null;
     }
   };

   // Handle foreground messages
   export const onForegroundMessage = (userId: string) => {
     if (!messaging) return;
     
     onMessage(messaging, (payload) => {
       console.log('Received foreground message:', payload);
       
       // Extract notification data
       const title = payload.notification?.title || 'New Notification';
       const body = payload.notification?.body || '';
       const imageUrl = payload.notification?.image || '';
       const data = payload.data || {};
       
       // Create notification in our system
       createNotification({
         userId,
         title,
         body,
         type: data.type || 'general',
         metadata: data,
         imageUrl,
       });
       
       // Show browser notification if needed (fallback)
       if (!document.hasFocus()) {
         showBrowserNotification(title, body, imageUrl);
       }
     });
   };

   // Helper function to show browser notification
   const showBrowserNotification = (title: string, body: string, imageUrl?: string) => {
     if (Notification.permission === 'granted') {
       const options = {
         body,
         icon: imageUrl || '/favicon.ico',
       };
       
       const notification = new Notification(title, options);
       
       // Handle notification click
       notification.onclick = () => {
         window.focus();
         notification.close();
       };
     }
   };

   export default {
     initializeFirebaseMessaging,
     requestNotificationPermission,
     onForegroundMessage
   };
   ```

2. **Create a Firebase Service Worker**:

   Create a file named `firebase-messaging-sw.js` in your project's public folder:
   ```javascript
   // This file must be in the public folder at the root level
   
   // Give the service worker access to Firebase Messaging.
   importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
   importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

   // Initialize the Firebase app in the service worker
   firebase.initializeApp({
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   });

   // Retrieve an instance of Firebase Messaging
   const messaging = firebase.messaging();

   // Handle background messages
   messaging.onBackgroundMessage(function(payload) {
     console.log('[firebase-messaging-sw.js] Received background message ', payload);

     const notificationTitle = payload.notification.title;
     const notificationOptions = {
       body: payload.notification.body,
       icon: '/favicon.ico'
     };

     self.registration.showNotification(notificationTitle, notificationOptions);
   });
   ```

3. **Initialize Firebase in your app**:

   Update your `App.tsx` to initialize Firebase when a user is authenticated:
   ```typescript
   import { initializeFirebaseMessaging, requestNotificationPermission, onForegroundMessage } from './services/firebase';

   // Inside a useEffect in your App component
   useEffect(() => {
     const setupUser = async () => {
       try {
         // Check if user is authenticated
         const currentUser = await getCurrentUser();
         if (currentUser && currentUser.email) {
           const userEmail = currentUser.email;
           setUserId(userEmail);
           
           // Initialize Firebase messaging
           const isFirebaseInitialized = await initializeFirebaseMessaging();
           
           if (isFirebaseInitialized) {
             // Request notification permission
             const token = await requestNotificationPermission(userEmail);
             
             // Set up foreground message handler
             if (token) {
               onForegroundMessage(userEmail);
             }
           }
         }
       } catch (error) {
         console.error("Error setting up user and notifications:", error);
       }
     };
     
     setupUser();
   }, []);
   ```

## Key Components

The notification system consists of several key components:

1. **NotificationCenter** (`src/components/NotificationCenter.tsx`):
   - Displays notifications in a dropdown
   - Shows unread count badge
   - Allows marking notifications as read or deleting them

2. **NotificationsHistoryPage** (`src/components/NotificationsHistoryPage.tsx`):
   - Full-page view of all notifications
   - Filtering by type and read status
   - Actions for each notification

3. **NotificationPreferencesPage** (`src/components/NotificationPreferencesPage.tsx`):
   - User settings for notification delivery
   - Options for push, email, and in-app notifications
   - Do Not Disturb configuration

4. **EnhancedNotificationService** (`src/services/EnhancedNotificationService.ts`):
   - Core service for creating and managing notifications
   - Handles user preferences and notification delivery

5. **enhancedNotificationUtils** (`src/utils/enhancedNotificationUtils.ts`):
   - Templates for different notification types
   - Helper functions for creating notifications

## Testing Your Notifications

To test your notification system:

1. **In-app notifications**:
   - Create a notification using the `createNotification` function
   - Check if it appears in the notification center
   - Try marking as read and deleting

2. **Push notifications**:
   - Use the Firebase Console to send a test message
   - Or implement a test function to trigger FCM from your code

3. **Check preferences**:
   - Create notifications with different types
   - Toggle preferences and verify notifications respect them

Example test function:
```typescript
// Add this to a component where you want to test notifications
const testNotification = async () => {
  try {
    const notification = await createNotification({
      userId: "user_email@example.com",
      title: "Test Notification",
      body: "This is a test notification from CivicGo",
      type: "general",
    });
    
    console.log("Created test notification:", notification);
  } catch (error) {
    console.error("Error creating test notification:", error);
  }
};

// Call this function from a button click or other event
```

## Common Issues & Troubleshooting

1. **Push notifications not working**:
   - Check if your browser supports service workers and push API
   - Verify Firebase configuration is correct
   - Make sure the user has granted permission
   - Check console for errors

2. **Notification permissions denied**:
   - Provide a way for users to re-enable permissions in settings
   - Offer fallback to in-app or email notifications

3. **Firebase initialization fails**:
   - Verify your Firebase configuration details
   - Check if the browser has internet access
   - Ensure Firebase services are enabled in the console

4. **Notifications not appearing**:
   - Check if the user has the correct notification type enabled in preferences
   - Verify the notification was created successfully
   - Look for console errors

## Advanced Customization

You can extend the notification system in several ways:

1. **Custom notification templates**:
   - Add new templates to `enhancedNotificationUtils.ts`
   - Implement specific styling for different notification types

2. **Rich notifications**:
   - Add images, action buttons, or other rich content to push notifications
   - Customize the service worker to handle these advanced features

3. **Analytics tracking**:
   - Add tracking to monitor notification open rates and engagement
   - Implement A/B testing for notification content

4. **Batched notifications**:
   - Group similar notifications to avoid overwhelming users
   - Implement logic to consolidate notifications about the same report

5. **Scheduled notifications**:
   - Add the ability to schedule notifications for future delivery
   - Implement a notification queue system

## Conclusion

You now have a fully functional notification system in your CivicGo app! This system provides users with timely updates across multiple channels and respects their notification preferences.

Remember to replace the placeholder Firebase configuration with your actual Firebase details, and customize the notification templates to match your application's specific needs.

For any issues or questions, refer to the Firebase documentation or reach out to the development team.
