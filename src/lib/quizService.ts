import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface QuizSet {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: Timestamp;
}

export const createQuizSet = async (title: string, questions: QuizQuestion[]) => {
  const ref = doc(collection(db, "quizSets"));
  await setDoc(ref, { title, questions, createdAt: Timestamp.now() });
  return ref.id;
};

export const subscribeToQuizSets = (cb: (sets: QuizSet[]) => void) => {
  return onSnapshot(collection(db, "quizSets"), (snap) => {
    const sets = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as QuizSet)
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    cb(sets);
  });
};

export const startQuiz = async (battleId: string, quizSetId: string) => {
  await updateDoc(doc(db, "battles", battleId), {
    isQuizActive: true,
    quizSetId,
    quizStartedAt: Timestamp.now(),
    quizEnded: false,
    playerAnswers: {},
    status: "live",
  });
};

export const endQuiz = async (battleId: string) => {
  await updateDoc(doc(db, "battles", battleId), {
    isQuizActive: false,
    quizEnded: true,
  });
};

export const submitPlayerAnswers = async (
  battleId: string,
  uid: string,
  answers: number[]
) => {
  await updateDoc(doc(db, "battles", battleId), {
    [`playerAnswers.${uid}`]: answers,
  });
};
