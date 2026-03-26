import AgoraRTC, {
  AgoraRTCProvider,
  LocalVideoTrack,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, LogOut, User, Wifi } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const APP_ID = "01eefeb03e6a4ff1b6131ca9e3d057a8";
const CHANNEL = "trusty-battle";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

interface VideoArenaProps {
  userName: string;
}

const WaitingCard = ({ slotNumber }: { slotNumber: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass relative overflow-hidden rounded-xl"
  >
    <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-muted/20">
      <div className="w-14 h-14 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
        <User className="h-6 w-6 text-primary/40" />
      </div>
      <div className="text-center">
        <p className="text-xs font-display font-bold text-muted-foreground tracking-wider">
          WAITING FOR PLAYER...
        </p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
    <div className="px-4 py-2">
      <p className="text-[10px] text-muted-foreground">Slot {slotNumber}</p>
    </div>
  </motion.div>
);

const ArenaInner = ({ userName }: { userName: string }) => {
  const navigate = useNavigate();
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [joining, setJoining] = useState(true);

  // Always create both tracks so they are always published
  const { localMicrophoneTrack, isLoading: micLoading } = useLocalMicrophoneTrack();
  const { localCameraTrack, isLoading: camLoading } = useLocalCameraTrack();

  // Join the fixed channel — all users join the same 'trusty-battle'
  useJoin(
    { appid: APP_ID, channel: CHANNEL, token: null },
    true,
  );

  // Publish both tracks so remote users can see/hear this user
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Live list of everyone else in the channel
  const remoteUsers = useRemoteUsers();

  const isLoading = micLoading || camLoading;

  const handleMuteAudio = async () => {
    await localMicrophoneTrack?.setEnabled(audioMuted); // if currently muted → enable; if enabled → disable
    setAudioMuted((prev) => !prev);
  };

  const handleStopVideo = async () => {
    await localCameraTrack?.setEnabled(videoOff);
    setVideoOff((prev) => !prev);
  };

  const handleLeave = () => {
    localMicrophoneTrack?.close();
    localCameraTrack?.close();
    navigate("/");
  };

  // Total occupied slots (local = 1, remotes up to 3)
  const remoteSlots = remoteUsers.slice(0, 3);
  const emptyCount = Math.max(0, 3 - remoteSlots.length); // remaining of the 3 remote slots

  return (
    <div className="space-y-4">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 glass px-4 py-2 rounded-full w-fit"
        >
          <Wifi className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">Connecting to arena...</span>
        </motion.div>
      )}

      {/* 2×2 Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Slot 1: Local player (YOU) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass relative overflow-hidden rounded-xl border border-primary/30"
        >
          <div className="aspect-video bg-muted/30 relative">
            {localCameraTrack && !videoOff ? (
              <LocalVideoTrack
                track={localCameraTrack}
                play
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-display font-bold text-primary">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* YOU badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-foreground bg-black/60 px-1.5 py-0.5 rounded">YOU</span>
            </div>

            {/* Mic indicator */}
            <div className="absolute top-2 right-2">
              {audioMuted
                ? <MicOff className="h-4 w-4 text-destructive drop-shadow" />
                : <Mic className="h-4 w-4 text-primary drop-shadow" />}
            </div>
          </div>

          <div className="px-4 py-2 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">{userName}</p>
            <span className="text-[10px] text-primary font-display font-bold tracking-wider">PLAYER 1</span>
          </div>
        </motion.div>

        {/* ── Slots 2-4: Remote players ── */}
        {remoteSlots.map((remoteUser, i) => (
          <motion.div
            key={remoteUser.uid}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i + 1) * 0.1 }}
            className="glass relative overflow-hidden rounded-xl border border-secondary/20"
          >
            <div className="aspect-video bg-muted/30 relative">
              <RemoteUser
                user={remoteUser}
                playVideo
                playAudio
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-neon" />
                <span className="text-[10px] font-bold text-foreground bg-black/60 px-1.5 py-0.5 rounded">LIVE</span>
              </div>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">Player {i + 2}</p>
              <span className="text-[10px] text-secondary font-display font-bold tracking-wider">PLAYER {i + 2}</span>
            </div>
          </motion.div>
        ))}

        {/* ── Empty waiting slots ── */}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <WaitingCard key={`waiting-${i}`} slotNumber={remoteSlots.length + i + 2} />
        ))}
      </div>

      {/* ── Control Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-4 py-4"
      >
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleMuteAudio}
          data-testid="button-mute-audio"
          className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl font-display text-xs font-bold tracking-wider transition-all border ${
            audioMuted
              ? "bg-destructive/20 border-destructive/40 text-destructive"
              : "glass border-primary/20 text-primary hover:bg-primary/10"
          }`}
        >
          {audioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          {audioMuted ? "Unmute" : "Mute Audio"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleStopVideo}
          data-testid="button-stop-video"
          className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl font-display text-xs font-bold tracking-wider transition-all border ${
            videoOff
              ? "bg-destructive/20 border-destructive/40 text-destructive"
              : "glass border-primary/20 text-primary hover:bg-primary/10"
          }`}
        >
          {videoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          {videoOff ? "Start Video" : "Stop Video"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleLeave}
          data-testid="button-leave-battle"
          className="flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl font-display text-xs font-bold tracking-wider 
                     bg-destructive/20 border border-destructive/40 text-destructive 
                     hover:bg-destructive hover:text-white transition-all"
        >
          <LogOut className="h-5 w-5" />
          Leave Battle
        </motion.button>
      </motion.div>
    </div>
  );
};

const VideoArena = ({ userName }: VideoArenaProps) => (
  <AgoraRTCProvider client={client}>
    <ArenaInner userName={userName} />
  </AgoraRTCProvider>
);

export default VideoArena;
