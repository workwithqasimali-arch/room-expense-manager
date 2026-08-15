# Mobile Installation

## Android
1. Put this folder on a web server with HTTPS.
2. Open the website in Chrome on Android.
3. Tap the browser menu.
4. Choose **Install app** or **Add to Home screen**.
5. The app opens full-screen like a normal mobile app.

## iPhone / iPad
1. Put this folder on an HTTPS web server.
2. Open the website in Safari.
3. Tap **Share**.
4. Choose **Add to Home Screen**.
5. Open it from the new icon; it runs as a standalone web app.

## Important
A browser/PWA cannot be installed directly from a ZIP file. It needs to be served from HTTPS.

For a true store package:
- Android: the same project can be wrapped with Capacitor and built as an APK/AAB.
- iPhone: it can be wrapped with Capacitor and built as an IPA in Xcode on macOS.

The current app stores data locally on each device. Multi-device synchronization requires connecting it to the included backend schema and a cloud database.
