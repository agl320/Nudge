import { doc, getFirestore } from "firebase/firestore";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import {
    FirebaseAppProvider,
    FirestoreProvider,
    useFirestoreDocData,
    useFirestore,
    useFirebaseApp,
    AuthProvider,
    useSigninCheck,
} from "reactfire";
import { Button } from "@/components/ui/button";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

type ProviderProps = {
    children: JSX.Element;
};

export function FirebaseProviders({ children }: ProviderProps) {
    return (
        <FirebaseAppProvider firebaseConfig={firebaseConfig}>
            <Wrappers>{children}</Wrappers>
        </FirebaseAppProvider>
    );
}

function Wrappers({ children }: ProviderProps) {
    const app = useFirebaseApp();
    const firestoreInstance = getFirestore(app);
    const auth = getAuth(app);

    return (
        <AuthProvider sdk={auth}>
            <FirestoreProvider sdk={firestoreInstance}>
                {children}
            </FirestoreProvider>
        </AuthProvider>
    );
}

export function GoogleSignIn() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    const handleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Signed in user:", result.user.displayName);
            // Redirect or update UI for signed-in state
        } catch (error: any) {
            console.error("Sign-in error:", error.message);
            // Show error message to user
        }
    };

    return (
        <Button onClick={handleSignIn} className="bg-white text-black">
            Log in with Google
        </Button>
    );
}

export function UserSignOut() {
    const auth = getAuth();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log("User signed out successfully");
        } catch (error) {
            console.error("Sign-out error:", error);
        }
    };

    return <button onClick={handleSignOut}>Sign Out</button>;
}

export function UserSignIn() {
    const { status, data: signInCheckResult } = useSigninCheck();

    if (status === "loading") {
        return <span>loading...</span>;
    }

    if (signInCheckResult.signedIn === true) {
        return (
            <div>
                <h1>You are signed in</h1>
                <UserSignOut />
            </div>
        );
    } else {
        return <GoogleSignIn />;
    }
}
