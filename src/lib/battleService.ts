import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  increment,
  setDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

export interface Battle {
  id: string;
  title: string;
  type: "Solo" | "Team" | "4-Player";
  entryFee: number;
  prize: number;
  players: Record<string, { name: string; city: string; votes: number; uid: string }>;
  maxPlayers: number;
  status: "live" | "open" | "upcoming" | "finished";
  winnerId?: string;
  createdAt: Timestamp;
}

export const subscribeToBattle = (battleId: string, cb: (battle: Battle | null) => void) => {
  return onSnapshot(doc(db, "battles", battleId), (snap) => {
    if (snap.exists()) {
      cb({ id: snap.id, ...snap.data() } as Battle);
    } else {
      cb(null);
    }
  });
};

export const subscribeToBattles = (cb: (battles: Battle[]) => void) => {
  return onSnapshot(collection(db, "battles"), (snap) => {
    const battles = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Battle);
    cb(battles);
  });
};

export const voteForPlayer = async (battleId: string, playerUid: string) => {
  const battleRef = doc(db, "battles", battleId);
  await updateDoc(battleRef, {
    [`players.${playerUid}.votes`]: increment(1),
  });
};

export const addPointsToUser = async (uid: string, points: number) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { balance: increment(points) });
};

export const declareWinner = async (battleId: string, winnerUid: string, prize: number) => {
  const battleRef = doc(db, "battles", battleId);
  await updateDoc(battleRef, { winnerId: winnerUid, status: "finished" });
  await addPointsToUser(winnerUid, prize);
};

export const createBattle = async (battle: Omit<Battle, "id" | "createdAt">) => {
  const ref = doc(collection(db, "battles"));
  await setDoc(ref, { ...battle, createdAt: Timestamp.now() });
  return ref.id;
};
