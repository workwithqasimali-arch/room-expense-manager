# Optional Android + iPhone native builds

This web app is also structured so it can be wrapped with Capacitor.

From a Node.js project directory:

    npm init -y
    npm install @capacitor/core @capacitor/cli
    npx cap init "Room Expense Manager" "com.roomexpense.manager"
    npx cap add android
    npx cap add ios
    npx cap copy

Then:
- Android: `npx cap open android` and build an APK/AAB in Android Studio.
- iPhone: `npx cap open ios` and build/archive in Xcode.

iOS builds require macOS + Xcode. Android builds require Android Studio/Android SDK.
