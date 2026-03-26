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
  isSpecial?: boolean;
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

export const joinBattle = async (
  battleId: string,
  uid: string,
  name: string,
  city = "India"
) => {
  const battleRef = doc(db, "battles", battleId);
  await updateDoc(battleRef, {
    [`players.${uid}`]: { uid, name, city, votes: 0 },
  });
};

export const voteForPlayer = async (battleId: string, playerUid: string) => {
  const battleRef = doc(db, "battles", battleId);
  await updateDoc(battleRef, {
    [`players.${playerUid}.votes`]: increment(1),
  });
};

export const logTransaction = async (
  uid: string,
  type: "reward" | "win" | "entry_fee" | "redeem",
  amount: number,
  description: string
) => {
  const txRef = doc(collection(db, "users", uid, "transactions"));
  await setDoc(txRef, {
    type,
    amount,
    description,
    createdAt: Timestamp.now(),
  });
};

export const addPointsToUser = async (uid: string, points: number, reason = "Admin Reward") => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { balance: increment(points) });
  await logTransaction(uid, "reward", points, reason);
};

export const declareWinner = async (battleId: string, winnerUid: string, prize: number) => {
  const battleRef = doc(db, "battles", battleId);
  await updateDoc(battleRef, { winnerId: winnerUid, status: "finished" });
  const userRef = doc(db, "users", winnerUid);
  await updateDoc(userRef, { balance: increment(prize) });
  await logTransaction(winnerUid, "win", prize, `Won battle ${battleId}`);
};

export interface Transaction {
  id: string;
  type: "reward" | "win" | "entry_fee" | "redeem";
  amount: number;
  description: string;
  createdAt: Timestamp;
}

export const subscribeToTransactions = (uid: string, cb: (txns: Transaction[]) => void) => {
  return onSnapshot(collection(db, "users", uid, "transactions"), (snap) => {
    const txns = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Transaction)
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    cb(txns);
  });
};

export const createBattle = async (battle: Omit<Battle, "id" | "createdAt">) => {
  const ref = doc(collection(db, "battles"));
  await setDoc(ref, { ...battle, createdAt: Timestamp.now() });
  return ref.id;
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  balance: number;
  battleStatus?: string;
}

export const subscribeToAllUsers = (cb: (users: UserProfile[]) => void) => {
  return onSnapshot(collection(db, "users"), (snap) => {
    const users = snap.docs.map((d) => d.data() as UserProfile);
    cb(users);
  });
};

export const declareWinnerByUid = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    balance: increment(100),
    battleStatus: "winner",
  });
};

export const clearWinnerStatus = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { battleStatus: null });
};
