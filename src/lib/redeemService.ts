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
  orderBy,
  where,
} from "firebase/firestore";
import { logTransaction } from "./battleService";

export interface RedeemRequest {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  amount: number;
  upiId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}

export const createRedeemRequest = async (
  uid: string,
  displayName: string,
  photoURL: string,
  email: string,
  amount: number,
  upiId: string
) => {
  // Check balance
  const userSnap = await getDoc(doc(db, "users", uid));
  const balance = userSnap.data()?.balance ?? 0;
  if (balance < amount) throw new Error("Insufficient balance");
  if (amount < 50) throw new Error("Minimum withdrawal is ₹50");

  // Deduct balance immediately (hold)
  await updateDoc(doc(db, "users", uid), { balance: increment(-amount) });
  await logTransaction(uid, "redeem", amount, `Withdrawal request: ₹${amount} to ${upiId}`);

  const ref = doc(collection(db, "redeem_requests"));
  await setDoc(ref, {
    uid,
    displayName,
    photoURL,
    email,
    amount,
    upiId,
    status: "pending",
    createdAt: Timestamp.now(),
  });
  return ref.id;
};

export const approveRedeemRequest = async (requestId: string) => {
  await updateDoc(doc(db, "redeem_requests", requestId), {
    status: "approved",
    resolvedAt: Timestamp.now(),
  });
};

export const rejectRedeemRequest = async (requestId: string) => {
  const ref = doc(db, "redeem_requests", requestId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  // Refund balance
  await updateDoc(doc(db, "users", data.uid), { balance: increment(data.amount) });
  await logTransaction(data.uid, "reward", data.amount, `Withdrawal rejected — refund ₹${data.amount}`);

  await updateDoc(ref, {
    status: "rejected",
    resolvedAt: Timestamp.now(),
  });
};

export const subscribeToAllRedeemRequests = (cb: (requests: RedeemRequest[]) => void) => {
  return onSnapshot(collection(db, "redeem_requests"), (snap) => {
    const requests = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as RedeemRequest)
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    cb(requests);
  });
};

export const subscribeToUserRedeemRequests = (uid: string, cb: (requests: RedeemRequest[]) => void) => {
  return onSnapshot(collection(db, "redeem_requests"), (snap) => {
    const requests = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as RedeemRequest)
      .filter((r) => r.uid === uid)
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    cb(requests);
  });
};
