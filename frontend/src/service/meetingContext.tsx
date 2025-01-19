import { createContext, ReactNode, useContext } from "react";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useFirebaseApp } from "reactfire";
import { IMeetingCreation } from "@/types/IMeetingCreation"; 

interface MeetingContextType {
    createMeeting: (meeting: IMeetingCreation) => Promise<void>;
}

const MeetingContext = createContext<MeetingContextType | null>(null);

export function MeetingProvider({ children }: { children: ReactNode }) {
  const app = useFirebaseApp();
  const db = getFirestore(app);

  async function createMeeting(meeting: IMeetingCreation) {
    try {
      const meetingsRef = collection(db, "meetings");
      const docRef = await addDoc(meetingsRef, meeting);
      console.log("Meeting added with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding meeting:", error);
    }
  };

  const value = {
    createMeeting,
  };

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeeting must be used within a MeetingProvider");
  }
  return context;
}
