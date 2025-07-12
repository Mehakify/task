# TaskZen Firebase Setup Guide

Follow these steps to create and configure the necessary Firebase services for the TaskZen application.

## 1. Create a Firebase Project

First, you need a Firebase project to host your app's backend services.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"**.
3.  Enter a name for your project (e.g., `TaskZen-App`) and click **"Continue"**.
4.  You can choose to enable Google Analytics or not (it's not required for this app). Click **"Continue"**.
5.  Click **"Create project"**. Wait for the project to be provisioned.

## 2. Register Your Web App

Next, you need to register your web application with the Firebase project to get the configuration keys.

1.  From your project's dashboard, click the **Web icon (`</>`)** to start the setup process.
2.  Enter an "App nickname" (e.g., `TaskZen Web App`) and click **"Register app"**.
3.  You will be shown your Firebase configuration credentials. These are the keys you need for the next step.

## 3. Configure Environment Variables

This project uses environment variables to securely store your Firebase configuration.

1.  In the root directory of your project, create a new file named `.env.local`.
2.  Copy the configuration keys from the Firebase console (Step 2) into your `.env.local` file. The file should look like this, with your actual keys instead of the placeholders:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
    NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcd12345
    ```

3.  Save the `.env.local` file. The Next.js development server will automatically pick up these variables when you restart it.

## 4. Enable Authentication Methods

You need to enable the specific sign-in providers you want to use in your app.

1.  In the Firebase Console, navigate to **Build > Authentication**.
2.  Click **"Get started"**.
3.  In the **Sign-in method** tab, you will see a list of providers.
4.  Click on **"Google"** from the list, enable it, provide a project support email, and click **"Save"**.
5.  Click on **"Anonymous"** from the list, enable it, and click **"Save"**.

## 5. Set Up Firestore Database

Firestore will be used to store all the task data.

1.  In the Firebase Console, navigate to **Build > Firestore Database**.
2.  Click **"Create database"**.
3.  A dialog will appear asking for security rules mode. Select **Start in test mode**. This will allow read/write access for 30 days, which is convenient for development.
    > **Warning:** Before deploying your app to production, you **must** update your security rules to be more restrictive to prevent unauthorized access to your data.
4.  Click **"Next"**.
5.  Choose a location for your Firestore data (choose one close to your users) and click **"Enable"**.

Your Firebase backend is now fully configured for the TaskZen app! You can now run the application locally, and it will connect to the services you just set up.
