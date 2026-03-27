import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export interface ChessGameState {
  type: "chess";
  fen: string;
  pgn: string;
  players: Record<string, "w" | "b">;
  status: "active" | "checkmate" | "draw" | "stalemate" | "resigned";
  winner: string | null;
}

export interface LudoGameState {
  type: "ludo";
  pawns: Record<string, number[]>;
  players: Record<string, string>;
  colorOrder: string[];
  currentColorIdx: number;
  diceValue: number | null;
  diceRolled: boolean;
  consecutiveSixes: number;
  status: "waiting" | "active" | "finished";
  winner: string | null;
}

export type GameState = ChessGameState | LudoGameState;

export const initChessGame = async (battleId: string, uid1: string, uid2: string) => {
  const gameState: ChessGameState = {
    type: "chess",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    pgn: "",
    players: { [uid1]: "w", [uid2]: "b" },
    status: "active",
    winner: null,
  };
  await updateDoc(doc(db, "battles", battleId), { gameState, status: "live" });
};

export const updateChessState = async (
  battleId: string,
  fen: string,
  pgn: string,
  status: ChessGameState["status"],
  winner: string | null
) => {
  await updateDoc(doc(db, "battles", battleId), {
    "gameState.fen": fen,
    "gameState.pgn": pgn,
    "gameState.status": status,
    "gameState.winner": winner,
  });
};

export const initLudoGame = async (battleId: string, playerUids: string[]) => {
  const colors = ["red", "green", "yellow", "blue"];
  const players: Record<string, string> = {};
  playerUids.forEach((uid, i) => {
    players[uid] = colors[i % 4];
  });
  const activeColors = colors.slice(0, Math.min(playerUids.length, 4));
  const pawns: Record<string, number[]> = {};
  activeColors.forEach((c) => {
    pawns[c] = [-1, -1, -1, -1];
  });
  const gameState: LudoGameState = {
    type: "ludo",
    pawns,
    players,
    colorOrder: activeColors,
    currentColorIdx: 0,
    diceValue: null,
    diceRolled: false,
    consecutiveSixes: 0,
    status: "active",
    winner: null,
  };
  await updateDoc(doc(db, "battles", battleId), { gameState, status: "live" });
};

export const updateLudoState = async (battleId: string, gameState: LudoGameState) => {
  await updateDoc(doc(db, "battles", battleId), { gameState });
};

export const pauseGame = async (battleId: string, paused: boolean) => {
  await updateDoc(doc(db, "battles", battleId), { isPaused: paused });
};

export const disqualifyPlayer = async (battleId: string, uid: string) => {
  await updateDoc(doc(db, "battles", battleId), {
    [`disqualifiedPlayers.${uid}`]: true,
  });
};

export const reportTabSwitch = async (battleId: string, uid: string) => {
  await updateDoc(doc(db, "battles", battleId), {
    [`tabSwitches.${uid}`]: increment(1),
  });
};
