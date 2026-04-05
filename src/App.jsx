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
  Radio,
  Shield,
  Star,
  WandSparkles,
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
    accent: "from-sky-400/30 via-cyan-300/10 to-transparent",
    summary: "Baca contour dan pahami logika ellips multivariat.",
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
    accent: "from-rose-400/30 via-orange-300/10 to-transparent",
    summary: "Cari penyimpangan dan baca chi-square plot seperti detektif.",
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
    accent: "from-violet-400/30 via-fuchsia-300/10 to-transparent",
    summary: "Selamatkan distribusi dengan transformasi yang tepat.",
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
    accent: "from-amber-300/30 via-yellow-200/10 to-transparent",
    summary: "Final rush untuk mengunci kemenangan.",
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
        question:
          "Jika secara marginal ada minimal satu variabel yang tidak normal, data dapat dicurigai...",
        options: [
          "Mendekati normal multivariat",
          "Tidak normal multivariat",
          "Homogen",
          "Pasti independen",
        ],
        answer: 1,
        explanation:
          "Normalitas marginal yang gagal sering menjadi sinyal non-normalitas multivariat.",
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

function getPhaseLabel(phase) {
  const map = {
    lobby: "Lobby",
    question: "Question Live",
    reveal: "Reveal Answer",
    roundSummary: "Round Summary",
    final: "Final Leaderboard",
  };
  return map[phase] || phase || "-";
}

function SceneShell({ children }) {
  return (
    <div className="relative h-[100dvh] overflow-hidden bg-slate-950 text-slate-100">
      <AnimatedBackdrop />
      <div className="relative z-10 flex h-full items-center justify-center p-3 md:p-4">
        {children}
      </div>
    </div>
  );
}

