import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase, get, onValue, ref, set, update } from "firebase/database";
import {
  Crown,
  Users,
  Play,
  LogIn,
  Trophy,
  TimerReset,
  ChevronRight,
  Sparkles,
  Medal,
  CheckCircle2,
  XCircle,
  Orbit,
  Target,
  FlaskConical,
  Database,
  RefreshCw,
} from "lucide-react";

const firebaseConfig = {
  apiKey: "AIzaSyCNd6lwterU9IFBkW_JRUpGFs-atr26LYY",
  authDomain: "artemiz-52b29.firebaseapp.com",
  databaseURL: "https://artemiz-52b29-default-rtdb.firebaseio.com/",
  projectId: "artemiz-52b29",
  storageBucket: "artemiz-52b29.firebasestorage.app",
  messagingSenderId: "445196205174",
  appId: "1:445196205174:web:fb6517e8668ef84a1ccf357",
  measurementId: "G-Y1Z15T1DWG",
};

const MAX_TEAMS = 12;

const TEAM_COLORS = [
  "#38bdf8",
  "#818cf8",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#a855f7",
  "#84cc16",
  "#f97316",
  "#06b6d4",
  "#eab308",
];

const ROUNDS = [
  {
    key: "contour",
    title: "Contour Clash",
    icon: Orbit,
    accent: "from-sky-400/30 to-cyan-300/10",
    questions: [
      {
        id: "C1",
        points: 100,
        timeLimit: 20,
        question: "Sebuah titik berada di dalam contour 95% jika nilai jarak kuadrat Mahalanobisnya...",
        options: [
          "Lebih besar dari nilai kritis",
          "Lebih kecil atau sama dengan nilai kritis",
          "Selalu nol",
          "Tidak bergantung pada kovarians",
        ],
        answer: 1,
        explanation:
          "Titik berada di dalam contour jika nilai jarak kuadrat Mahalanobis tidak melebihi nilai kritis chi-square.",
      },
      {
        id: "C2",
        points: 110,
        timeLimit: 18,
        question: "Arah sumbu ellips ditentukan oleh...",
        options: ["Mean", "Eigenvector", "Median", "Ukuran sampel"],
        answer: 1,
        explanation: "Eigenvector menentukan arah sumbu ellips, sedangkan eigenvalue mengatur panjangnya.",
      },
      {
        id: "C3",
        points: 120,
        timeLimit: 18,
        question: "Contour 95% dibanding contour 90% biasanya akan tampak...",
        options: ["Lebih kecil", "Sama", "Lebih besar", "Lebih miring"],
        answer: 2,
        explanation: "Contour 95% mencakup area lebih besar daripada contour 90%.",
      },
    ],
  },
  {
    key: "outlier",
    title: "Outlier Detective",
    icon: Target,
    accent: "from-rose-400/30 to-orange-300/10",
    questions: [
      {
        id: "O1",
        points: 140,
        timeLimit: 20,
        question: "Pada chi-square plot, data yang mendekati normal multivariat biasanya...",
        options: [
          "Membentuk lingkaran",
          "Berada di sekitar garis lurus acuan",
          "Semua berada di bawah garis",
          "Acak tanpa pola",
        ],
        answer: 1,
        explanation: "Data yang mendekati normal multivariat cenderung mengikuti garis lurus acuan.",
      },
      {
        id: "O2",
        points: 150,
        timeLimit: 18,
        question: "Jarak yang digunakan untuk mendeteksi outlier multivariat pada modul adalah...",
        options: ["Euclidean", "Manhattan", "Mahalanobis", "Minkowski"],
        answer: 2,
        explanation: "Mahalanobis distance memperhitungkan struktur kovarians antarkomponen.",
      },
      {
        id: "O3",
        points: 160,
        timeLimit: 18,
        question: "Jika sebuah titik sangat jauh dari garis acuan pada chi-square plot, maka kemungkinan...",
        options: [
          "Data sangat normal",
          "Terdapat outlier atau penyimpangan normalitas",
          "Mean menjadi nol",
          "Kovarians pasti identitas",
        ],
        answer: 1,
        explanation: "Penyimpangan besar dari garis acuan mengindikasikan outlier atau non-normalitas.",
      },
    ],
  },
  {
    key: "boxcox",
    title: "Box-Cox Rescue",
    icon: FlaskConical,
    accent: "from-violet-400/30 to-fuchsia-300/10",
    questions: [
      {
        id: "B1",
        points: 180,
        timeLimit: 18,
        question: "Jika λ = 0, transformasi Box-Cox setara dengan...",
        options: ["Akar kuadrat", "Logaritma", "Kuadrat", "Inverse"],
        answer: 1,
        explanation: "Dalam keluarga Box-Cox, λ = 0 bersesuaian dengan transformasi logaritma.",
      },
      {
        id: "B2",
        points: 190,
        timeLimit: 18,
        question: "Tujuan utama transformasi Box-Cox adalah...",
        options: [
          "Memperbesar ukuran sampel",
          "Membuat data lebih mendekati normal",
          "Menghilangkan semua korelasi",
          "Mengubah mean menjadi nol",
        ],
        answer: 1,
        explanation: "Box-Cox membantu membuat distribusi data lebih mendekati normal.",
      },
      {
        id: "B3",
        points: 200,
        timeLimit: 20,
        question: "Nilai λ yang mendekati 1 biasanya menunjukkan bahwa...",
        options: [
          "Perlu log transform",
          "Tidak perlu transformasi berarti",
          "Data harus dibalik",
          "Pasti ada outlier",
        ],
        answer: 1,
        explanation: "Jika λ mendekati 1, bentuk asli data biasanya sudah cukup baik.",
      },
    ],
  },
  {
    key: "quiz",
    title: "Quiz Arena",
    icon: Sparkles,
    accent: "from-amber-300/30 to-yellow-200/10",
    questions: [
      {
        id: "Q1",
        points: 120,
        timeLimit: 15,
        question: "Distribusi normal ganda secara visual cenderung berbentuk...",
        options: ["Segitiga", "Ellips / ellipsoid", "Persegi", "Garis lurus"],
        answer: 1,
        explanation: "Contour distribusi normal ganda berbentuk ellips atau ellipsoid.",
      },
      {
        id: "Q2",
        points: 130,
        timeLimit: 15,
        question: "Jika kovarians nol pada komponen-komponen normal ganda, maka komponen tersebut...",
        options: ["Identik", "Independen", "Semua nol", "Tak bisa dianalisis"],
        answer: 1,
        explanation: "Dalam distribusi normal ganda, kovarians nol mengindikasikan independensi.",
      },
      {
        id: "Q3",
        points: 140,
        timeLimit: 15,
        question: "Jika secara marginal ada minimal satu variabel yang tidak normal, data dapat dicurigai...",
        options: [
          "Mendekati normal multivariat",
          "Tidak normal multivariat",
          "Homogen",
          "Pasti independen",
        ],
        answer: 1,
        explanation: "Normalitas marginal yang gagal sering menjadi sinyal non-normalitas multivariat.",
      },
    ],
  },
];

