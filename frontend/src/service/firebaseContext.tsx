import { doc, getFirestore } from "firebase/firestore";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import {
    FirebaseAppProvider,
    FirestoreProvider,
    useFirebaseApp,
    AuthProvider,
    useSigninCheck,
} from "reactfire";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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

    return (
        <Button className="text-white bg-white/15" onClick={handleSignOut}>
            <LogOut />
        </Button>
    );
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

export async function emailAndPasswordSignIn(email: string, password: string) {
    const auth = getAuth();

    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log("Signed in user:", result.user.displayName);
    } catch (error: any) {
        console.error("Sign-in error:", error.message);
        // Show error message to user
    }
}

export async function emailAndPasswordSignUp(email: string, password: string) {
    const auth = getAuth();

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        return userCredential.user;
    } catch (error) {
        if (error instanceof Error) {
            // Transform Firebase error messages to be more user-friendly
            if (error.message.includes("email-already-in-use")) {
                throw new Error(
                    "This email is already registered. Please try logging in instead."
                );
            } else if (error.message.includes("invalid-email")) {
                throw new Error("Please enter a valid email address.");
            } else if (error.message.includes("weak-password")) {
                throw new Error(
                    "Password should be at least 6 characters long."
                );
            }
        }
        throw error;
    }
}
