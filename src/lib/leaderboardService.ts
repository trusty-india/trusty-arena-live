import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  balance: number;
}

export const subscribeToLeaderboard = (count: number, cb: (entries: LeaderboardEntry[]) => void) => {
  const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(count));
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({
      uid: d.id,
      ...d.data(),
    })) as LeaderboardEntry[];
    cb(entries);
  });
};
