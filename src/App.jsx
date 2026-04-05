import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp } from "firebase/app";
import { getDatabase, get, onValue, ref, set, update } from "firebase/database";
import {
  Trophy,
  Users,
  Play,
  ChevronRight,
  Radio,
  TimerReset,
  CheckCircle2,
  XCircle,
  Sparkles,
  Shield,
  Crown,
  Wifi,
  Smartphone,
  LayoutGrid,
  RefreshCw,
  Eye,
  LogIn,
  PlusCircle,
  Medal,
  Target,
  FlaskConical,
  Orbit,
  HelpCircle,
  Database,
} from "lucide-react";

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
    accent: "from-sky-400/20 to-cyan-400/5",
    description: "Tentukan inside/outside contour dan pahami arah serta ukuran ellips.",
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
        explanation: "Titik ada di dalam contour jika nilai (X-μ)'Σ⁻¹(X-μ) tidak melebihi batas kritis chi-square untuk contour tersebut.",
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
        explanation: "Contour 95% mencakup area peluang lebih besar, sehingga ellips terlihat lebih besar.",
      },
    ],
  },
  {
    key: "outlier",
    title: "Outlier Detective",
    icon: Target,
    accent: "from-rose-400/20 to-orange-400/5",
    description: "Temukan outlier multivariat dan baca chi-square plot.",
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
        explanation: "Bila data mendekati normal multivariat, ordered distance dan quantile teoritis cenderung mengikuti garis lurus.",
      },
      {
        id: "O2",
        points: 150,
        timeLimit: 18,
        question: "Jarak yang digunakan untuk mendeteksi outlier multivariat pada modul adalah...",
        options: ["Euclidean", "Manhattan", "Mahalanobis", "Minkowski"],
        answer: 2,
        explanation: "Mahalanobis distance memperhitungkan kovarians, sehingga cocok untuk deteksi outlier multivariat.",
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
        explanation: "Penyimpangan besar dari garis acuan biasanya menunjukkan outlier atau distribusi yang tidak normal multivariat.",
      },
    ],
  },
  {
    key: "boxcox",
    title: "Box-Cox Rescue",
    icon: FlaskConical,
    accent: "from-violet-400/20 to-fuchsia-400/5",
    description: "Pilih transformasi yang tepat agar data lebih mendekati normal.",
    questions: [
      {
        id: "B1",
        points: 180,
        timeLimit: 18,
        question: "Jika λ = 0, transformasi Box-Cox setara dengan...",
        options: ["Akar kuadrat", "Logaritma", "Kuadrat", "Inverse"],
        answer: 1,
        explanation: "Dalam keluarga Box-Cox, λ = 0 bersesuaian dengan transformasi logaritma natural.",
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
        explanation: "Transformasi Box-Cox dipakai untuk membantu memenuhi asumsi normalitas dengan membuat distribusi lebih simetris.",
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
        explanation: "Jika λ mendekati 1, bentuk asli data sudah cukup baik sehingga transformasi besar biasanya tidak diperlukan.",
      },
    ],
  },
  {
    key: "quiz",
    title: "Quiz Arena",
    icon: Sparkles,
    accent: "from-amber-300/20 to-yellow-300/5",
    description: "Rekap semua konsep inti dalam ronde cepat penutup.",
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
        explanation: "Dalam distribusi normal ganda, kovarians nol mengimplikasikan independensi.",
      },
      {
        id: "Q3",
        points: 140,
        timeLimit: 15,
        question: "Jika secara marginal ada minimal satu variabel yang tidak normal, data dapat dicurigai...",
        options: ["Mendekati normal multivariat", "Tidak normal multivariat", "Homogen", "Pasti independen"],
        answer: 1,
        explanation: "Pelanggaran normalitas marginal pada satu atau lebih variabel adalah sinyal kuat bahwa normalitas multivariat meragukan.",
      },
    ],
  },
];

