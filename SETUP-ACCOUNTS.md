# Turning on accounts (Firebase), about 10 minutes

The app already works without this (guest mode). Do these steps once to enable sign-in and sync.

1. Go to https://console.firebase.google.com and click **Add project** (name it "aligned"; Analytics is not needed).
2. **Authentication** > Get started > Sign-in method: turn on **Email/Password** and **Google**.
3. **Authentication** > Settings > **Authorized domains**: add `aligned-chi.vercel.app` (and any custom domain).
4. **Firestore Database** > Create database > production mode, choose a region close to you (for Dakar, `europe-west` is a good choice).
5. Firestore > **Rules**: paste the contents of `firestore.rules` and click Publish.
6. Project settings (gear icon) > **Your apps** > add a **Web app** (`</>`). Copy the `firebaseConfig` values.
7. Open `firebase-config.js` and paste `apiKey`, `authDomain`, `projectId` and `appId` between the quotes.
8. Upload everything to GitHub as usual. Vercel redeploys. The landing page now shows the account buttons.

Notes
- These config values are not secrets. The security rules are what protect the data: each account can only read and write its own documents.
- Images you add to exercises stay on the device (they are too large to sync). Everything else syncs.
- If you ever see "This website is not authorised", step 3 is missing the domain you are using.
- Password-reset emails come from Firebase. You can edit their wording under Authentication > Templates.
