import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Clock, CheckCircle, XCircle, Trophy, Brain } from "lucide-react";
import { Battle } from "@/lib/battleService";
import { QuizSet, submitPlayerAnswers, endQuiz } from "@/lib/quizService";
import { toast } from "sonner";

interface LiveQuizProps {
  battle: Battle;
  quizSet: QuizSet;
  currentUserUid: string;
  currentUserName: string;
  isAdmin?: boolean;
}

const SECS_PER_QUESTION = 30;
const OPTION_LABELS = ["A", "B", "C", "D"];

const LiveQuiz = ({
  battle,
  quizSet,
  currentUserUid,
  currentUserName,
  isAdmin = false,
}: LiveQuizProps) => {
  const questions = quizSet.questions;
  const totalTime = questions.length * SECS_PER_QUESTION;

  const [elapsed, setElapsed] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [popEffect, setPopEffect] = useState<{ qIdx: number; opt: number } | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startedAt = battle.quizStartedAt?.toMillis() ?? Date.now();

  const tick = useCallback(() => {
    const e = Math.floor((Date.now() - startedAt) / 1000);
    setElapsed(e);
    if (e >= totalTime) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setShowScores(true);
    }
  }, [startedAt, totalTime]);

  useEffect(() => {
    tick();
    intervalRef.current = setInterval(tick, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tick]);

  // Also trigger score reveal when battle.quizEnded flips
  useEffect(() => {
    if (battle.quizEnded) setShowScores(true);
  }, [battle.quizEnded]);

  const currentQIdx = Math.min(Math.floor(elapsed / SECS_PER_QUESTION), questions.length - 1);
  const secsIntoQ = elapsed % SECS_PER_QUESTION;
  const secsLeftInQ = SECS_PER_QUESTION - secsIntoQ;
  const totalLeft = Math.max(0, totalTime - elapsed);

  const mins = String(Math.floor(totalLeft / 60)).padStart(2, "0");
  const secs = String(totalLeft % 60).padStart(2, "0");

  const hasAnsweredCurrent = localAnswers[currentQIdx] !== undefined;
  const currentQ = questions[currentQIdx];

  const handleAnswer = (optIdx: number) => {
    if (hasAnsweredCurrent || showScores) return;
    const newAnswers = [...localAnswers];
    newAnswers[currentQIdx] = optIdx;
    setLocalAnswers(newAnswers);
    setPopEffect({ qIdx: currentQIdx, opt: optIdx });
    setTimeout(() => setPopEffect(null), 600);
  };

  // Auto-submit when quiz ends
  useEffect(() => {
    if (showScores && !submitted && localAnswers.length > 0) {
      setSubmitted(true);
      submitPlayerAnswers(battle.id, currentUserUid, localAnswers).catch(() => {});
    }
  }, [showScores, submitted, localAnswers, battle.id, currentUserUid]);

  const handleAdminEndQuiz = async () => {
    // Submit any answers before ending
    if (localAnswers.length > 0) {
      await submitPlayerAnswers(battle.id, currentUserUid, localAnswers).catch(() => {});
    }
    await endQuiz(battle.id);
    toast.success("Quiz ended — scores revealed!");
  };

  // ── Score calculation ──
  const calcScore = (answers: number[]) =>
    questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);

  const scoreboard = Object.entries(battle.playerAnswers ?? {})
    .map(([uid, ans]) => ({
      uid,
      name: battle.players?.[uid]?.name ?? uid,
      score: calcScore(ans),
      total: questions.length,
    }))
    .sort((a, b) => b.score - a.score);

  // Also include current user in scoreboard preview even before submission
  const mySubmitted = battle.playerAnswers?.[currentUserUid];
  const myScore = mySubmitted
    ? calcScore(mySubmitted)
    : calcScore(localAnswers);

  const progressPct = ((currentQIdx + secsIntoQ / SECS_PER_QUESTION) / questions.length) * 100;

  // ── Score Reveal Screen ──
  if (showScores) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 z-30 bg-black/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 gap-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Trophy className="h-16 w-16 text-amber-400" />
        </motion.div>

        <div className="text-center">
          <h2 className="font-display text-3xl font-black tracking-widest text-amber-400">
            QUIZ OVER!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your Score: <span className="text-primary font-bold text-lg">{myScore}/{questions.length}</span>
          </p>
        </div>

        {/* Scoreboard */}
        <div className="w-full max-w-sm space-y-2">
          {scoreboard.length === 0 ? (
            <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">{currentUserName}</span>
              <span className="text-primary font-display font-bold">{myScore}/{questions.length}</span>
            </div>
          ) : (
            scoreboard.map((entry, i) => (
              <motion.div
                key={entry.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl px-4 py-3 flex items-center justify-between
                  ${i === 0 ? "bg-amber-400/20 border border-amber-400/40" : "glass"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-black ${i === 0 ? "text-amber-400" : "text-muted-foreground"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <span className="text-sm font-bold text-foreground">{entry.name}</span>
                </div>
                <span className={`font-display font-bold text-lg ${i === 0 ? "text-amber-400" : "text-primary"}`}>
                  {entry.score}/{entry.total}
                </span>
              </motion.div>
            ))
          )}
        </div>

        {isAdmin && (
          <p className="text-[10px] text-muted-foreground">
            Scores saved — use Declare Winner in Arena Cards
          </p>
        )}
      </motion.div>
    );
  }

  // ── Active Quiz Screen ──
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm rounded-xl flex flex-col p-4 gap-3 overflow-auto"
    >
      {/* Header: timer + progress */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-display text-xs font-bold text-foreground tracking-wider">
            LIVE QUIZ — {quizSet.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className={`font-display text-sm font-black tabular-nums ${totalLeft <= 30 ? "text-destructive" : "text-foreground"}`}>
              {mins}:{secs}
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={handleAdminEndQuiz}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all"
            >
              END QUIZ
            </button>
          )}
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden flex-shrink-0">
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
        />
      </div>

      {/* Question counter + per-question countdown */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground flex-shrink-0">
        <span>Question {currentQIdx + 1} of {questions.length}</span>
        <div className="flex items-center gap-1">
          <span>Next in</span>
          <span className={`font-bold tabular-nums ${secsLeftInQ <= 5 ? "text-destructive" : "text-foreground"}`}>
            {secsLeftInQ}s
          </span>
        </div>
      </div>

      {/* Per-question time bar */}
      <div className="h-0.5 bg-muted/50 rounded-full overflow-hidden flex-shrink-0">
        <motion.div
          key={currentQIdx}
          initial={{ width: "100%" }}
          animate={{ width: `${(secsLeftInQ / SECS_PER_QUESTION) * 100}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${secsLeftInQ <= 5 ? "bg-destructive" : "bg-emerald-400"}`}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQIdx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col gap-3 min-h-0"
        >
          <p className="font-display text-base font-bold text-foreground leading-snug">
            {currentQ.question}
          </p>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentQ.options.map((opt, oi) => {
              const isSelected = localAnswers[currentQIdx] === oi;
              const isCorrect = currentQ.correct === oi;
              const showResult = hasAnsweredCurrent;

              let cls = "glass border-border text-foreground hover:border-primary/40 hover:bg-primary/5";
              if (showResult) {
                if (isSelected && isCorrect) cls = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
                else if (isSelected && !isCorrect) cls = "bg-destructive/20 border-destructive/50 text-destructive";
                else if (!isSelected && isCorrect) cls = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400/60";
                else cls = "glass border-border/40 text-muted-foreground opacity-60";
              }

              return (
                <motion.button
                  key={oi}
                  whileTap={!hasAnsweredCurrent ? { scale: 0.96 } : {}}
                  onClick={() => handleAnswer(oi)}
                  disabled={hasAnsweredCurrent}
                  className={`relative flex items-center gap-3 px-3 py-3 rounded-xl border text-sm font-medium transition-all text-left ${cls} disabled:cursor-default`}
                >
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black
                    ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                    {OPTION_LABELS[oi]}
                  </span>
                  <span className="flex-1 leading-tight">{opt}</span>
                  {showResult && isSelected && (
                    isCorrect
                      ? <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      : <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                  {showResult && !isSelected && isCorrect && (
                    <CheckCircle className="h-4 w-4 text-emerald-400/60 flex-shrink-0" />
                  )}

                  {/* Pop animation ring */}
                  {popEffect?.qIdx === currentQIdx && popEffect.opt === oi && (
                    <motion.span
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {hasAnsweredCurrent && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center text-sm font-bold ${localAnswers[currentQIdx] === currentQ.correct ? "text-emerald-400" : "text-destructive"}`}
            >
              {localAnswers[currentQIdx] === currentQ.correct ? "✓ Correct! Next question coming..." : "✗ Wrong! Correct answer highlighted."}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveQuiz;