function randomRoomCode() {
  return `MVN-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getQuestion(room) {
  if (!room) return null;
  return ROUNDS[room.currentRoundIndex]?.questions?.[room.currentQuestionIndex] || null;
}

function getRound(room) {
  if (!room) return null;
  return ROUNDS[room.currentRoundIndex] || null;
}

function calcScore(basePoints, startedAt, submittedAt, timeLimit, streak) {
  const elapsed = Math.max(0, Math.floor((submittedAt - startedAt) / 1000));
  const speedBonus = Math.max(0, (timeLimit - elapsed) * 2);
  const streakBonus = streak >= 2 ? 25 : 0;
  return basePoints + speedBonus + streakBonus;
}

function sortTeams(list) {
  return [...list].sort((a, b) => (b.score || 0) - (a.score || 0) || a.name.localeCompare(b.name));
}

function initials(name) {
  return (name || "T")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
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

export default function MVNBattleArenaRealtimeDB() {
  const [firebaseText, setFirebaseText] = useState(`{
  "apiKey": "AIzaSyCNd6lwterU9IFBkW_JRUpGFs-atr26LYY",
  "authDomain": "artemiz-52b29.firebaseapp.com",
  "databaseURL": "https://artemiz-52b29-default-rtdb.firebaseio.com/",
  "projectId": "artemiz-52b29",
  "storageBucket": "artemiz-52b29.firebasestorage.app",
  "messagingSenderId": "445196205174",
  "appId": "1:445196205174:web:fb6517e8668ef84a1ccf357",
  "measurementId": "G-Y1Z15T1DWG"
}`);
  const [db, setDb] = useState(null);
  const [connectError, setConnectError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("host");
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
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const teams = useMemo(() => Object.values(room?.teams || {}), [room]);
  const currentQuestion = useMemo(() => getQuestion(room), [room]);
  const currentRound = useMemo(() => getRound(room), [room]);
  const sortedTeams = useMemo(() => sortTeams(teams), [teams]);
  const myTeam = useMemo(() => teams.find((t) => t.id === identity?.teamId), [teams, identity]);
  const myAnswer = useMemo(() => {
    if (!room?.answers || !identity?.teamId) return null;
    return room.answers[identity.teamId] || null;
  }, [room, identity]);
  const answersCount = room?.answers ? Object.keys(room.answers).length : 0;
  const timeLeft = useMemo(() => {
    if (!room?.questionStartedAt || !currentQuestion || room.phase !== "question") return currentQuestion?.timeLimit || 0;
    const elapsed = Math.floor((now - room.questionStartedAt) / 1000);
    return Math.max(0, currentQuestion.timeLimit - elapsed);
  }, [room, currentQuestion, now]);

  const connectRealtimeDatabase = async () => {
    try {
      setConnectError("");
      const cfg = JSON.parse(firebaseText);
      if (!cfg.databaseURL) {
        throw new Error("Isi field databaseURL dari Realtime Database milikmu terlebih dulu.");
      }
      const app = initializeApp(cfg, `mvn-rtdb-${Date.now()}`);
      const database = getDatabase(app);
      setDb(database);
      setNotice("Realtime Database terhubung. Host bisa buat room dan tim bisa join dari device masing-masing.");
    } catch (err) {
      setConnectError(err?.message || "Gagal membaca config Realtime Database.");
    }
  };

  const subscribeRoom = (code) => {
    if (unsubRef.current) unsubRef.current();
    const roomRef = ref(db, `rooms/${code}`);
    unsubRef.current = onValue(roomRef, (snapshot) => {
      setRoom(snapshot.exists() ? snapshot.val() : null);
    });
  };

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
    subscribeRoom(code);
    setNotice(`Room ${code} berhasil dibuat di Realtime Database.`);
  };

  const joinRoom = async () => {
    if (!db) return;
    const code = roomCodeInput.trim().toUpperCase();
    const cleanTeamName = teamName.trim();
    if (!code || !cleanTeamName) {
      setNotice("Masukkan kode room dan nama tim terlebih dulu.");
      return;
    }
    const roomSnap = await get(ref(db, `rooms/${code}`));
    if (!roomSnap.exists()) {
      setNotice("Room tidak ditemukan.");
      return;
    }
    const roomData = roomSnap.val();
    const teamCount = Object.keys(roomData.teams || {}).length;
    if (teamCount >= (roomData.maxTeams || MAX_TEAMS)) {
      setNotice("Room sudah penuh. Batas maksimal 12 tim.");
      return;
    }
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
    subscribeRoom(code);
    setNotice(`Berhasil join ke room ${code}.`);
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
    if (!db || !roomCode || identity?.role !== "team" || !currentQuestion || room?.phase !== "question") return;
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
        nextTeams[team.id] = {
          ...team,
          streak: 0,
        };
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
    if (!db || !roomCode || identity?.role !== "host" || !room || !currentQuestion) return;
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
    if (!db || !roomCode || identity?.role !== "host" || !room) return;
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

  const renderLeaderboard = (roundOnly = false) => {
    const roundKey = currentRound?.key;
    const list = roundOnly && roundKey
      ? [...teams].sort((a, b) => (b.roundScores?.[roundKey] || 0) - (a.roundScores?.[roundKey] || 0) || (b.score || 0) - (a.score || 0))
      : sortedTeams;
    return (
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Tim</th>
              <th className="px-4 py-3 text-left">{roundOnly ? "Skor Round" : "Total"}</th>
              <th className="px-4 py-3 text-left">Streak</th>
            </tr>
          </thead>
          <tbody>
            {list.map((team, idx) => (
              <tr key={team.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-semibold text-white">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-black text-slate-950 shadow-lg" style={{ background: team.color }}>
                      {initials(team.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{team.name}</div>
                      <div className="text-xs text-slate-400">{team.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-white">{roundOnly ? team.roundScores?.[roundKey] || 0 : team.score || 0}</td>
                <td className="px-4 py-3 text-slate-300">{team.streak || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const currentRoundProgress = room && currentRound
    ? ((room.currentQuestionIndex + (room.phase === "reveal" || room.phase === "roundSummary" || room.phase === "final" ? 1 : 0)) / currentRound.questions.length) * 100
    : 0;

  const isHost = identity?.role === "host";
  const isTeam = identity?.role === "team";
  const CurrentRoundIcon = currentRound?.icon || Sparkles;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#020617_28%,#0f172a_100%)] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="relative overflow-hidden rounded-[32px] border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.15),transparent_24%),radial-gradient(circle_at_0%_100%,rgba(129,140,248,0.16),transparent_26%)]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-200">
                <Radio className="h-4 w-4" /> Multiplayer Realtime • Realtime Database • Max {MAX_TEAMS} Tim
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">MVN Battle Arena</h1>
              <p className="mt-3 text-base leading-7 text-slate-300 sm:text-lg">
                Versi ini sudah diganti dari Firestore ke <strong>Firebase Realtime Database</strong>, jadi lebih cocok untuk kebutuhan demo gratis dengan host + room + device per tim.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                <Tag icon={Database} text="Sinkron via Realtime Database" />
                <Tag icon={Smartphone} text="Setiap tim dari device masing-masing" />
                <Tag icon={Users} text={`Batas ${MAX_TEAMS} tim`} />
              </div>
            </div>
            <div className="grid w-full max-w-md grid-cols-2 gap-3 lg:w-[360px]">
              <MetricCard label="Mode" value="Realtime" icon={Radio} />
              <MetricCard label="DB" value="RTDB" icon={Database} />
              <MetricCard label="Round" value={String(ROUNDS.length)} icon={Sparkles} />
              <MetricCard label="Status" value={db ? "Connected" : "Offline"} icon={db ? CheckCircle2 : HelpCircle} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <GlassCard>
            <SectionTitle
              icon={Shield}
              title="Koneksi Realtime Database"
              subtitle="Masukkan config Firebase Web App. Pastikan field databaseURL milik Realtime Database sudah terisi."
              action={
                <button onClick={connectRealtimeDatabase} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
                  <Wifi className="h-4 w-4" /> Connect RTDB
                </button>
              }
            />
            <textarea
              value={firebaseText}
              onChange={(e) => setFirebaseText(e.target.value)}
              className="min-h-[180px] w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 font-mono text-sm text-slate-200 outline-none ring-0"
            />
            <div className="mt-4 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
              Isi <strong>databaseURL</strong> dari menu <strong>Realtime Database</strong> di Firebase Console. Biasanya formatnya seperti <code>https://NAMAPROJECT-default-rtdb.asia-southeast1.firebasedatabase.app</code>.
            </div>
            {connectError ? <p className="mt-3 text-sm text-rose-300">{connectError}</p> : null}
            {db ? <p className="mt-3 text-sm text-emerald-300">Realtime Database terkoneksi.</p> : null}
          </GlassCard>

          <GlassCard>
            <SectionTitle
              icon={LayoutGrid}
              title="Masuk ke Room"
              subtitle="Pilih mode host atau tim. Semua state tersimpan di Realtime Database."
            />
            <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
              <button onClick={() => setTab("host")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${tab === "host" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}>
                <Crown className="h-4 w-4" /> Host
              </button>
              <button onClick={() => setTab("team")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${tab === "team" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}>
                <LogIn className="h-4 w-4" /> Tim Join
              </button>
            </div>

            {tab === "host" ? (
              <div className="space-y-4">
                <Field label="Nama Host">
                  <input value={hostName} onChange={(e) => setHostName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none" />
                </Field>
                <InfoPanel icon={PlusCircle} title="Buat room baru">
                  Room memakai limit <strong>{MAX_TEAMS} tim</strong> dan struktur data realtime yang sudah cocok untuk host + join dari banyak device.
                </InfoPanel>
                <button disabled={!db} onClick={createRoom} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">
                  <PlusCircle className="h-4 w-4" /> Create Room
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="Kode Room">
                  <input value={roomCodeInput} onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())} placeholder="Contoh: MVN-1234" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none" />
                </Field>
                <Field label="Nama Tim">
                  <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Misal: Tim Sigma" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none" />
                </Field>
                <Field label="Warna Tim">
                  <div className="flex flex-wrap gap-2">
                    {TEAM_COLORS.map((c) => (
                      <button key={c} onClick={() => setTeamColor(c)} className={`h-11 w-11 rounded-2xl border-2 transition ${teamColor === c ? "border-white scale-105" : "border-transparent"}`} style={{ background: c }} />
                    ))}
                  </div>
                </Field>
                <button disabled={!db} onClick={joinRoom} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50">
                  <LogIn className="h-4 w-4" /> Join Room
                </button>
              </div>
            )}
            {notice ? <p className="mt-4 text-sm text-cyan-200">{notice}</p> : null}
          </GlassCard>
        </div>

        {room ? (
          <>
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <GlassCard>
                <SectionTitle
                  icon={Radio}
                  title="Status Room"
                  subtitle="Semua device membaca state yang sama dari Realtime Database."
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <InfoBox label="Kode Room" value={room.code} />
                  <InfoBox label="Fase" value={getPhaseLabel(room.phase)} />
                  <InfoBox label="Host" value={room.hostName} />
                  <InfoBox label="Tim Join" value={`${teams.length}/${room.maxTeams || MAX_TEAMS}`} />
                </div>
                <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <CurrentRoundIcon className="h-4 w-4" /> Progress Round
                  </div>
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{currentRound?.title || "Belum dimulai"}</span>
                    <span>{Math.round(currentRoundProgress)}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-500" style={{ width: `${currentRoundProgress}%` }} />
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {ROUNDS.map((round, idx) => {
                    const Icon = round.icon;
                    const active = room.currentRoundIndex === idx;
                    const done = room.currentRoundIndex > idx || room.phase === "final";
                    return (
                      <div key={round.key} className={`rounded-3xl border p-4 ${active ? `bg-gradient-to-br ${round.accent} border-cyan-400/20` : done ? "border-emerald-400/20 bg-emerald-400/10" : "border-white/10 bg-white/5"}`}>
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-2"><Icon className="h-5 w-5" /></div>
                          <div>
                            <div className="font-semibold">{round.title}</div>
                            <div className="mt-1 text-sm text-slate-400">{round.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              <GlassCard>
                <SectionTitle
                  icon={Users}
                  title="Daftar Tim"
                  subtitle="Leaderboard live sekaligus daftar tim yang sudah terhubung."
                />
                <div className="space-y-3">
                  {teams.length === 0 ? (
                    <EmptyState icon={Users} title="Belum ada tim" desc="Minta tiap tim join menggunakan kode room yang sudah dibagikan host." />
                  ) : (
                    sortedTeams.map((team, idx) => (
                      <div key={team.id} className={`flex items-center justify-between gap-4 rounded-3xl border p-4 ${identity?.teamId === team.id ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/5"}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-slate-950 shadow-lg" style={{ background: team.color }}>
                            {initials(team.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{team.name}</div>
                            <div className="text-xs text-slate-400">#{idx + 1} • streak {team.streak || 0}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-white">{team.score || 0}</div>
                          <div className="text-xs text-slate-400">poin</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="mt-6 rounded-[32px] border border-white/10 bg-slate-900/80 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-6">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                    <CurrentRoundIcon className="h-4 w-4" /> {currentRound?.title || "Room"}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{currentRound?.title || "Menunggu"}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">{currentRound?.description || "Menunggu room aktif."}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {currentQuestion ? (
                    <StatPill icon={TimerReset} label={`Timer ${room.phase === "question" ? `${timeLeft}s` : `${currentQuestion.timeLimit}s`}`} tone="amber" />
                  ) : null}
                  <StatPill icon={Users} label={`Jawaban ${answersCount}/${teams.length}`} tone="cyan" />
                  {identity ? <StatPill icon={identity.role === "host" ? Crown : Smartphone} label={identity.role === "host" ? "Mode Host" : `Mode Tim${myTeam ? ` • ${myTeam.name}` : ""}`} tone="slate" /> : null}
                </div>
              </div>

              {room.phase === "lobby" ? (
                <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                  <GlassSubCard>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-200"><Play className="h-5 w-5" /></div>
                      <div>
                        <h3 className="text-xl font-bold">Lobby Siap</h3>
                        <p className="mt-1 text-sm text-slate-400">Semua tim bisa tetap di layar masing-masing sambil menunggu host memulai game.</p>
                      </div>
                    </div>
                    {isHost ? (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button onClick={startGame} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
                          <Play className="h-4 w-4" /> Start Game
                        </button>
                        <button onClick={resetRoom} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/15">
                          <RefreshCw className="h-4 w-4" /> Reset Room
                        </button>
                      </div>
                    ) : (
                      <InfoPanel icon={Smartphone} title="Menunggu host">
                        Host akan memulai round pertama saat semua tim siap. Kamu tetap stay di device ini.
                      </InfoPanel>
                    )}
                  </GlassSubCard>
                  <div>{renderLeaderboard(false)}</div>
                </div>
              ) : null}

              {room.phase === "question" && currentQuestion ? (
                <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6"
                  >
                    <RoundVisualPanel
                      round={currentRound}
                      question={currentQuestion}
                      questionIndex={room.currentQuestionIndex}
                      totalQuestions={currentRound.questions.length}
                      timeLeft={timeLeft}
                      answersCount={answersCount}
                      totalTeams={teams.length}
                    />

                    <GlassSubCard className={`bg-gradient-to-br ${currentRound?.accent || "from-cyan-400/10 to-slate-950"}`}>
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-sm text-slate-200">
                          Soal {room.currentQuestionIndex + 1}/{currentRound.questions.length}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-sm text-slate-200">
                          {currentQuestion.points} poin dasar
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-sm text-slate-200">
                          <TimerReset className="h-4 w-4" /> {timeLeft}s tersisa
                        </div>
                      </div>
                      <h3 className="text-2xl font-black leading-tight sm:text-3xl">{currentQuestion.question}</h3>
                      <div className="mt-5 grid gap-3">
                        <AnimatePresence mode="popLayout">
                          {currentQuestion.options.map((opt, idx) => {
                            const selected = myAnswer?.choice === idx;
                            const locked = isTeam && !!myAnswer;
                            return (
                              <motion.button
                                key={idx}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2, delay: idx * 0.04 }}
                                onClick={() => submitAnswer(idx)}
                                disabled={!isTeam || !!myAnswer || timeLeft <= 0}
                                className={`group rounded-3xl border px-4 py-4 text-left transition ${selected ? "border-cyan-400 bg-cyan-400/10 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]" : "border-white/10 bg-slate-950/50 hover:border-white/20 hover:bg-white/[0.06]"} disabled:cursor-not-allowed disabled:opacity-70`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl text-sm font-black ${selected ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-slate-200 group-hover:bg-white/15"}`}>
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold">{opt}</div>
                                    {selected ? <div className="mt-1 text-xs text-cyan-200">Jawaban timmu terkirim</div> : null}
                                    {locked && !selected ? <div className="mt-1 text-xs text-slate-400">Pilihan lain otomatis terkunci</div> : null}
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                      <div className="mt-5">
                        {isTeam ? (
                          myAnswer ? (
                            <InfoPanel icon={CheckCircle2} title="Jawaban terkirim" tone="emerald">
                              Timmu sudah mengirim jawaban. Tunggu host membuka hasil.
                            </InfoPanel>
                          ) : (
                            <InfoPanel icon={TimerReset} title="Pilih sebelum timer habis">
                              Setelah jawaban dikirim, pilihan akan langsung terkunci untuk timmu.
                            </InfoPanel>
                          )
                        ) : (
                          <InfoPanel icon={Eye} title="Panel host">
                            Host memantau jumlah jawaban masuk dan membuka hasil saat semua tim siap.
                          </InfoPanel>
                        )}
                      </div>
                    </GlassSubCard>
                  </motion.div>

                  <div className="space-y-6">
                    <GlassSubCard>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold">Kontrol Host</h3>
                          <p className="mt-1 text-sm text-slate-400">Reveal answer akan menghitung skor semua tim secara realtime.</p>
                        </div>
                        <CountdownRing value={timeLeft} max={currentQuestion.timeLimit} />
                      </div>
                      {isHost ? (
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button onClick={revealAnswer} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400">
                            <Eye className="h-4 w-4" /> Reveal Answer
                          </button>
                        </div>
                      ) : (
                        <InfoPanel icon={Crown} title="Hanya host">
                          Tim tidak bisa memindahkan fase permainan. Semua sinkron dari panel host.
                        </InfoPanel>
                      )}
                    </GlassSubCard>
                    <div>{renderLeaderboard(false)}</div>
                  </div>
                </div>
              ) : null}

              {room.phase === "reveal" && currentQuestion ? (
                <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                  <GlassSubCard className="border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-slate-950/30">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
                      <Sparkles className="h-4 w-4" /> Hasil Soal
                    </div>
                    <h3 className="text-2xl font-black leading-tight">Jawaban benar: {String.fromCharCode(65 + currentQuestion.answer)}. {currentQuestion.options[currentQuestion.answer]}</h3>
                    <p className="mt-4 text-slate-200">{currentQuestion.explanation}</p>
                    <div className="mt-5">
                      {isTeam ? (
                        myAnswer ? (
                          myAnswer.choice === currentQuestion.answer ? (
                            <InfoPanel icon={CheckCircle2} title="Benar" tone="emerald">
                              Jawaban timmu benar. Skor sudah masuk ke leaderboard.
                            </InfoPanel>
                          ) : (
                            <InfoPanel icon={XCircle} title="Belum tepat" tone="rose">
                              Jawaban timmu belum tepat. Streak di-reset untuk soal ini.
                            </InfoPanel>
                          )
                        ) : (
                          <InfoPanel icon={XCircle} title="Tidak mengirim jawaban" tone="rose">
                            Timmu belum mengirim jawaban untuk soal ini.
                          </InfoPanel>
                        )
                      ) : null}
                    </div>
                    {isHost ? (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button onClick={nextStep} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
                          <ChevronRight className="h-4 w-4" />
                          {room.currentQuestionIndex >= currentRound.questions.length - 1 ? (room.currentRoundIndex >= ROUNDS.length - 1 ? "Ke Final Leaderboard" : "Ke Round Summary") : "Next Question"}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-5 text-sm text-slate-400">Menunggu host melanjutkan permainan.</div>
                    )}
                  </GlassSubCard>
                  <div>{renderLeaderboard(false)}</div>
                </div>
              ) : null}

              {room.phase === "roundSummary" ? (
                <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                  <GlassSubCard>
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200"><Medal className="h-5 w-5" /></div>
                      <div>
                        <h3 className="text-2xl font-black">Round Summary</h3>
                        <p className="mt-2 text-slate-300">{currentRound?.title} selesai. Cek skor round ini dan total akumulasi semua round.</p>
                      </div>
                    </div>
                    {isHost ? (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button onClick={startNextRound} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
                          <Play className="h-4 w-4" /> Start Next Round
                        </button>
                      </div>
                    ) : (
                      <div className="mt-5 text-sm text-slate-400">Menunggu host memulai round berikutnya.</div>
                    )}
                  </GlassSubCard>
                  <div className="space-y-6">
                    <div>
                      <div className="mb-3 text-sm font-semibold text-slate-300">Skor Round Ini</div>
                      {renderLeaderboard(true)}
                    </div>
                    <div>
                      <div className="mb-3 text-sm font-semibold text-slate-300">Total Skor</div>
                      {renderLeaderboard(false)}
                    </div>
                  </div>
                </div>
              ) : null}

              {room.phase === "final" ? (
                <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                  <GlassSubCard className="border-amber-300/20 bg-gradient-to-br from-amber-300/10 to-slate-950/30">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm text-amber-100">
                      <Trophy className="h-4 w-4" /> Game Selesai
                    </div>
                    <h3 className="text-3xl font-black">Final Leaderboard</h3>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      {sortedTeams.slice(0, 3).map((team, idx) => (
                        <div key={team.id} className={`rounded-3xl border p-5 ${idx === 0 ? "border-yellow-300/30 bg-yellow-300/10" : idx === 1 ? "border-slate-300/20 bg-slate-300/10" : "border-orange-300/20 bg-orange-300/10"}`}>
                          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white">#{idx + 1}</div>
                          <div className="text-xl font-black text-white">{team.name}</div>
                          <div className="mt-2 text-slate-200">{team.score || 0} poin</div>
                        </div>
                      ))}
                    </div>
                    {isHost ? (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button onClick={resetRoom} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
                          <RefreshCw className="h-4 w-4" /> Reset ke Lobby
                        </button>
                      </div>
                    ) : null}
                  </GlassSubCard>
                  <div>{renderLeaderboard(false)}</div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/70 p-6">
          <SectionTitle icon={Sparkles} title="Catatan penting Realtime Database" subtitle="Checklist yang perlu kamu lengkapi supaya versi gratis ini benar-benar jalan." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard icon={Database} title="Isi databaseURL" desc="Field ini wajib di config, beda dengan Firestore. Tanpa ini app tidak bisa connect ke RTDB." />
            <FeatureCard icon={Users} title="Device per tim" desc="Setiap tim tetap di device masing-masing, bukan bergiliran di satu layar." />
            <FeatureCard icon={Crown} title="Host otoritatif" desc="Host yang start game, reveal jawaban, pindah soal, dan reset room." />
            <FeatureCard icon={Trophy} title="Leaderboard realtime" desc="Skor total, streak, dan skor round akan tersinkron otomatis di semua device." />
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children }) {
  return <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">{children}</div>;
}

function GlassSubCard({ children, className = "" }) {
  return <div className={`rounded-[28px] border border-white/10 bg-white/5 p-6 ${className}`}>{children}</div>;
}

function SectionTitle({ icon: Icon, title, subtitle, action = null }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-cyan-200"><Icon className="h-5 w-5" /></div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function InfoPanel({ icon: Icon, title, children, tone = "slate" }) {
  const toneClass = {
    slate: "border-white/10 bg-slate-950/50 text-slate-200",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  }[tone];
  return (
    <div className={`rounded-3xl border p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5"><Icon className="h-5 w-5" /></div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="mt-1 text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-slate-400"><Icon className="h-4 w-4" /> <span className="text-xs uppercase tracking-[0.16em]">{label}</span></div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function Tag({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
      <Icon className="h-4 w-4 text-cyan-300" />
      <span>{text}</span>
    </div>
  );
}

function StatPill({ icon: Icon, label, tone = "slate" }) {
  const toneClass = {
    slate: "border-white/10 bg-white/5 text-slate-200",
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  }[tone];
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${toneClass}`}>
      <Icon className="h-4 w-4" /> {label}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-slate-950/50 p-2 text-cyan-200"><Icon className="h-5 w-5" /></div>
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
    </div>
  );
}

function CountdownRing({ value, max }) {
  const safeMax = Math.max(max || 1, 1);
  const safeValue = Math.max(0, Math.min(value || 0, safeMax));
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
        <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">{safeValue}</div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Countdown</div>
        <div className="text-sm font-semibold text-slate-200">Detik tersisa</div>
      </div>
    </div>
  );
}

function RoundVisualPanel({ round, question, questionIndex, totalQuestions, timeLeft, answersCount, totalTeams }) {
  const Icon = round?.icon || Sparkles;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${round?.accent || "from-cyan-400/10 to-slate-950"} p-6`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.10),transparent_20%),radial-gradient(circle_at_0%_100%,rgba(255,255,255,0.08),transparent_24%)]" />
      <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_220px]">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-sm text-slate-200">
            <Icon className="h-4 w-4" /> {round?.title}
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Stage Aktif</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            {question?.question}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <MiniStat label="Soal" value={`${questionIndex + 1}/${totalQuestions}`} />
            <MiniStat label="Jawaban Masuk" value={`${answersCount}/${totalTeams}`} />
            <MiniStat label="Timer" value={`${timeLeft}s`} />
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-slate-950/40"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
              className="absolute h-32 w-32 rounded-full border border-cyan-300/30"
            />
            <motion.div
              animate={{ scale: [1.08, 1, 1.08] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              className="absolute h-24 w-24 rounded-full border border-indigo-300/30"
            />
            <div className="relative z-10 rounded-3xl border border-white/10 bg-white/10 p-4 text-white shadow-2xl backdrop-blur">
              <Icon className="h-10 w-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
      <div className="mx-auto mb-3 inline-flex rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-slate-300"><Icon className="h-6 w-6" /></div>
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm text-slate-400">{desc}</p>
    </div>
  );
}
