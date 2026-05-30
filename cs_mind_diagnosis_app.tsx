import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  User, 
  Award, 
  TrendingUp, 
  Building, 
  ArrowRight, 
  RotateCcw, 
  Share2, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Briefcase,
  Lock,
  Unlock
} from 'lucide-react';

// ==========================================
// FIREBASE CONFIG & SYSTEM INITIALIZATION
// ==========================================
let app, auth, db, appId;
let isFirebaseActive = false;

// Dynamic environment checks
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
appId = typeof __app_id !== 'undefined' ? __app_id : 'cs-style-solution';

if (firebaseConfigStr) {
  try {
    const { initializeApp } = require('firebase/app');
    const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = require('firebase/auth');
    const { getFirestore, collection, addDoc, onSnapshot } = require('firebase/firestore');

    const firebaseConfig = JSON.parse(firebaseConfigStr);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseActive = true;
  } catch (error) {
    console.error("Firebase initialization failed. Falling back to local state model.", error);
  }
}

// ==========================================
// MOCK DATA (For offline preview & initial seeding)
// ==========================================
const MOCK_SUBMISSIONS = [
  { name: "김민준", department: "고객지원팀", scores: { A: 24, B: 18, C: 12, D: 14, E: 26 }, primaryStyle: "E", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { name: "이서연", department: "고객지원팀", scores: { A: 22, B: 25, C: 15, D: 13, E: 20 }, primaryStyle: "B", createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
  { name: "박우진", department: "영업기획부", scores: { A: 28, B: 22, C: 18, D: 11, E: 15 }, primaryStyle: "A", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { name: "최지아", department: "영업기획부", scores: { A: 19, B: 24, C: 16, D: 15, E: 22 }, primaryStyle: "B", createdAt: new Date(Date.now() - 86400000 * 1.8).toISOString() },
  { name: "정다은", department: "IT기획센터", scores: { A: 21, B: 14, C: 27, D: 16, E: 12 }, primaryStyle: "C", createdAt: new Date(Date.now() - 86400000 * 1.2).toISOString() },
  { name: "강현우", department: "IT기획센터", scores: { A: 16, B: 13, C: 25, D: 22, E: 14 }, primaryStyle: "C", createdAt: new Date(Date.now() - 86400000 * 0.9).toISOString() },
  { name: "윤도현", department: "고객지원팀", scores: { A: 15, B: 18, C: 11, D: 26, E: 21 }, primaryStyle: "D", createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
  { name: "송지효", department: "인재개발원", scores: { A: 23, B: 26, C: 13, D: 12, E: 24 }, primaryStyle: "B", createdAt: new Date(Date.now() - 86400000 * 0.2).toISOString() },
  { name: "한재석", department: "인재개발원", scores: { A: 18, B: 20, C: 14, D: 15, E: 28 }, primaryStyle: "E", createdAt: new Date().toISOString() },
];

// ==========================================
// CONSTANTS & DIAGNOSIS QUESTIONS DEFINITION
// ==========================================
const ADMIN_PASSCODE = "deohagi77"; // 강사용 접속 인증키

const STYLE_INFO = {
  A: {
    title: "명쾌한 신속 해결사 (Analytical Leader)",
    short: "신속·정확·해결 중심",
    color: "from-blue-600 to-indigo-600",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
    barColor: "bg-blue-500",
    desc: "고객의 근본적인 니즈를 한 발 앞서 명쾌하게 파악하고 최적의 솔루션을 제공하는 스마트 해결사입니다. 신뢰성 높은 커뮤니케이션으로 신뢰감을 주지만, 간혹 고객의 장황한 설명을 잘라 효율성만을 쫓는 인상을 줄 수 있습니다.",
    strength: "뛰어난 직관력, 명쾌하고 논리적인 상황 설명, 빠른 문제 해결력",
    weakness: "고객의 감정적 푸념 수용 부족, 다소 서두르는 태도 및 대화 차단 경향",
    tip: "고객의 말이 길어지더라도 성급하게 결론을 내리기보다, 끝까지 경청(Active Listening)하는 자세와 부드러운 쿠션어를 추가하면 더욱 강력한 해결사가 됩니다."
  },
  B: {
    title: "다정한 친근 소통가 (Friendly Socializer)",
    short: "친화력·유머·감정 소통",
    color: "from-amber-500 to-orange-500",
    textColor: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100",
    barColor: "bg-amber-500",
    desc: "마치 오랜 친구를 대하듯 친밀하고 유쾌한 웃음으로 고객의 마음을 사르르 녹이는 매력적인 소통가입니다. 고객과의 심리적 거리를 좁히는 데 탁월하나, 격식 있는 접객을 원하거나 공과 사의 구분을 엄격히 바라는 고객에게는 간혹 당황스러운 경험을 줄 수 있습니다.",
    strength: "탁월한 아이스브레이킹, 긍정적인 분위기 메이킹, 편안한 소통 감각",
    weakness: "엄격하고 세련된 격식 부족, 고객의 예민함에 정색하거나 쉽게 상처받는 편",
    tip: "친근함은 최고의 무기이지만, 처음 만나는 고객이나 다소 격식을 중시해 보이는 고객 앞에서는 바른 자세와 세련된 비즈니스 존칭어를 먼저 확보해두는 것이 안전합니다."
  },
  C: {
    title: "신중한 격식 전문가 (Formal Professional)",
    short: "격식·원칙·신뢰 중심",
    color: "from-slate-700 to-slate-900",
    textColor: "text-slate-800",
    bgColor: "bg-slate-50 border-slate-200",
    barColor: "bg-slate-700",
    desc: "흐트러짐 없는 단정한 태도와 높은 비즈니스 매너, 규정과 약속을 정밀하게 준수하는 신뢰도 만점의 전문가입니다. 빈틈없는 서포트로 높은 안정감을 주지만, 지나치게 냉소적이거나 딱딱하고 경직된 감정을 전달하여 다소 차가워 보일 수 있습니다.",
    strength: "완벽한 격식 소화력, 정확한 가이드라인 안내, 업무의 전문성과 신중함",
    weakness: "인간미 있는 정서적 교감 부족, 사소한 참견이나 개인적 대화에 정색하는 경향",
    tip: "논리와 완벽성 뒤에 따뜻한 눈빛 교환(Eye Contact)과 '감사합니다'와 같은 밝은 톤의 정서적 피드백 한 마디를 얹으면 훨씬 편안한 분위기를 전달할 수 있습니다."
  },
  D: {
    title: "조심스러운 안전 지원가 (Cautious Supporter)",
    short: "경청·조심성·보조 지원",
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
    barColor: "bg-emerald-500",
    desc: "문제를 일으키지 않고 고객을 조심스럽게 존중하며 배려하려 노력하는 사려 깊은 관찰자입니다. 양보와 친절을 지향하지만, 가끔 컴플레인을 들고 강력하게 항의하는 블랙컨슈머나 예측불가 요구를 해오는 고객 앞에서는 답변을 얼버무리며 위축되는 성향이 있습니다.",
    strength: "겸손하고 섬세한 태도, 고객에 대한 강한 예의 및 조심성 있는 대응",
    weakness: "돌발 상황이나 불만 제기 시 대처력 부족, 자신감 없는 수동적 답변",
    tip: "고객에게 '어디까지 해줄 수 있을까' 고민하며 망설이기보다는, '정확하게 확인 후 신속하게 도와드리겠습니다!'라는 당당한 목소리와 전문성 있는 확답 연습이 큰 힘이 됩니다."
  },
  E: {
    title: "지극정성 감성 배려자 (Empathetic Caregiver)",
    short: "꼼꼼·정성·지극정성 배려",
    color: "from-pink-500 to-rose-600",
    textColor: "text-pink-600",
    bgColor: "bg-pink-50 border-pink-100",
    barColor: "bg-pink-500",
    desc: "고객 한 명 한 명을 극진하고 세밀하게 챙겨 상대가 감동하게 만드는 천생 서비스 전문가입니다. 정성 어린 보살핌으로 단골 고객 확보율이 매우 높으나, 감정 소모가 매우 심하고 나를 희생해가며 응대하는 경향이 있어 쉽게 지치거나 번아웃이 올 수 있습니다.",
    strength: "고객 맞춤형 꼼꼼함, 깊은 진심이 묻어나는 환대 태도, 탁월한 공감 능력",
    weakness: "지나치게 깊은 감정 투입으로 인한 에너지 조기 소진, 감정과 업무 분리의 어려움",
    tip: "나의 마음 건강이 좋아야 건강한 정성도 나옵니다. 고객 응대가 끝난 직후에는 의식적으로 심호흡을 하거나 자신을 토닥이며 감정을 분리하는 '셀프 케어' 루틴이 필수로 요구됩니다."
  }
};

const QUESTIONS = [
  { id: 1, text: "본인 욕구를 모른 채 오는 고객들이 많다.", category: "A" },
  { id: 2, text: "매출 정도나 대상에 따른 차별대우는 당연하다.", category: "C" },
  { id: 3, text: "고객들은 대부분 정성스럽고, 꼼꼼한 대우를 바란다.", category: "E" },
  { id: 4, text: "고객에게 먼저 농담이나 친밀감 있는 표현을 잘 건네는 편이다.", category: "B" },
  { id: 5, text: "고객들이 뭔가 물어 올 때 피곤함을 느낄 때가 있다.", category: "D" },
  { id: 6, text: "친한 친구 대하듯 고객을 대한다는 소리를 듣는다.", category: "B" },
  { id: 7, text: "고객을 극진하게 대우하는 편이다.", category: "E" },
  { id: 8, text: "직원도 격식이 있어야 한다.", category: "C" },
  { id: 9, text: "고객의 요청이 맞는지 몇 번이나 확인한다.", category: "D" },
  { id: 10, text: "고객이 묻는 모든 것에 대답할 자신이 있다.", category: "A" },
  { id: 11, text: "고객에게 어디까지 해줘야 하는지 모르겠다.", category: "D" },
  { id: 12, text: "지나치게 개인적인 말을 하거나, 참견하는 고객은 달갑지 않다.", category: "C" },
  { id: 13, text: "고객의 소소한 상황까지 챙겨 고객이 놀랄 때가 있다.", category: "E" },
  { id: 14, text: "고객과 말이 겹치는 경우가 많다.", category: "A" },
  { id: 15, text: "고객에게 칭찬이나 극찬을 잘하는 편이다.", category: "B" },
  { id: 16, text: "바라고 한 건 아닌데, 감사 인사나 감동했다는 말을 듣기도 한다.", category: "E" },
  { id: 17, text: "평소 소극적이라 상대가 말을 건네주길 바란다.", category: "D" },
  { id: 18, text: "매사에 신중하고 쉽게 보이는 스타일이 아니다.", category: "C" },
  { id: 19, text: "내 설명은 명쾌하고 믿을 만하다.", category: "A" },
  { id: 20, text: "재미있게 말을 잘하는 편이다.", category: "B" },
  { id: 21, text: "종종 차가운 인상이고 쉽지가 않아 보인다는 말을 듣는다.", category: "C" },
  { id: 22, text: "고객에게 쉽게 말을 잘 거는 편이다.", category: "B" },
  { id: 23, text: "고객이 따지며 문제 제기할 때, 대답을 못할 때도 많다.", category: "D" },
  { id: 24, text: "결국 고객은 정성을 산다.", category: "E" },
  { id: 25, text: "고객이 뭘 원하는지 '아' 하면 '척' 한다.", category: "A" },
  { id: 26, text: "장난이나 친근함에 정색하는 고객 때문에 언짢은 적이 있다.", category: "B" },
  { id: 27, text: "종종 고객들은 나의 친절을 당황해한다.", category: "E" },
  { id: 28, text: "고객을 조심스럽게 대하는 편이다.", category: "D" },
  { id: 29, text: "고객의 긴 말을 참지 못하고, 말을 끊게 되는 경우가 있다.", category: "A" },
  { id: 30, text: "나도 모르게 종종 고객을 무시하는 태도를 보일 때가 있다.", category: "C" }
];

export default function App() {
  // Navigation & User Info
  const [currentTab, setCurrentTab] = useState('intro'); // 'intro', 'test', 'result', 'org', 'admin-auth'
  const [userName, setUserName] = useState('');
  const [userDept, setUserDept] = useState('');
  
  // Administrator state
  const [isTrainer, setIsTrainer] = useState(false); 
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Real-time Database state
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [user, setUser] = useState(null);

  // Test state
  const [answers, setAnswers] = useState({}); // { questionId: score }
  const [testProgress, setTestProgress] = useState(0); // Index of first question on current page
  const questionsPerPage = 5;

  // Personal Result State
  const [finalScores, setFinalScores] = useState(null);
  const [primaryStyle, setPrimaryStyle] = useState(null);

  // Loading animation states
  const [analyzing, setAnalyzing] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Initialize Firebase and listen to database
  useEffect(() => {
    if (!isFirebaseActive) return;

    const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = require('firebase/auth');
    const { getFirestore, collection, query, onSnapshot } = require('firebase/firestore');

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Firebase auth error:", err);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore updates
  useEffect(() => {
    if (!isFirebaseActive || !user) return;

    const { getFirestore, collection, query, onSnapshot } = require('firebase/firestore');
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'));

    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const dataList = [];
      snapshot.forEach((doc) => {
        dataList.push({ id: doc.id, ...doc.data() });
      });
      if (dataList.length > 0) {
        setSubmissions(dataList);
      }
    }, (error) => {
      console.error("Firestore loading error:", error);
    });

    return () => unsubscribeData();
  }, [user]);

  // Handle Custom Dialog Alerts
  const showAlert = (message) => {
    setAlertMsg(message);
  };

  // Start diagnosis handler
  const handleStartTest = (e) => {
    e.preventDefault();
    if (!userName.trim()) return showAlert("이름 혹은 닉네임을 입력해 주세요.");
    if (!userDept.trim()) return showAlert("소속 조직/부서명을 입력해 주세요.");
    
    // Clear previous tests
    setAnswers({});
    setTestProgress(0);
    setCurrentTab('test');
  };

  // Direct Navigation to Admin dashboard with safety filter
  const handleGoToAdmin = () => {
    if (isTrainer) {
      setCurrentTab('org');
    } else {
      setPasscodeInput('');
      setAuthError('');
      setCurrentTab('admin-auth');
    }
  };

  // Admin authentication submission
  const handleAdminVerify = (e) => {
    e.preventDefault();
    if (passcodeInput === ADMIN_PASSCODE) {
      setIsTrainer(true);
      setAuthError('');
      setCurrentTab('org');
    } else {
      setAuthError('인증 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
    }
  };

  // Logout trainer access
  const handleAdminLogout = () => {
    setIsTrainer(false);
    setCurrentTab('intro');
    showAlert('강사 전용 모드가 잠겼습니다. 다시 통계를 보시려면 비밀번호 인증이 필요합니다.');
  };

  // Selection Handler
  const handleAnswerSelect = (qId, score) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
  };

  // Form pagination navigation
  const handleNextPage = () => {
    // Validate that all questions on current page are answered
    const currentPageQuestions = QUESTIONS.slice(testProgress, testProgress + questionsPerPage);
    const unAnswered = currentPageQuestions.filter(q => !answers[q.id]);
    
    if (unAnswered.length > 0) {
      return showAlert("현재 페이지의 모든 문항에 답변을 선택해 주세요.");
    }

    if (testProgress + questionsPerPage < QUESTIONS.length) {
      setTestProgress(prev => prev + questionsPerPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Last page finished, compile results
      calculateAndSubmitResults();
    }
  };

  const handlePrevPage = () => {
    if (testProgress - questionsPerPage >= 0) {
      setTestProgress(prev => prev - questionsPerPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Score Compiler & Firestore Pusher
  const calculateAndSubmitResults = async () => {
    setAnalyzing(true);

    const totals = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    QUESTIONS.forEach(q => {
      const score = answers[q.id] || 3;
      totals[q.category] += score;
    });

    let maxScore = -1;
    let dominant = 'A';
    Object.keys(totals).forEach(cat => {
      if (totals[cat] > maxScore) {
        maxScore = totals[cat];
        dominant = cat;
      }
    });

    setFinalScores(totals);
    setPrimaryStyle(dominant);

    const newSubmission = {
      name: userName,
      department: userDept,
      scores: totals,
      primaryStyle: dominant,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseActive && auth.currentUser) {
      try {
        const { collection, addDoc } = require('firebase/firestore');
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), newSubmission);
      } catch (err) {
        console.error("Failed to push to firebase:", err);
      }
    } else {
      setSubmissions(prev => [newSubmission, ...prev]);
    }

    setTimeout(() => {
      setAnalyzing(false);
      setCurrentTab('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  // =============================================================
  // ANALYTICAL COMPILATION: ORGANIZATION STATISTICS (MEMOIZED)
  // =============================================================
  const orgStats = useMemo(() => {
    if (submissions.length === 0) return null;

    const totalCount = submissions.length;
    const totalsByStyle = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const styleDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const departmentStats = {};

    submissions.forEach(sub => {
      Object.keys(totalsByStyle).forEach(style => {
        totalsByStyle[style] += sub.scores[style];
      });

      if (sub.primaryStyle) {
        styleDistribution[sub.primaryStyle]++;
      }

      const dept = sub.department || "기타";
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          count: 0,
          scores: { A: 0, B: 0, C: 0, D: 0, E: 0 },
          styles: { A: 0, B: 0, C: 0, D: 0, E: 0 }
        };
      }

      departmentStats[dept].count++;
      Object.keys(sub.scores).forEach(style => {
        departmentStats[dept].scores[style] += sub.scores[style];
      });
      if (sub.primaryStyle) {
        departmentStats[dept].styles[sub.primaryStyle]++;
      }
    });

    const averages = {};
    Object.keys(totalsByStyle).forEach(style => {
      averages[style] = Math.round((totalsByStyle[style] / totalCount) * 10) / 10;
    });

    let topCompanyStyle = 'A';
    let maxAvg = 0;
    Object.keys(averages).forEach(style => {
      if (averages[style] > maxAvg) {
        maxAvg = averages[style];
        topCompanyStyle = style;
      }
    });

    const processedDepts = Object.keys(departmentStats).map(deptName => {
      const info = departmentStats[deptName];
      const deptAverages = {};
      Object.keys(info.scores).forEach(style => {
        deptAverages[style] = Math.round((info.scores[style] / info.count) * 10) / 10;
      });

      let topDeptStyle = 'A';
      let maxDeptAvg = 0;
      Object.keys(deptAverages).forEach(style => {
        if (deptAverages[style] > maxDeptAvg) {
          maxDeptAvg = deptAverages[style];
          topDeptStyle = style;
        }
      });

      return {
        name: deptName,
        count: info.count,
        averages: deptAverages,
        dominantStyle: topDeptStyle
      };
    });

    return {
      totalCount,
      averages,
      styleDistribution,
      topCompanyStyle,
      departments: processedDepts
    };
  }, [submissions]);

  const handleResetTest = () => {
    setAnswers({});
    setTestProgress(0);
    setFinalScores(null);
    setPrimaryStyle(null);
    setCurrentTab('intro');
  };

  const handleAddSimulatedUser = () => {
    const randomNames = ["김철수", "이지현", "박성훈", "최미경", "황정민", "배수지", "정해인", "임요한"];
    const randomDepts = ["고객지원팀", "영업기획부", "IT기획센터", "인재개발원", "마케팅본부"];
    const randomScores = {};
    
    let maxVal = 0;
    let domStyle = 'A';
    ['A','B','C','D','E'].forEach(st => {
      const val = Math.floor(Math.random() * 15) + 12;
      randomScores[st] = val;
      if (val > maxVal) {
        maxVal = val;
        domStyle = st;
      }
    });

    const simUser = {
      name: randomNames[Math.floor(Math.random() * randomNames.length)],
      department: randomDepts[Math.floor(Math.random() * randomDepts.length)],
      scores: randomScores,
      primaryStyle: domStyle,
      createdAt: new Date().toISOString()
    };

    setSubmissions(prev => [simUser, ...prev]);
    showAlert(`${simUser.department} ${simUser.name} 님의 가상 진단 데이터가 추가되었습니다.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleResetTest}>
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase block">더하기교육원 솔루션</span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">CS Style Solution</h1>
            </div>
          </div>

          <nav className="flex space-x-2 text-sm font-medium items-center">
            <button 
              onClick={() => setCurrentTab(finalScores ? 'result' : 'intro')}
              className={`px-3 py-1.5 rounded-lg transition ${currentTab === 'intro' || currentTab === 'test' || currentTab === 'result' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              CS 진단하기
            </button>
            <button 
              onClick={handleGoToAdmin}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${currentTab === 'org' || currentTab === 'admin-auth' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {isTrainer ? <Unlock className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4" />}
              <span>조직 통계 대시보드</span>
            </button>
            
            {isTrainer && (
              <button 
                onClick={handleAdminLogout}
                className="ml-2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-1 rounded"
              >
                잠금
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* DIALOG BOX */}
      {alertMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 transform scale-100 transition duration-300">
            <div className="flex items-center space-x-3 text-indigo-600 mb-4">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900">안내 사항</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{alertMsg}</p>
            <button 
              onClick={() => setAlertMsg(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition duration-150 shadow-md shadow-indigo-100"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ANALYZING OVERLAY */}
      {analyzing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md">
          <div className="relative flex flex-col items-center">
            <div className="w-20 h-20 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-7 text-white font-bold animate-pulse">CS</div>
            <p className="mt-8 text-xl font-bold text-white tracking-wide">서비스 마인드 입체 진단 중...</p>
            <p className="mt-2 text-slate-400 text-sm">답변 내용을 분류하고 CS 지표를 실시간 분석하고 있습니다.</p>
          </div>
        </div>
      )}

      {/* CONTAINER */}
      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        {/* ==========================================
            TAB 1: INTRO SCREEN
            ========================================== */}
        {currentTab === 'intro' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Lead Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-50 rounded-full blur-2xl opacity-70"></div>
              
              <div>
                <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-600">더하기교육원 협력 솔루션</span>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  나의 고객 성향과<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
                    CS 스타일 입체 진단
                  </span>
                </h2>
                
                <p className="mt-4 text-slate-600 leading-relaxed text-sm lg:text-base">
                  본 진단 프로그램은 서비스 현장에서 마주하는 다양한 스트레스와 상황 판단 능력을 30가지 문항을 통해 정밀 측정합니다. 
                  진단 완료 시 **나만의 CS 유형 및 성적표**를 즉시 확인하실 수 있습니다.
                </p>

                <div className="mt-8 space-y-3.5">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700"><strong>5대 성향 판별:</strong> 해결사형(A), 소통가형(B), 전문가형(C), 지원가형(D), 배려자형(E)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700"><strong>개별 맞춤 분석:</strong> 교육생 개별 점수와 취약점 개선 행동 팁 제공</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700"><strong>강사 강의 전용:</strong> 전체 조직 및 부서별 비교 통계는 담당 강사만 공개 가능</span>
                  </div>
                </div>
              </div>

              {/* Start Info Form */}
              <form onSubmit={handleStartTest} className="mt-10 border-t border-slate-100 pt-8">
                <h3 className="text-md font-bold text-slate-950 mb-4 flex items-center space-x-2">
                  <Briefcase className="h-4.5 w-4.5 text-indigo-600" />
                  <span>진단 정보 입력</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">이름 또는 닉네임</label>
                    <input 
                      type="text" 
                      placeholder="예: 홍길동"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">소속 부서 / 조직명</label>
                    <input 
                      type="text" 
                      placeholder="예: 고객지원팀, 영업부"
                      value={userDept}
                      onChange={(e) => setUserDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm transition outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100"
                  >
                    <span>마인드 진단 시작하기</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={handleGoToAdmin}
                    className="sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-5 border border-slate-200 rounded-xl transition flex items-center justify-center space-x-2"
                  >
                    <Lock className="h-4 w-4 text-slate-400" />
                    <span>조직 통계 (강사용)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Cards of styles */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Award className="h-56 w-56 transform translate-x-12 translate-y-12" />
                </div>
                <div>
                  <h4 className="text-amber-400 font-bold tracking-wider text-xs uppercase">Diagnosis Categories</h4>
                  <h3 className="text-xl font-bold mt-1">CS 5대 핵심 성향 프로필</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">우리의 비즈니스와 소통 스타일은 어떤 특징이 있을까요?</p>
                </div>
                
                <div className="mt-6 space-y-3">
                  {Object.entries(STYLE_INFO).map(([key, info]) => (
                    <div key={key} className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 p-2 rounded-xl transition duration-150">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-sm">
                        {key}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">{info.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{info.short}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500">현재 통계 인원</h4>
                    <p className="text-lg font-bold text-slate-950">총 {submissions.length}명 참여 중</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  교육생 개인별 응답 결과가 실시간으로 집계되며, 취합된 통계 대시보드는 오직 교육 주관 담당자 및 진행 강사님만 열람할 수 있습니다.
                </p>
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Secure Database Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: RUNNING TEST
            ========================================== */}
        {currentTab === 'test' && (
          <div className="max-w-3xl mx-auto">
            {/* Diagnostic Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase">
                    진단 진행 중
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {userName} 님 / {userDept}
                  </span>
                </div>
                <span className="text-sm font-bold text-indigo-600">
                  {Math.round((Object.keys(answers).length / QUESTIONS.length) * 100)}% 완료
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                  style={{ width: `${(Object.keys(answers).length / QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Questions Container */}
            <div className="space-y-4">
              {QUESTIONS.slice(testProgress, testProgress + questionsPerPage).map((q) => (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:border-slate-300 transition duration-150">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {q.id}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-slate-900 leading-snug">{q.text}</h4>
                      
                      {/* Score Selector Radio system */}
                      <div className="mt-5 grid grid-cols-5 gap-2">
                        {[
                          { score: 1, label: "매우 그렇지 않다" },
                          { score: 2, label: "그렇지 않다" },
                          { score: 3, label: "보통이다" },
                          { score: 4, label: "그렇다" },
                          { score: 5, label: "매우 그렇다" }
                        ].map((item) => (
                          <button
                            key={item.score}
                            type="button"
                            onClick={() => handleAnswerSelect(q.id, item.score)}
                            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition duration-150 ${
                              answers[q.id] === item.score
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
                            }`}
                          >
                            <span className={`text-sm font-extrabold block ${answers[q.id] === item.score ? 'text-white' : 'text-slate-900'}`}>
                              {item.score}점
                            </span>
                            <span className={`text-[10px] mt-1 hidden sm:block opacity-80 ${answers[q.id] === item.score ? 'text-white' : 'text-slate-500'}`}>
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={testProgress === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition flex items-center space-x-1"
              >
                <span>이전 단계</span>
              </button>

              <span className="text-xs text-slate-500 font-medium">
                총 6단계 중 {Math.floor(testProgress / questionsPerPage) + 1}단계
              </span>

              <button
                type="button"
                onClick={handleNextPage}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center space-x-1"
              >
                <span>{testProgress + questionsPerPage >= QUESTIONS.length ? '제출 및 진단완료' : '다음 단계'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: PERSONAL RESULT SCREEN
            ========================================== */}
        {currentTab === 'result' && finalScores && primaryStyle && (
          <div className="space-y-8 animate-fade-in">
            {/* Top diagnostic badge */}
            <div className={`bg-gradient-to-r ${STYLE_INFO[primaryStyle].color} text-white rounded-3xl p-8 shadow-xl relative overflow-hidden`}>
              <div className="absolute right-0 top-0 opacity-10">
                <Award className="h-72 w-72 transform translate-x-12 -translate-y-12" />
              </div>

              <div className="relative">
                <span className="text-xs font-bold tracking-widest text-white/80 bg-white/20 px-3 py-1 rounded-full uppercase">
                  종합 분석 성적표
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-4">
                  {userName} 님의 대표 CS 스타일은
                </h2>
                <h1 className="text-3xl sm:text-5xl font-black mt-2 tracking-tight">
                  "{STYLE_INFO[primaryStyle].title}"
                </h1>
                
                <p className="mt-4 text-white/95 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {STYLE_INFO[primaryStyle].desc}
                </p>
              </div>
            </div>

            {/* Score Grid & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Radar styled scores bar */}
              <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">성향 유형별 다각 진단표</h3>
                  <p className="text-xs text-slate-500 mb-6">각 영역별 최고점수 30점 만점 기준</p>

                  <div className="space-y-4">
                    {Object.entries(STYLE_INFO).map(([key, info]) => {
                      const score = finalScores[key] || 0;
                      const percentage = Math.min(100, (score / 30) * 100);
                      const isDominant = key === primaryStyle;

                      return (
                        <div key={key} className={`p-3.5 rounded-2xl border transition ${isDominant ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center ${isDominant ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                {key}
                              </span>
                              <span className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{info.title}</span>
                              {isDominant && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-md">대표</span>
                              )}
                            </div>
                            <span className="text-sm font-extrabold text-slate-900">{score}점</span>
                          </div>
                          
                          <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${info.barColor}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">전체 부서 통계 비교 (강사용)</h4>
                      <p className="text-[10px] text-slate-500">조직 평균 대시보드 접근에는 보안인증이 필요합니다</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleGoToAdmin}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-100"
                  >
                    <span>강사 전용 인증하기</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Plan Section */}
              <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">성장을 위한 맞춤형 피드백</h3>
                  <p className="text-xs text-slate-500 mb-6 font-semibold text-indigo-600">더하기교육원이 제안하는 핵심 솔루션</p>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <h4 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">성향의 핵심 강점 (Strength)</h4>
                      <p className="text-sm text-slate-800 mt-1.5 leading-relaxed font-semibold">
                        {STYLE_INFO[primaryStyle].strength}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                      <h4 className="text-xs font-extrabold text-rose-700 uppercase tracking-wide">취약점과 보완점 (Weakness)</h4>
                      <p className="text-sm text-slate-800 mt-1.5 leading-relaxed font-semibold">
                        {STYLE_INFO[primaryStyle].weakness}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                      <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wide">성장 실천 전략 (Action Tip)</h4>
                      <p className="text-sm text-slate-800 mt-1.5 leading-relaxed">
                        {STYLE_INFO[primaryStyle].tip}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleResetTest}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 border border-slate-200 rounded-xl transition text-sm flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>다시 진단하기</span>
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center space-x-2 shadow-md shadow-indigo-100"
                  >
                    <FileText className="h-4 w-4" />
                    <span>진단 성적표 인쇄 / PDF 저장</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: TRAINER PASSWORD AUTH SCREEN
            ========================================== */}
        {currentTab === 'admin-auth' && (
          <div className="max-w-md mx-auto my-12 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-700"></div>
              
              <div className="flex flex-col items-center text-center mt-4">
                <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full mb-4">
                  <Lock className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">강사 및 주관부서 인증</h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  본 화면은 <strong>더하기교육원</strong> 교수진 및 사내 교육담당자의 강의 설명 진행 전용 페이지입니다.<br />
                  전체 교육생의 집계 데이터를 열람하려면 비밀번호를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handleAdminVerify} className="mt-8 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">인증 패스코드</label>
                  <input 
                    type="password" 
                    placeholder="강사 전용 비밀번호를 입력해 주세요"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm transition outline-none"
                    autoFocus
                  />
                  <span className="text-[10px] text-slate-400 block mt-1.5 text-right">※ 초기 비밀번호: deohagi77</span>
                </div>

                {authError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3 text-xs leading-snug flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="pt-2 flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setCurrentTab('intro')}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl border border-slate-200 transition text-sm text-center"
                  >
                    이전으로
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-sm text-center shadow-lg shadow-indigo-100"
                  >
                    로그인 및 대시보드 오픈
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: ORGANIZATION STATISTICS (DASHBOARD)
            ========================================== */}
        {currentTab === 'org' && isTrainer && orgStats && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Admin Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-2">
                  <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">실시간 강사용 통계 화면</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">CS 마인드 조직 통계 분석 (Trainer View)</h2>
                <p className="text-xs text-slate-500 mt-1">우리 조직의 CS 스타일 다양성과 부서별 핵심 성향 분석 결과를 한눈에 확인하며 컨설팅할 수 있습니다.</p>
              </div>

              <div className="flex items-center space-x-3 self-start md:self-auto">
                <button
                  onClick={handleAddSimulatedUser}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 flex items-center space-x-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>시뮬레이션 인원 추가</span>
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 flex items-center space-x-1.5 border border-rose-200"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>대시보드 즉시 잠금</span>
                </button>
              </div>
            </div>

            {/* Org KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
                <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-semibold">총 진단 참여자 수</span>
                  <span className="text-2xl font-black text-slate-900">{orgStats.totalCount}명</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">실시간 DB 데이터 수집 누적</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
                <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl">
                  <Award className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 block font-semibold">조직 우세 대표 스타일</span>
                  <span className="text-lg font-extrabold text-slate-900 truncate block">
                    {STYLE_INFO[orgStats.topCompanyStyle].title.split('(')[0].trim()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">전체 유형 중 평균 점수가 최고인 스타일</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
                <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-semibold">참여 조직 부서 수</span>
                  <span className="text-2xl font-black text-slate-900">{orgStats.departments.length}개 부서</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">부서별 분포 분석 가능</span>
                </div>
              </div>

            </div>

            {/* Comprehensive Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Distribution Graph */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-950 mb-1">조직 내 CS 스타일 분포도</h3>
                <p className="text-xs text-slate-500 mb-6">주력 스타일로 판명된 구성원들의 유형 비중</p>

                <div className="space-y-4">
                  {Object.entries(STYLE_INFO).map(([key, info]) => {
                    const count = orgStats.styleDistribution[key] || 0;
                    const pct = orgStats.totalCount > 0 ? Math.round((count / orgStats.totalCount) * 100) : 0;

                    return (
                      <div key={key} className="flex items-center space-x-3">
                        <span className="w-10 text-xs font-bold text-slate-500">{key}유형</span>
                        <div className="flex-1 bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                          <div 
                            className={`h-full transition-all duration-1000 ${info.barColor}`} 
                            style={{ width: `${pct}%` }}
                          ></div>
                          <span className="absolute inset-y-0 left-2.5 flex items-center text-[10px] font-bold text-slate-800">
                            {info.short}
                          </span>
                        </div>
                        <span className="w-12 text-right text-xs font-black text-slate-950">{count}명 ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Company Averages Graph */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-950 mb-1">5대 핵심 마인드셋 평균값</h3>
                <p className="text-xs text-slate-500 mb-6">참여자 전원의 CS 항목별 30점 만점 대비 평균 점수</p>

                <div className="grid grid-cols-5 gap-3 h-48 items-end border-b border-slate-200 pb-2">
                  {Object.entries(STYLE_INFO).map(([key, info]) => {
                    const avg = orgStats.averages[key] || 0;
                    const heightPct = (avg / 30) * 100;

                    return (
                      <div key={key} className="flex flex-col items-center group cursor-pointer h-full justify-end">
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-bold transition duration-150 mb-2">
                          {avg}점
                        </span>
                        
                        {/* Bar chart block */}
                        <div className="w-full bg-slate-50 group-hover:bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden">
                          <div 
                            className={`w-full transition-all duration-1000 rounded-t-xl ${info.barColor} opacity-85 group-hover:opacity-100`}
                            style={{ height: `${heightPct}%` }}
                          ></div>
                        </div>

                        <span className="text-xs font-bold text-slate-800 mt-2 block">{key}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-5 gap-3 pt-3 text-center">
                  {Object.entries(STYLE_INFO).map(([key, info]) => (
                    <div key={key} className="text-[9px] text-slate-500 font-bold leading-tight truncate">
                      {info.title.split('(')[0].trim()}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Department Comparison Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-950 mb-1">소속 부서별 상세 통계</h3>
                <p className="text-xs text-slate-500">부서별 CS 참여율과 강점 분야 요약표</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 tracking-wider uppercase">
                    <tr>
                      <th className="py-3 px-6">부서/조직명</th>
                      <th className="py-3 px-6 text-center">참여자수</th>
                      <th className="py-3 px-6">부서 대표 CS 유형 (우세 성향)</th>
                      <th className="py-3 px-6">지표 점수 평균 (A / B / C / D / E)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orgStats.departments.map((dept, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-bold text-slate-900 flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span>{dept.name}</span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-800">
                          {dept.count}명
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STYLE_INFO[dept.dominantStyle].bgColor}`}>
                            <span className={`w-2 h-2 rounded-full ${STYLE_INFO[dept.dominantStyle].barColor}`}></span>
                            <span className="text-slate-800">{STYLE_INFO[dept.dominantStyle].title.split('(')[0].trim()}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">
                          {dept.averages.A} / {dept.averages.B} / {dept.averages.C} / {dept.averages.D} / {dept.averages.E}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic suggestion from education center */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 opacity-10">
                <Sparkles className="h-64 w-64 transform translate-x-12 -translate-y-12" />
              </div>
              <div className="relative max-w-2xl">
                <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">더하기교육원 핵심 컨설팅 제언</span>
                <h3 className="text-xl sm:text-2xl font-bold mt-2">조직 CS 역량 강화를 위한 입체 전략</h3>
                
                <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                  본 조직의 주력 CS 스타일 분석에 근거해 볼 때, 균형 잡힌 명품 접객 문화를 장착하기 위해서는 부서 간의 상호 커뮤니케이션 멘토링이 필수적입니다. 
                  해결 능력이 특출난 <strong>A(해결사형) 부서</strong>와 극진한 공감성을 가진 <strong>E(배려자형) 부서</strong>가 접객 모범사례를 상호 공유할 때, 
                  고객 충성도 극대화와 구성원 스트레스 감축이라는 두 가지 비즈니스 과제를 동시에 달성할 수 있습니다.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a 
                    href="mailto:contact@deohagi.edu" 
                    className="inline-flex items-center justify-center space-x-1 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-3 px-5 rounded-xl transition shadow-md shadow-slate-900/30"
                  >
                    <span>맞춤형 조직 위탁 교육 문의하기</span>
                    <ArrowRight className="h-4 w-4 text-slate-900" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-500">본 진단 도구는 더하기교육원의 CS 마인드 프로필 저작권 프레임워크를 바탕으로 제작되었습니다.</p>
          <p>© 2026 더하기교육원 & CS Style Solution. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}