function AnimatedBackdrop() {
  const particles = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_82%_10%,rgba(168,85,247,0.16),transparent_22%),radial-gradient(circle_at_60%_82%,rgba(251,191,36,0.11),transparent_18%),linear-gradient(180deg,#020617_0%,#020617_25%,#0f172a_100%)]" />
      <motion.div
        className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl"
        animate={{ x: [0, 120, 0], y: [0, 60, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-500/12 blur-3xl"
        animate={{ x: [0, -90, 0], y: [0, 80, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, -70, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:54px_54px] opacity-20" />
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: 3 + (i % 4),
            height: 3 + (i % 4),
            left: `${(i * 13) % 100}%`,
            top: `${(i * 17) % 100}%`,
          }}
          animate={{
            y: [0, -16 - (i % 5) * 8, 0],
            x: [0, (i % 7) * 3 - 9, 0],
            opacity: [0.15, 0.65, 0.15],
          }}
          transition={{
            duration: 4.5 + (i % 5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        />
      ))}
    </div>
  );
}

function Glass({ children, className = "" }) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-slate-900/72 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

function StageCard({ children, className = "" }) {
  return (
    <Glass className={`h-[calc(100dvh-24px)] w-full max-w-[1500px] overflow-hidden p-3 md:h-[calc(100dvh-32px)] md:p-4 ${className}`}>
      {children}
    </Glass>
  );
}

function BrandHeader({ dbReady }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/45 px-4 py-3">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" /> MVN Battle Arena
        </div>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Realtime Quiz Show</h1>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
        <Database className="h-4 w-4" /> {dbReady ? "Realtime Database Connected" : "Connecting Database"}
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

function HUDBar({ room, teams, currentRound, currentQuestion, timeLeft, identity }) {
  const RoundIcon = currentRound?.icon || Sparkles;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/45 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <MiniPill icon={Database} text={room?.code || "No Room"} />
        <MiniPill icon={RoundIcon} text={currentRound?.title || "Belum mulai"} />
        {currentQuestion ? <MiniPill icon={TimerReset} text={`${timeLeft}s`} /> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <MiniPill icon={Users} text={`${teams.length}/${room?.maxTeams || MAX_TEAMS} tim`} />
        <MiniPill icon={identity?.role === "host" ? Crown : LogIn} text={identity?.role === "host" ? "Host" : "Tim"} />
      </div>
    </div>
  );
}

function CountdownOrb({ value, max }) {
  const safeMax = Math.max(max || 1, 1);
  const safeValue = clamp(value || 0, 0, safeMax);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = safeValue / safeMax;
  const offset = circumference * (1 - progress);

  return (
    <div className="rounded-[26px] border border-white/10 bg-slate-950/55 p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r={radius} stroke="rgba(255,255,255,0.10)" strokeWidth="8" fill="none" />
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="url(#countdownGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
            <defs>
              <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">{safeValue}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Countdown</div>
          <div className="mt-1 text-xl font-black text-white">Detik tersisa</div>
          <div className="mt-1 text-sm text-slate-400">Jawab sebelum timer habis.</div>
        </div>
      </div>
    </div>
  );
}

function RankRail({ teams, currentTeamId, title = "Leaderboard", subtitle = "Skor total semua tim" }) {
  const sorted = sortTeams(teams);
  return (
    <Glass className="flex min-h-0 flex-col p-4">
      <div className="mb-3 flex items-center gap-2 text-xl font-black text-white">
        <Trophy className="h-5 w-5 text-amber-300" /> {title}
      </div>
      <div className="mb-4 text-sm text-slate-400">{subtitle}</div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            Belum ada tim.
          </div>
        ) : (
          sorted.map((team, idx) => (
            <div
              key={team.id}
              className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${
                currentTeamId === team.id ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 text-center font-bold text-slate-300">{idx + 1}</div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black text-slate-950"
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

function SceneTransition({ sceneKey, children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        initial={{ opacity: 0, scale: 1.01, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.995, y: -8 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function RoleCard({ active, title, subtitle, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[24px] border p-5 text-left transition ${
        active ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
      }`}
    >
      <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-slate-950/45 p-2 text-cyan-200">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-lg font-black text-white">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</div>
    </button>
  );
}

function InputField({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-400">{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none transition focus:border-cyan-400/30"
      />
    </div>
  );
}

function ActionButton({ children, onClick, disabled = false, tone = "primary", icon: Icon = Play }) {
  const toneClass =
    tone === "primary"
      ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
      : tone === "success"
      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
      : tone === "indigo"
      ? "bg-indigo-500 text-white hover:bg-indigo-400"
      : "bg-white/10 text-slate-100 hover:bg-white/15";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function TeamColorPicker({ teamColor, setTeamColor }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-400">Warna Tim</div>
      <div className="flex flex-wrap gap-2">
        {TEAM_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setTeamColor(c)}
            className={`h-10 w-10 rounded-2xl border-2 transition ${teamColor === c ? "border-white scale-105" : "border-transparent"}`}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}

function EntryScene({
  dbReady,
  connectError,
  role,
  setRole,
  hostName,
  setHostName,
  teamName,
  setTeamName,
  roomCodeInput,
  setRoomCodeInput,
  teamColor,
  setTeamColor,
  createRoom,
  joinRoom,
}) {
  return (
    <SceneShell>
      <StageCard className="max-w-[1400px]">
        <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
          <div className="flex min-h-0 flex-col rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 p-5 md:p-6">
            <BrandHeader dbReady={dbReady} />
            <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="flex flex-col justify-center rounded-[28px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
                <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                  <WandSparkles className="h-3.5 w-3.5" /> Game Show Mode
                </div>
                <h2 className="text-[clamp(2.2rem,4.4vw,5rem)] font-black leading-[0.98] tracking-tight text-white">
                  Bukan lagi dashboard. Ini arena pertandingan.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                  Host membuat room, tiap tim masuk dari device masing-masing, dan seluruh skor tersinkron realtime di satu panggung yang terasa seperti quiz show.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <StatBox label="Database" value={dbReady ? "Connected" : "Connecting"} icon={Database} />
                  <StatBox label="Maks Tim" value={String(MAX_TEAMS)} icon={Users} />
                  <StatBox label="Rounds" value={String(ROUNDS.length)} icon={Sparkles} />
                </div>
                {connectError ? (
                  <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                    {connectError}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4">
                {ROUNDS.map((round, index) => {
                  const Icon = round.icon;
                  return (
                    <div key={round.key} className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${round.accent} p-5`}>
                      <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-slate-950/45 p-2 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-sm uppercase tracking-[0.18em] text-slate-300">Round {index + 1}</div>
                      <div className="mt-1 text-lg font-black text-white">{round.title}</div>
                      <div className="mt-2 text-sm leading-6 text-slate-300">{round.summary}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/68 p-5 md:p-6">
            <div className="text-xl font-black text-white">Pilih peran</div>
            <div className="grid gap-3 md:grid-cols-2">
              <RoleCard
                active={role === "host"}
                title="Host"
                subtitle="Kontrol penuh room, reveal jawaban, pindah soal, dan reset game."
                icon={Crown}
                onClick={() => setRole("host")}
              />
              <RoleCard
                active={role === "team"}
                title="Tim"
                subtitle="Masuk ke room, jawab soal, dan kejar posisi di leaderboard."
                icon={Users}
                onClick={() => setRole("team")}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <AnimatePresence mode="wait">
                {role === "host" ? (
                  <motion.div
                    key="host-form"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="mb-4 flex items-center gap-2 text-xl font-black text-white">
                      <Shield className="h-5 w-5 text-cyan-300" /> Panel Host
                    </div>
                    <InputField label="Nama Host" value={hostName} onChange={(e) => setHostName(e.target.value)} />
                    <div className="mt-5">
                      <ActionButton onClick={createRoom} disabled={!dbReady} tone="primary" icon={Play}>
                        Buat Room
                      </ActionButton>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="team-form"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="mb-4 flex items-center gap-2 text-xl font-black text-white">
                      <LogIn className="h-5 w-5 text-cyan-300" /> Join sebagai Tim
                    </div>
                    <div className="space-y-4">
                      <InputField
                        label="Kode Room"
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                        placeholder="MVN-1234"
                      />
                      <InputField
                        label="Nama Tim"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Tim Sigma"
                      />
                      <TeamColorPicker teamColor={teamColor} setTeamColor={setTeamColor} />
                      <ActionButton onClick={joinRoom} disabled={!dbReady} tone="success" icon={LogIn}>
                        Join Room
                      </ActionButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </StageCard>
    </SceneShell>
  );
}

function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function LobbyScene({ room, teams, identity, currentRound, startGame, resetRoom }) {
  return (
    <SceneShell>
      <StageCard>
        <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.15fr)_380px]">
          <div className="flex min-h-0 flex-col gap-4">
            <HUDBar room={room} teams={teams} currentRound={currentRound} identity={identity} />
            <Glass className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-cyan-500/10 via-slate-900/60 to-indigo-500/10 p-6 md:p-8">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
                <Radio className="h-4 w-4" /> Lobby aktif
              </div>
              <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="flex flex-col justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-6 inline-flex w-fit rounded-full border border-cyan-300/20 bg-cyan-400/10 p-5 text-cyan-100"
                  >
                    <Play className="h-10 w-10" />
                  </motion.div>
                  <h2 className="text-[clamp(2.4rem,5vw,5.5rem)] font-black leading-[0.95] tracking-tight text-white">
                    Semua tim siap? Saatnya mulai.
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                    Bagikan kode room ke semua peserta. Setelah semua tim masuk, host tinggal tekan Start Game dan layar akan otomatis berpindah ke ronde pertama.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <MiniPill icon={Database} text={`Room ${room.code}`} />
                    <MiniPill icon={Users} text={`${teams.length}/${room.maxTeams || MAX_TEAMS} tim`} />
                    <MiniPill icon={Sparkles} text={getPhaseLabel(room.phase)} />
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {identity?.role === "host" ? (
                      <>
                        <ActionButton onClick={startGame} tone="primary" icon={Play}>
                          Start Game
                        </ActionButton>
                        <ActionButton onClick={resetRoom} tone="secondary" icon={RefreshCw}>
                          Reset Room
                        </ActionButton>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-emerald-100">
                        Menunggu host memulai permainan...
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 content-start">
                  <Glass className="p-4">
                    <div className="mb-3 flex items-center gap-2 text-lg font-black text-white">
                      <Crown className="h-5 w-5 text-cyan-300" /> Host
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-xl font-semibold text-white">
                      {room.hostName}
                    </div>
                  </Glass>
                  <Glass className="p-4">
                    <div className="mb-3 flex items-center gap-2 text-lg font-black text-white">
                      <Star className="h-5 w-5 text-amber-300" /> Urutan round
                    </div>
                    <div className="grid gap-3">
                      {ROUNDS.map((round, idx) => {
                        const Icon = round.icon;
                        const active = room.currentRoundIndex === idx;
                        return (
                          <div
                            key={round.key}
                            className={`rounded-2xl border p-4 ${active ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/[0.04]"}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl border border-white/10 bg-slate-950/45 p-2">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-white">Round {idx + 1} • {round.title}</div>
                                <div className="mt-1 text-sm text-slate-400">{round.summary}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Glass>
                </div>
              </div>
            </Glass>
          </div>

          <RankRail teams={teams} currentTeamId={identity?.teamId} subtitle="Peringkat akan bergerak realtime begitu game dimulai." />
        </div>
      </StageCard>
    </SceneShell>
  );
}

function QuestionScene({
  room,
  teams,
  identity,
  currentRound,
  currentQuestion,
  myAnswer,
  answersCount,
  timeLeft,
  submitAnswer,
  revealAnswer,
}) {
  return (
    <SceneShell>
      <StageCard>
        <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.18fr)_380px]">
          <div className="flex min-h-0 flex-col gap-4">
            <HUDBar
              room={room}
              teams={teams}
              currentRound={currentRound}
              currentQuestion={currentQuestion}
              timeLeft={timeLeft}
              identity={identity}
            />

            <Glass className={`min-h-0 flex-1 overflow-hidden bg-gradient-to-br ${currentRound?.accent || "from-cyan-400/10 to-transparent"} p-5 md:p-6`}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <MiniPill icon={currentRound.icon} text={currentRound.title} />
                <MiniPill icon={Sparkles} text={`Soal ${room.currentQuestionIndex + 1}/${currentRound.questions.length}`} />
                <MiniPill icon={Users} text={`Jawaban ${answersCount}/${teams.length}`} />
                <MiniPill icon={Star} text={`${currentQuestion.points} poin dasar`} />
              </div>

              <div className="grid h-[calc(100%-56px)] min-h-0 gap-5 lg:grid-cols-[minmax(0,1fr)]">
                <div className="flex min-h-0 flex-col">
                  <div className="mb-5 shrink-0">
                    <h2 className="max-w-[18ch] text-[clamp(2rem,3.9vw,4.5rem)] font-black leading-[1.02] tracking-tight text-white">
                      {currentQuestion.question}
                    </h2>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="grid gap-4 md:grid-cols-2">
                      {currentQuestion.options.map((opt, idx) => {
                        const selected = myAnswer?.choice === idx;
                        const locked = !!myAnswer;
                        return (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => submitAnswer(idx)}
                            disabled={identity?.role !== "team" || locked || timeLeft <= 0}
                            className={`rounded-[26px] border px-5 py-5 text-left transition ${
                              selected
                                ? "border-cyan-300 bg-cyan-400/10 text-cyan-100"
                                : "border-white/10 bg-slate-950/45 hover:bg-white/[0.06]"
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black ${
                                  selected ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-slate-200"
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-lg font-semibold leading-7">{opt}</div>
                                {selected ? (
                                  <div className="mt-2 text-sm text-cyan-200">Jawaban timmu sudah terkirim.</div>
                                ) : locked ? (
                                  <div className="mt-2 text-sm text-slate-400">Pilihan lain otomatis terkunci.</div>
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
            </Glass>
          </div>

          <div className="grid min-h-0 gap-4 lg:grid-rows-[auto_minmax(0,1fr)]">
            <Glass className="p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Round Live</div>
                  <div className="mt-1 text-3xl font-black text-white">{currentRound.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{currentRound.summary}</div>
                </div>
                <CountdownOrb value={timeLeft} max={currentQuestion.timeLimit} />
              </div>
              {identity?.role === "host" ? (
                <ActionButton onClick={revealAnswer} tone="indigo" icon={ChevronRight}>
                  Reveal Answer
                </ActionButton>
              ) : myAnswer ? (
                <StatusBanner icon={CheckCircle2} tone="emerald" title="Jawaban terkirim">
                  Tunggu host membuka hasil soal ini.
                </StatusBanner>
              ) : (
                <StatusBanner icon={TimerReset} tone="slate" title="Pilih sebelum waktu habis">
                  Setelah dikirim, jawaban langsung terkunci untuk timmu.
                </StatusBanner>
              )}
            </Glass>
            <RankRail teams={teams} currentTeamId={identity?.teamId} subtitle="Skor bergerak realtime setelah host reveal hasil." />
          </div>
        </div>
      </StageCard>
    </SceneShell>
  );
}

function StatusBanner({ icon: Icon, title, children, tone = "slate" }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : tone === "rose"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
      : "border-white/10 bg-white/[0.04] text-slate-200";
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

function RevealScene({ room, teams, identity, currentRound, currentQuestion, myAnswer, nextStep }) {
  return (
    <SceneShell>
      <StageCard>
        <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.1fr)_380px]">
          <div className="flex min-h-0 flex-col gap-4">
            <HUDBar room={room} teams={teams} currentRound={currentRound} identity={identity} />
            <Glass className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-emerald-400/12 via-slate-900/62 to-slate-900/40 p-6 md:p-8">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
                <Sparkles className="h-4 w-4" /> Reveal Answer
              </div>
              <h2 className="text-[clamp(2.4rem,5vw,5.2rem)] font-black leading-[0.98] tracking-tight text-white">
                Jawaban benar: {String.fromCharCode(65 + currentQuestion.answer)}. {currentQuestion.options[currentQuestion.answer]}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                {currentQuestion.explanation}
              </p>

              {identity?.role === "team" ? (
                <div className="mt-7 max-w-xl">
                  {myAnswer ? (
                    myAnswer.choice === currentQuestion.answer ? (
                      <StatusBanner icon={CheckCircle2} tone="emerald" title="Jawaban timmu benar">
                        Skor sudah ditambahkan ke leaderboard.
                      </StatusBanner>
                    ) : (
                      <StatusBanner icon={XCircle} tone="rose" title="Jawaban timmu belum tepat">
                        Tidak ada poin tambahan untuk soal ini.
                      </StatusBanner>
                    )
                  ) : (
                    <StatusBanner icon={XCircle} tone="rose" title="Timmu tidak mengirim jawaban">
                      Round berikutnya masih bisa dikejar. Tetap fokus.
                    </StatusBanner>
                  )}
                </div>
              ) : null}

              <div className="mt-8">
                {identity?.role === "host" ? (
                  <ActionButton onClick={nextStep} tone="primary" icon={ChevronRight}>
                    {room.currentQuestionIndex >= currentRound.questions.length - 1
                      ? room.currentRoundIndex >= ROUNDS.length - 1
                        ? "Ke Final Leaderboard"
                        : "Ke Round Summary"
                      : "Next Question"}
                  </ActionButton>
                ) : (
                  <div className="text-slate-400">Menunggu host melanjutkan permainan...</div>
                )}
              </div>
            </Glass>
          </div>

          <RankRail teams={teams} currentTeamId={identity?.teamId} subtitle="Skor total setelah hasil dibuka." />
        </div>
      </StageCard>
    </SceneShell>
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
      <StageCard>
        <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.08fr)_380px]">
          <div className="flex min-h-0 flex-col gap-4">
            <HUDBar room={room} teams={teams} currentRound={currentRound} identity={identity} />
            <Glass className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-cyan-400/10 via-slate-900/60 to-indigo-400/10 p-6 md:p-8">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-100">
                <Medal className="h-4 w-4" /> Round Summary
              </div>
              <h2 className="text-[clamp(2.4rem,4.8vw,5rem)] font-black leading-[0.98] tracking-tight text-white">
                {currentRound.title} selesai.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Skor round ini sudah masuk. Lanjutkan untuk menjaga momentum dan mengunci posisi di leaderboard.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {sortedRound.slice(0, 3).map((team, idx) => (
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
                    <div className="mt-2 text-slate-200">{team.roundScores?.[currentRound.key] || 0} poin</div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                {identity?.role === "host" ? (
                  <ActionButton onClick={startNextRound} tone="primary" icon={Play}>
                    Start Next Round
                  </ActionButton>
                ) : (
                  <div className="text-slate-400">Menunggu host memulai ronde berikutnya...</div>
                )}
              </div>
            </Glass>
          </div>

          <RankRail teams={teams} currentTeamId={identity?.teamId} subtitle="Total skor setelah round ini selesai." />
        </div>
      </StageCard>
    </SceneShell>
  );
}

function FinalScene({ room, teams, identity, resetRoom }) {
  const sorted = sortTeams(teams);
  return (
    <SceneShell>
      <StageCard>
        <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.08fr)_380px]">
          <div className="flex min-h-0 flex-col gap-4">
            <HUDBar room={room} teams={teams} identity={identity} />
            <Glass className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-amber-300/12 via-slate-900/60 to-slate-900/40 p-6 md:p-8">
              <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm text-amber-100">
                <Trophy className="h-4 w-4" /> Final Leaderboard
              </div>
              <h2 className="text-[clamp(2.6rem,5vw,5.2rem)] font-black leading-[0.98] tracking-tight text-white">
                Pemenang pertandingan sudah ditentukan.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Berikut tiga besar dan hasil akhir seluruh tim. Gunakan layar ini sebagai momen penutup seperti panggung game show.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {sorted.slice(0, 3).map((team, idx) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
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
                    <div className="text-2xl font-black text-white">{team.name}</div>
                    <div className="mt-2 text-slate-200">{team.score || 0} poin</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8">
                {identity?.role === "host" ? (
                  <ActionButton onClick={resetRoom} tone="primary" icon={RefreshCw}>
                    Reset ke Lobby
                  </ActionButton>
                ) : null}
              </div>
            </Glass>
          </div>
          <RankRail teams={teams} currentTeamId={identity?.teamId} subtitle="Hasil akhir seluruh tim." />
        </div>
      </StageCard>
    </SceneShell>
  );
}

function LoadingScene({ roomCode, role }) {
  return (
    <SceneShell>
      <StageCard className="max-w-3xl">
        <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-white/10 bg-slate-900/55 p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            className="mb-6 rounded-full border border-cyan-300/20 bg-cyan-400/10 p-5 text-cyan-200"
          >
            <Sparkles className="h-10 w-10" />
          </motion.div>
          <div className="text-sm uppercase tracking-[0.24em] text-cyan-200">Syncing Room</div>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-white">Mempersiapkan panggung...</h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
            {role === "host"
              ? `Room ${roomCode} sedang disiapkan.`
              : `Menghubungkan tim ke room ${roomCode}.`}
          </p>
        </div>
      </StageCard>
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

    const teamId = `${cleanTeamName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

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

  const sceneKey = room ? `${room.phase}-${room.currentRoundIndex}-${room.currentQuestionIndex}` : `entry-${role}`;

  return (
    <SceneTransition sceneKey={sceneKey}>
      {!roomCode || !identity ? (
        <EntryScene
          dbReady={!!db}
          connectError={connectError}
          role={role}
          setRole={setRole}
          hostName={hostName}
          setHostName={setHostName}
          teamName={teamName}
          setTeamName={setTeamName}
          roomCodeInput={roomCodeInput}
          setRoomCodeInput={setRoomCodeInput}
          teamColor={teamColor}
          setTeamColor={setTeamColor}
          createRoom={createRoom}
          joinRoom={joinRoom}
        />
      ) : !room ? (
        <LoadingScene roomCode={roomCode} role={identity.role} />
      ) : room.phase === "lobby" ? (
        <LobbyScene
          room={room}
          teams={teams}
          identity={identity}
          currentRound={currentRound}
          startGame={startGame}
          resetRoom={resetRoom}
        />
      ) : room.phase === "question" ? (
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
      ) : room.phase === "reveal" ? (
        <RevealScene
          room={room}
          teams={teams}
          identity={identity}
          currentRound={currentRound}
          currentQuestion={currentQuestion}
          myAnswer={myAnswer}
          nextStep={nextStep}
        />
      ) : room.phase === "roundSummary" ? (
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
    </SceneTransition>
  );
}