function randomRoomCode() {
  return `MVN-${Math.floor(1000 + Math.random() * 9000)}`;
}

function sortTeams(list) {
  return [...list].sort((a, b) => (b.score || 0) - (a.score || 0) || a.name.localeCompare(b.name));
}

function getRound(room) {
  if (!room) return null;
  return ROUNDS[room.currentRoundIndex] || null;
}

function getQuestion(room) {
  if (!room) return null;
  const round = ROUNDS[room.currentRoundIndex];
  return round?.questions?.[room.currentQuestionIndex] || null;
}

function calcScore(basePoints, startedAt, submittedAt, timeLimit, streak) {
  const elapsed = Math.max(0, Math.floor((submittedAt - startedAt) / 1000));
  const speedBonus = Math.max(0, (timeLimit - elapsed) * 2);
  const streakBonus = streak >= 2 ? 25 : 0;
  return basePoints + speedBonus + streakBonus;
}

function initials(name) {
  return (name || "T")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function AnimatedBackground() {
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.14),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.14),transparent_22%),radial-gradient(circle_at_60%_80%,rgba(251,191,36,0.10),transparent_20%),linear-gradient(180deg,#020617_0%,#020617_25%,#0f172a_100%)]" />
      <motion.div
        className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl"
        animate={{ x: [0, 120, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 80, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, -60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: 4 + (i % 4),
            height: 4 + (i % 4),
            left: `${(i * 7) % 100}%`,
            top: `${(i * 11) % 100}%`,
          }}
          animate={{
            y: [0, -25 - (i % 6) * 8, 0],
            x: [0, (i % 5) * 4 - 8, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 5 + (i % 5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
    </div>
  );
}

function SceneShell({ children }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden text-slate-100">
      <AnimatedBackground />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4 md:p-6">
        {children}
      </div>
    </div>
  );
}

function Glass({ children, className = "" }) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-slate-900/70 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

function CountdownRing({ value, max }) {
  const safeMax = Math.max(max || 1, 1);
  const safeValue = clamp(value || 0, 0, safeMax);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = safeValue / safeMax;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2">
      <div className="relative h-14 w-14">
        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={radius} stroke="rgba(255,255,255,0.10)" strokeWidth="6" fill="none" />
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke="url(#timerGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
          {safeValue}
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Countdown</div>
        <div className="text-sm font-semibold text-slate-200">Detik tersisa</div>
      </div>
    </div>
  );
}

function TopBar({ room, teams, currentRound, currentQuestion, timeLeft, identity }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <MiniPill icon={Database} text={room?.code || "-"} />
        <MiniPill icon={currentRound?.icon || Sparkles} text={currentRound?.title || "Belum mulai"} />
        {currentQuestion ? <MiniPill icon={TimerReset} text={`${timeLeft}s`} /> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <MiniPill icon={Users} text={`${teams.length}/${room?.maxTeams || MAX_TEAMS} tim`} />
        <MiniPill icon={identity?.role === "host" ? Crown : LogIn} text={identity?.role === "host" ? "Host" : "Tim"} />
      </div>
    </div>
  );
}

function MiniPill({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  );
}

function LeaderboardCompact({ teams, currentTeamId }) {
  const sorted = sortTeams(teams);
  return (
    <Glass className="h-full p-4">
      <div className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Trophy className="h-5 w-5 text-amber-300" />
        Leaderboard
      </div>
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            Belum ada tim.
          </div>
        ) : (
          sorted.map((team, idx) => (
            <div
              key={team.id}
              className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${
                currentTeamId === team.id
                  ? "border-cyan-400/30 bg-cyan-400/10"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 text-center font-bold text-slate-300">{idx + 1}</div>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-slate-950"
                  style={{ background: team.color }}
                >
                  {initials(team.name)}
                </div>
                <div>
                  <div className="font-semibold text-white">{team.name}</div>
                  <div className="text-xs text-slate-400">streak {team.streak || 0}</div>
                </div>
              </div>
              <div className="text-right font-black text-white">{team.score || 0}</div>
            </div>
          ))
        )}
      </div>
    </Glass>
  );
}

function SceneCard({ children, className = "" }) {
  return (
    <Glass className={`w-full max-w-6xl p-4 md:p-6 ${className}`}>
      {children}
    </Glass>
  );
}

function EntryScene({ role, setRole, hostName, setHostName, teamName, setTeamName, teamColor, setTeamColor, createRoom, joinRoom, roomCodeInput, setRoomCodeInput, dbReady, error }) {
  return (
    <SceneShell>
      <SceneCard className="max-w-5xl">
        <div className="grid h-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-200">
              <Sparkles className="h-4 w-4" />
              MVN Battle Arena
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Battle Arena</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Mode multiplayer realtime untuk materi Analisis Multivariat. Host bikin room, tiap tim join dari device masing-masing, lalu semua score sync otomatis.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatBox label="Database" value={dbReady ? "Connected" : "Connecting"} icon={Database} />
              <StatBox label="Max Tim" value={String(MAX_TEAMS)} icon={Users} />
              <StatBox label="Round" value={String(ROUNDS.length)} icon={Sparkles} />
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit rounded-2xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setRole("host")}
                className={`rounded-xl px-4 py-2 font-semibold ${role === "host" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
              >
                Host
              </button>
              <button
                onClick={() => setRole("team")}
                className={`rounded-xl px-4 py-2 font-semibold ${role === "team" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
              >
                Tim
              </button>
            </div>

            <AnimatePresence mode="wait">
              {role === "host" ? (
                <motion.div
                  key="host"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="mb-4 flex items-center gap-2 text-xl font-bold">
                    <Crown className="h-5 w-5 text-cyan-300" />
                    Mode Host
                  </div>
                  <label className="mb-2 block text-sm text-slate-400">Nama Host</label>
                  <input
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none"
                  />
                  <button
                    onClick={createRoom}
                    disabled={!dbReady}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    Buat Room
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="mb-4 flex items-center gap-2 text-xl font-bold">
                    <LogIn className="h-5 w-5 text-cyan-300" />
                    Join sebagai Tim
                  </div>
                  <label className="mb-2 block text-sm text-slate-400">Kode Room</label>
                  <input
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none"
                    placeholder="MVN-1234"
                  />
                  <label className="mb-2 block text-sm text-slate-400">Nama Tim</label>
                  <input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none"
                    placeholder="Tim Sigma"
                  />
                  <label className="mb-2 block text-sm text-slate-400">Warna Tim</label>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {TEAM_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setTeamColor(c)}
                        className={`h-10 w-10 rounded-2xl border-2 ${teamColor === c ? "border-white scale-105" : "border-transparent"}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={joinRoom}
                    disabled={!dbReady}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <LogIn className="h-4 w-4" />
                    Join Room
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SceneCard>
    </SceneShell>
  );
}

function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function LobbyScene({ room, teams, identity, currentRound, startGame, resetRoom }) {
  return (
    <SceneShell>
      <SceneCard className="h-[92vh]">
        <div className="grid h-full gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex h-full flex-col gap-4">
            <TopBar room={room} teams={teams} currentRound={currentRound} identity={identity} />
            <div className="flex flex-1 flex-col items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 p-8 text-center">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                className="mb-6 rounded-full border border-cyan-300/20 bg-cyan-400/10 p-6"
              >
                <Play className="h-12 w-12 text-cyan-200" />
              </motion.div>
              <div className="mb-2 text-sm uppercase tracking-[0.25em] text-cyan-300">Lobby</div>
              <h2 className="text-4xl font-black">Room siap dimainkan</h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Bagikan kode room ke semua tim. Setelah semua peserta masuk, host bisa langsung memulai permainan.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <MiniPill icon={Database} text={room.code} />
                <MiniPill icon={Users} text={`${teams.length}/${room.maxTeams || MAX_TEAMS} tim bergabung`} />
              </div>

              {identity?.role === "host" ? (
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={startGame}
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    <Play className="h-4 w-4" />
                    Start Game
                  </button>
                  <button
                    onClick={resetRoom}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset Room
                  </button>
                </div>
              ) : (
                <div className="mt-10 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-3 text-emerald-100">
                  Menunggu host memulai permainan...
                </div>
              )}
            </div>
          </div>
          <LeaderboardCompact teams={teams} currentTeamId={identity?.teamId} />
        </div>
      </SceneCard>
    </SceneShell>
  );
}

function QuestionScene({ room, teams, identity, currentRound, currentQuestion, myAnswer, answersCount, timeLeft, submitAnswer, revealAnswer }) {
  return (
    <SceneShell>
      <SceneCard className="h-[92vh]">
        <div className="grid h-full gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex h-full flex-col gap-4">
            <TopBar
              room={room}
              teams={teams}
              currentRound={currentRound}
              currentQuestion={currentQuestion}
              timeLeft={timeLeft}
              identity={identity}
            />

            <div className={`flex flex-1 flex-col rounded-[28px] border border-white/10 bg-gradient-to-br ${currentRound?.accent || "from-cyan-400/10 to-slate-950"} p-5 md:p-6`}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <MiniPill icon={currentRound.icon} text={currentRound.title} />
                <MiniPill icon={Sparkles} text={`Soal ${room.currentQuestionIndex + 1}/${currentRound.questions.length}`} />
                <MiniPill icon={Users} text={`Jawaban ${answersCount}/${teams.length}`} />
              </div>

              <div className="flex flex-1 flex-col justify-center">
                <h2 className="text-3xl font-black leading-tight md:text-5xl">{currentQuestion.question}</h2>

                <div className="mt-8 grid gap-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const selected = myAnswer?.choice === idx;
                    const locked = !!myAnswer;
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => submitAnswer(idx)}
                        disabled={identity?.role !== "team" || locked || timeLeft <= 0}
                        className={`rounded-3xl border px-5 py-5 text-left transition ${
                          selected
                            ? "border-cyan-300 bg-cyan-400/10 text-cyan-100"
                            : "border-white/10 bg-slate-950/45 hover:bg-white/[0.06]"
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ${
                              selected ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-slate-200"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-semibold">{opt}</div>
                            {selected ? (
                              <div className="mt-1 text-sm text-cyan-200">Jawaban timmu sudah terkirim</div>
                            ) : locked ? (
                              <div className="mt-1 text-sm text-slate-400">Pilihan lain dikunci</div>
                            ) : null}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid h-full gap-4">
            <Glass className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Round live</div>
                  <div className="text-xl font-black">{currentRound.title}</div>
                </div>
                <CountdownRing value={timeLeft} max={currentQuestion.timeLimit} />
              </div>

              {identity?.role === "host" ? (
                <button
                  onClick={revealAnswer}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400"
                >
                  <ChevronRight className="h-4 w-4" />
                  Reveal Answer
                </button>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                  {myAnswer ? "Jawaban sudah terkirim. Tunggu host membuka hasil." : "Pilih jawaban sebelum waktu habis."}
                </div>
              )}
            </Glass>

            <LeaderboardCompact teams={teams} currentTeamId={identity?.teamId} />
          </div>
        </div>
      </SceneCard>
    </SceneShell>
  );
}

function RevealScene({ room, teams, identity, currentRound, currentQuestion, myAnswer, nextStep }) {
  return (
    <SceneShell>
      <SceneCard className="h-[92vh]">
        <div className="grid h-full gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex h-full flex-col gap-4">
            <TopBar room={room} teams={teams} currentRound={currentRound} identity={identity} />
            <div className="flex flex-1 flex-col justify-center rounded-[28px] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/12 to-slate-950/20 p-8">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
                <Sparkles className="h-4 w-4" />
                Hasil Soal
              </div>
              <h2 className="text-3xl font-black md:text-5xl">
                Jawaban benar: {String.fromCharCode(65 + currentQuestion.answer)}.{" "}
                {currentQuestion.options[currentQuestion.answer]}
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{currentQuestion.explanation}</p>

              {identity?.role === "team" ? (
                <div className="mt-8">
                  {myAnswer ? (
                    myAnswer.choice === currentQuestion.answer ? (
                      <StatusBox icon={CheckCircle2} tone="emerald" title="Jawaban timmu benar">
                        Skor sudah ditambahkan ke leaderboard.
                      </StatusBox>
                    ) : (
                      <StatusBox icon={XCircle} tone="rose" title="Jawaban timmu belum tepat">
                        Streak untuk soal ini di-reset.
                      </StatusBox>
                    )
                  ) : (
                    <StatusBox icon={XCircle} tone="rose" title="Timmu tidak mengirim jawaban">
                      Tidak ada skor tambahan untuk soal ini.
                    </StatusBox>
                  )}
                </div>
              ) : null}

              {identity?.role === "host" ? (
                <div className="mt-8">
                  <button
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    <ChevronRight className="h-4 w-4" />
                    {room.currentQuestionIndex >= currentRound.questions.length - 1
                      ? room.currentRoundIndex >= ROUNDS.length - 1
                        ? "Ke Final Leaderboard"
                        : "Ke Round Summary"
                      : "Next Question"}
                  </button>
                </div>
              ) : (
                <div className="mt-8 text-slate-400">Menunggu host melanjutkan permainan...</div>
              )}
            </div>
          </div>

          <LeaderboardCompact teams={teams} currentTeamId={identity?.teamId} />
        </div>
      </SceneCard>
    </SceneShell>
  );
}

function StatusBox({ icon: Icon, title, children, tone = "emerald" }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : "border-rose-400/20 bg-rose-400/10 text-rose-100";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5" />
        <div>
          <div className="font-semibold">{title}</div>
          <div className="mt-1 text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}

function RoundSummaryScene({ room, teams, identity, currentRound, startNextRound }) {
  const sortedRound = [...teams].sort(
    (a, b) =>
      (b.roundScores?.[currentRound.key] || 0) - (a.roundScores?.[currentRound.key] || 0) ||
      (b.score || 0) - (a.score || 0)
  );

  return (
    <SceneShell>
      <SceneCard className="h-[92vh]">
        <div className="grid h-full gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-4">
            <TopBar room={room} teams={teams} currentRound={currentRound} identity={identity} />
            <div className="flex flex-1 flex-col justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-400/10 to-indigo-400/10 p-8">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-100">
                <Medal className="h-4 w-4" />
                Round Summary
              </div>
              <h2 className="text-3xl font-black md:text-5xl">{currentRound.title} selesai</h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Lihat hasil round ini, lalu lanjut ke ronde berikutnya.
              </p>

              {identity?.role === "host" ? (
                <div className="mt-8">
                  <button
                    onClick={startNextRound}
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    <Play className="h-4 w-4" />
                    Start Next Round
                  </button>
                </div>
              ) : (
                <div className="mt-8 text-slate-400">Menunggu host memulai ronde berikutnya...</div>
              )}
            </div>
          </div>

          <Glass className="p-4">
            <div className="mb-3 flex items-center gap-2 text-lg font-bold">
              <Trophy className="h-5 w-5 text-amber-300" />
              Skor Round Ini
            </div>
            <div className="space-y-2">
              {sortedRound.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center font-bold text-slate-300">{idx + 1}</div>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-slate-950"
                      style={{ background: team.color }}
                    >
                      {initials(team.name)}
                    </div>
                    <div className="font-semibold text-white">{team.name}</div>
                  </div>
                  <div className="font-black text-white">{team.roundScores?.[currentRound.key] || 0}</div>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      </SceneCard>
    </SceneShell>
  );
}

function FinalScene({ room, teams, identity, resetRoom }) {
  const sorted = sortTeams(teams);
  return (
    <SceneShell>
      <SceneCard className="h-[92vh]">
        <div className="grid h-full gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-4">
            <TopBar room={room} teams={teams} identity={identity} />
            <div className="flex flex-1 flex-col justify-center rounded-[28px] border border-amber-300/20 bg-gradient-to-br from-amber-300/12 to-slate-950/20 p-8">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm text-amber-100">
                <Trophy className="h-4 w-4" />
                Final Leaderboard
              </div>
              <h2 className="text-3xl font-black md:text-5xl">Game Selesai</h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Berikut hasil akhir pertandingan semua tim.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {sorted.slice(0, 3).map((team, idx) => (
                  <div
                    key={team.id}
                    className={`rounded-3xl border p-5 ${
                      idx === 0
                        ? "border-yellow-300/30 bg-yellow-300/10"
                        : idx === 1
                        ? "border-slate-300/20 bg-slate-300/10"
                        : "border-orange-300/20 bg-orange-300/10"
                    }`}
                  >
                    <div className="mb-3 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white">
                      #{idx + 1}
                    </div>
                    <div className="text-xl font-black text-white">{team.name}</div>
                    <div className="mt-2 text-slate-200">{team.score || 0} poin</div>
                  </div>
                ))}
              </div>

              {identity?.role === "host" ? (
                <div className="mt-8">
                  <button
                    onClick={resetRoom}
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset ke Lobby
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <LeaderboardCompact teams={teams} currentTeamId={identity?.teamId} />
        </div>
      </SceneCard>
    </SceneShell>
  );
}

export default function MVNBattleArenaRealtimeDB() {
  const [db, setDb] = useState(null);
  const [connectError, setConnectError] = useState("");
  const [role, setRole] = useState("host");
  const [hostName, setHostName] = useState("Host Praktikum");
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0]);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [identity, setIdentity] = useState(null);
  const [room, setRoom] = useState(null);
  const [now, setNow] = useState(Date.now());
  const unsubRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const database = getDatabase(app);
      setDb(database);
    } catch (err) {
      setConnectError(err?.message || "Gagal konek ke Realtime Database.");
    }
  }, []);

  useEffect(() => {
    if (!db || !roomCode) return;
    if (unsubRef.current) unsubRef.current();

    const roomRef = ref(db, `rooms/${roomCode}`);
    unsubRef.current = onValue(roomRef, (snapshot) => {
      setRoom(snapshot.exists() ? snapshot.val() : null);
    });

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [db, roomCode]);

  const teams = useMemo(() => Object.values(room?.teams || {}), [room]);
  const currentRound = useMemo(() => getRound(room), [room]);
  const currentQuestion = useMemo(() => getQuestion(room), [room]);

  const myAnswer = useMemo(() => {
    if (!room?.answers || !identity?.teamId) return null;
    return room.answers[identity.teamId] || null;
  }, [room, identity]);

  const answersCount = room?.answers ? Object.keys(room.answers).length : 0;

  const timeLeft = useMemo(() => {
    if (!room?.questionStartedAt || !currentQuestion || room.phase !== "question") {
      return currentQuestion?.timeLimit || 0;
    }
    const elapsed = Math.floor((now - room.questionStartedAt) / 1000);
    return Math.max(0, currentQuestion.timeLimit - elapsed);
  }, [room, currentQuestion, now]);

  const createRoom = async () => {
    if (!db) return;
    const code = randomRoomCode();
    const firstQ = ROUNDS[0].questions[0];

    const roomData = {
      code,
      hostName: hostName || "Host",
      maxTeams: MAX_TEAMS,
      phase: "lobby",
      currentRoundIndex: 0,
      currentQuestionIndex: 0,
      currentQuestionId: firstQ.id,
      questionStartedAt: null,
      processedQuestionId: null,
      answers: {},
      teams: {},
      createdAt: Date.now(),
    };

    await set(ref(db, `rooms/${code}`), roomData);
    setIdentity({ role: "host" });
    setRoomCode(code);
  };

  const joinRoom = async () => {
    if (!db) return;

    const code = roomCodeInput.trim().toUpperCase();
    const cleanTeamName = teamName.trim();

    if (!code || !cleanTeamName) return;

    const roomSnap = await get(ref(db, `rooms/${code}`));
    if (!roomSnap.exists()) return;

    const roomData = roomSnap.val();
    const teamCount = Object.keys(roomData.teams || {}).length;
    if (teamCount >= (roomData.maxTeams || MAX_TEAMS)) return;

    const teamId = `${cleanTeamName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()
      .toString()
      .slice(-4)}`;

    const teamData = {
      id: teamId,
      name: cleanTeamName,
      color: teamColor,
      score: 0,
      streak: 0,
      roundScores: {
        contour: 0,
        outlier: 0,
        boxcox: 0,
        quiz: 0,
      },
      joinedAt: Date.now(),
    };

    await update(ref(db, `rooms/${code}`), {
      [`teams/${teamId}`]: teamData,
    });

    setIdentity({ role: "team", teamId });
    setRoomCode(code);
  };

  const startGame = async () => {
    if (!db || !roomCode) return;
    const firstQ = ROUNDS[0].questions[0];

    await update(ref(db, `rooms/${roomCode}`), {
      phase: "question",
      currentRoundIndex: 0,
      currentQuestionIndex: 0,
      currentQuestionId: firstQ.id,
      questionStartedAt: Date.now(),
      processedQuestionId: null,
      answers: {},
    });
  };

  const submitAnswer = async (optionIndex) => {
    if (!db || !roomCode || identity?.role !== "team" || room?.phase !== "question" || !currentQuestion) return;
    if (myAnswer) return;

    await update(ref(db, `rooms/${roomCode}`), {
      [`answers/${identity.teamId}`]: {
        choice: optionIndex,
        submittedAt: Date.now(),
      },
    });
  };

  const revealAnswer = async () => {
    if (!db || !roomCode || identity?.role !== "host" || !currentQuestion || !room) return;
    if (room.processedQuestionId === currentQuestion.id) return;

    const nextTeams = { ...(room.teams || {}) };

    teams.forEach((team) => {
      const submitted = room.answers?.[team.id];
      const correct = submitted?.choice === currentQuestion.answer;

      if (correct) {
        const gained = calcScore(
          currentQuestion.points,
          room.questionStartedAt || Date.now(),
          submitted.submittedAt || Date.now(),
          currentQuestion.timeLimit,
          team.streak || 0
        );

        nextTeams[team.id] = {
          ...team,
          score: (team.score || 0) + gained,
          streak: (team.streak || 0) + 1,
          roundScores: {
            ...(team.roundScores || {}),
            [currentRound.key]: (team.roundScores?.[currentRound.key] || 0) + gained,
          },
        };
      } else {
        nextTeams[team.id] = { ...team, streak: 0 };
      }
    });

    await update(ref(db, `rooms/${roomCode}`), {
      phase: "reveal",
      processedQuestionId: currentQuestion.id,
      revealAt: Date.now(),
      teams: nextTeams,
    });
  };

  const nextStep = async () => {
    if (!db || !roomCode || identity?.role !== "host" || !currentQuestion || !room) return;

    const round = ROUNDS[room.currentRoundIndex];
    const lastQuestionInRound = room.currentQuestionIndex >= round.questions.length - 1;

    if (!lastQuestionInRound) {
      const nextQuestionIndex = room.currentQuestionIndex + 1;
      const nextQuestion = round.questions[nextQuestionIndex];

      await update(ref(db, `rooms/${roomCode}`), {
        phase: "question",
        currentQuestionIndex: nextQuestionIndex,
        currentQuestionId: nextQuestion.id,
        questionStartedAt: Date.now(),
        processedQuestionId: null,
        answers: {},
      });
      return;
    }

    const lastRound = room.currentRoundIndex >= ROUNDS.length - 1;
    if (!lastRound) {
      await update(ref(db, `rooms/${roomCode}`), {
        phase: "roundSummary",
      });
      return;
    }

    await update(ref(db, `rooms/${roomCode}`), {
      phase: "final",
    });
  };

  const startNextRound = async () => {
    if (!db || !roomCode || identity?.role !== "host" || !room) return;
    const nextRoundIndex = room.currentRoundIndex + 1;
    const nextRound = ROUNDS[nextRoundIndex];
    if (!nextRound) return;

    const nextQuestion = nextRound.questions[0];

    await update(ref(db, `rooms/${roomCode}`), {
      phase: "question",
      currentRoundIndex: nextRoundIndex,
      currentQuestionIndex: 0,
      currentQuestionId: nextQuestion.id,
      questionStartedAt: Date.now(),
      processedQuestionId: null,
      answers: {},
    });
  };

  const resetRoom = async () => {
    if (!db || !roomCode || identity?.role !== "host") return;

    const resetTeams = Object.fromEntries(
      teams.map((team) => [
        team.id,
        {
          ...team,
          score: 0,
          streak: 0,
          roundScores: {
            contour: 0,
            outlier: 0,
            boxcox: 0,
            quiz: 0,
          },
        },
      ])
    );

    const firstQ = ROUNDS[0].questions[0];

    await update(ref(db, `rooms/${roomCode}`), {
      phase: "lobby",
      currentRoundIndex: 0,
      currentQuestionIndex: 0,
      currentQuestionId: firstQ.id,
      questionStartedAt: null,
      processedQuestionId: null,
      answers: {},
      teams: resetTeams,
    });
  };

  const sceneKey = room
    ? `${room.phase}-${room.currentRoundIndex}-${room.currentQuestionIndex}`
    : `entry-${role}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        initial={{ opacity: 0, scale: 1.015 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        {!roomCode || !identity ? (
          <EntryScene
            role={role}
            setRole={setRole}
            hostName={hostName}
            setHostName={setHostName}
            teamName={teamName}
            setTeamName={setTeamName}
            teamColor={teamColor}
            setTeamColor={setTeamColor}
            createRoom={createRoom}
            joinRoom={joinRoom}
            roomCodeInput={roomCodeInput}
            setRoomCodeInput={setRoomCodeInput}
            dbReady={!!db}
            error={connectError}
          />
        ) : room?.phase === "lobby" ? (
          <LobbyScene
            room={room}
            teams={teams}
            identity={identity}
            currentRound={currentRound}
            startGame={startGame}
            resetRoom={resetRoom}
          />
        ) : room?.phase === "question" ? (
          <QuestionScene
            room={room}
            teams={teams}
            identity={identity}
            currentRound={currentRound}
            currentQuestion={currentQuestion}
            myAnswer={myAnswer}
            answersCount={answersCount}
            timeLeft={timeLeft}
            submitAnswer={submitAnswer}
            revealAnswer={revealAnswer}
          />
        ) : room?.phase === "reveal" ? (
          <RevealScene
            room={room}
            teams={teams}
            identity={identity}
            currentRound={currentRound}
            currentQuestion={currentQuestion}
            myAnswer={myAnswer}
            nextStep={nextStep}
          />
        ) : room?.phase === "roundSummary" ? (
          <RoundSummaryScene
            room={room}
            teams={teams}
            identity={identity}
            currentRound={currentRound}
            startNextRound={startNextRound}
          />
        ) : (
          <FinalScene room={room} teams={teams} identity={identity} resetRoom={resetRoom} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
