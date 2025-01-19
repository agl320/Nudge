import { createContext, ReactNode, useContext } from "react";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useFirebaseApp, useSigninCheck } from "reactfire";
import { User } from "@/types/User";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface UserContextType {
  writeUserData: (user: User) => Promise<void>;
  emailAndPasswordSignUp: (email: string, password: string) => Promise<any>;
  emailAndPasswordSignIn: (email: string, password: string) => Promise<void>;
  GoogleSignIn: () => React.ReactElement;
  UserSignIn: () => React.ReactElement;
  UserSignOut: () => React.ReactElement;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const app = useFirebaseApp();
  const db = getFirestore(app);


  async function writeUserData(user: User) {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        uid: user.uid,
        nickName: user.nickName,
        offTopicHisotry: user.offTopicHistory,
      });

      console.log("write user data successful", docRef);
    } catch (e: any) {
      console.log("write user data error", e);
    }
  }

  async function emailAndPasswordSignUp(email: string, password: string) {
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const newUser = {
        uid: userCredential.user.uid,
        nickName: userCredential.user.displayName || "Anonymous",
        offTopicHistory: [],
      };

      await writeUserData(newUser);
      return userCredential.user;
    } catch (error) {
      if (error instanceof Error) {
        // Transform Firebase error messages to be more user-friendly
        if (error.message.includes("email-already-in-use")) {
          throw new Error("This email is already registered. Please try logging in instead.");
        } else if (error.message.includes("invalid-email")) {
          throw new Error("Please enter a valid email address.");
        } else if (error.message.includes("weak-password")) {
          throw new Error("Password should be at least 6 characters long.");
        }
      }
      throw error;
    }
  }

  async function emailAndPasswordSignIn(email: string, password: string) {
    const auth = getAuth();

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const newUser = {
        uid: result.user.uid,
        nickName: result.user.displayName || "Anonymous",
        offTopicHistory: [],
      };

      writeUserData(newUser);
      console.log("Signed in user:", result.user.displayName);
    } catch (error: any) {
      console.error("Sign-in error:", error.message);
    }
  }

  function GoogleSignIn() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    const handleSignIn = async () => {
      try {
        const result = await signInWithPopup(auth, provider);

        const newUser: User = {
          uid: result.user.uid,
          nickName: result.user.displayName || "Anonymous",
          offTopicHistory: [],
        };

        await writeUserData(newUser);
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

  function UserSignIn() {
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

  function UserSignOut() {
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

  const value = {
    writeUserData,
    emailAndPasswordSignUp,
    emailAndPasswordSignIn,
    GoogleSignIn,
    UserSignIn,
    UserSignOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
