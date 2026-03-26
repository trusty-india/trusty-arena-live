import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  increment,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { logTransaction } from "./battleService";

export interface PvPChallenge {
  id: string;
  creatorUid: string;
  creatorName: string;
  creatorPhoto: string;
  opponentUid?: string;
  opponentName?: string;
  opponentPhoto?: string;
  betAmount: number;
  status: "open" | "active" | "completed" | "cancelled";
  winnerId?: string;
  createdAt: Timestamp;
}

export const createChallenge = async (
  uid: string,
  name: string,
  photo: string,
  betAmount: number
) => {
  // Check balance first
  const userSnap = await getDoc(doc(db, "users", uid));
  const balance = userSnap.data()?.balance ?? 0;
  if (balance < betAmount) throw new Error("Insufficient balance");

  // Deduct entry fee
  await updateDoc(doc(db, "users", uid), { balance: increment(-betAmount) });
  await logTransaction(uid, "entry_fee", betAmount, `PvP challenge bet: ₹${betAmount}`);

  const ref = doc(collection(db, "pvp_challenges"));
  await setDoc(ref, {
    creatorUid: uid,
    creatorName: name,
    creatorPhoto: photo,
    betAmount,
    status: "open",
    createdAt: Timestamp.now(),
  });
  return ref.id;
};

export const acceptChallenge = async (
  challengeId: string,
  uid: string,
  name: string,
  photo: string
) => {
  const challengeRef = doc(db, "pvp_challenges", challengeId);
  const snap = await getDoc(challengeRef);
  if (!snap.exists()) throw new Error("Challenge not found");

  const data = snap.data();
  if (data.status !== "open") throw new Error("Challenge no longer open");
  if (data.creatorUid === uid) throw new Error("Cannot accept your own challenge");

  // Check balance
  const userSnap = await getDoc(doc(db, "users", uid));
  const balance = userSnap.data()?.balance ?? 0;
  if (balance < data.betAmount) throw new Error("Insufficient balance");

  // Deduct entry fee
  await updateDoc(doc(db, "users", uid), { balance: increment(-data.betAmount) });
  await logTransaction(uid, "entry_fee", data.betAmount, `Accepted PvP challenge: ₹${data.betAmount}`);

  await updateDoc(challengeRef, {
    opponentUid: uid,
    opponentName: name,
    opponentPhoto: photo,
    status: "active",
  });
};

export const declareChallengWinner = async (challengeId: string, winnerUid: string) => {
  const challengeRef = doc(db, "pvp_challenges", challengeId);
  const snap = await getDoc(challengeRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const totalPrize = data.betAmount * 2;

  await updateDoc(challengeRef, { winnerId: winnerUid, status: "completed" });
  await updateDoc(doc(db, "users", winnerUid), { balance: increment(totalPrize) });
  await logTransaction(winnerUid, "win", totalPrize, `Won PvP challenge: ₹${totalPrize}`);
};

export const cancelChallenge = async (challengeId: string, creatorUid: string) => {
  const challengeRef = doc(db, "pvp_challenges", challengeId);
  const snap = await getDoc(challengeRef);
  if (!snap.exists()) return;

  const data = snap.data();
  if (data.status !== "open") throw new Error("Can only cancel open challenges");

  // Refund
  await updateDoc(doc(db, "users", creatorUid), { balance: increment(data.betAmount) });
  await logTransaction(creatorUid, "reward", data.betAmount, `PvP challenge cancelled — refund`);
  await updateDoc(challengeRef, { status: "cancelled" });
};

export const subscribeToChallenges = (cb: (challenges: PvPChallenge[]) => void) => {
  return onSnapshot(collection(db, "pvp_challenges"), (snap) => {
    const challenges = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as PvPChallenge)
      .filter((c) => c.status !== "cancelled")
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    cb(challenges);
  });
};
