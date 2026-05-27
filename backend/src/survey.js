// Survey schema — questions, sections, scoring rules.
// All Likert items use a 1–5 scale. Reverse-scored items are flagged below.

export const sections = {
  SHI: {
    title: "Study Habits",
    subtitle: "How you organise time and effort around study",
    short: "Study Habits Index",
    color: "#1e3a8a",
    items: [
      { id: "shi1", text: "I plan my study sessions in advance." },
      { id: "shi2", text: "I review class notes within 24 hours of a lecture." },
      { id: "shi3", text: "I break large topics into smaller goals." },
      { id: "shi4", text: "I keep a regular study schedule outside class." },
      { id: "shi5", text: "I track upcoming assignments and deadlines." }
    ]
  },
  SEI: {
    title: "Self-Efficacy",
    subtitle: "Your confidence in your own academic ability",
    short: "Self-Efficacy Index",
    color: "#0f766e",
    items: [
      { id: "sei1", text: "I am confident I can handle most subjects in BCA." },
      { id: "sei2", text: "When a topic is hard, I keep trying until I understand." },
      // Reverse-scored items — wording is negative.
      { id: "sei3", text: "I often doubt whether I can pass difficult exams.", reverse: true },
      { id: "sei4", text: "I can usually solve a coding problem if I work at it." },
      { id: "sei5", text: "I give up quickly when a topic feels confusing.", reverse: true }
    ]
  },
  ATI: {
    title: "Attention & Thinking",
    subtitle: "How well you focus and reason in academic work",
    short: "Attention/Thinking Index",
    color: "#7c3aed",
    items: [
      { id: "ati1", text: "I can stay focused during a 45-minute lecture." },
      { id: "ati2", text: "I notice when I have stopped understanding a topic." },
      { id: "ati3", text: "I can compare two ideas and explain how they differ." },
      { id: "ati4", text: "I check my answers before submitting work." }
    ]
  },
  SWI: {
    title: "Stress & Well-being",
    subtitle: "How stress and mood affect your studies",
    short: "Stress & Well-being Index",
    color: "#b45309",
    // Every SWI item is reverse-scored: higher reported stress => lower well-being.
    items: [
      { id: "swi1", text: "I feel overwhelmed by coursework.", reverse: true },
      { id: "swi2", text: "I have trouble sleeping because of academic pressure.", reverse: true },
      { id: "swi3", text: "I feel anxious before exams or vivas.", reverse: true },
      { id: "swi4", text: "I struggle to enjoy things outside study.", reverse: true }
    ]
  }
};

// Diagnostic skill — 4 MCQs on basic programming concepts, scored 0–4 total.
export const diagnostic = {
  title: "Diagnostic Skill",
  subtitle: "A quick check of core programming concepts",
  short: "Diagnostic Skill Score",
  color: "#be123c",
  items: [
    {
      id: "ds1",
      text: "What is the output of: console.log(2 + '2') in JavaScript?",
      options: ["4", "22", "NaN", "Error"],
      answer: 1
    },
    {
      id: "ds2",
      text: "Which data structure uses Last-In-First-Out ordering?",
      options: ["Queue", "Linked List", "Stack", "Tree"],
      answer: 2
    },
    {
      id: "ds3",
      text: "In an if/else statement, what does the condition evaluate to?",
      options: ["A loop counter", "A boolean (true/false)", "A function", "An array index"],
      answer: 1
    },
    {
      id: "ds4",
      text: "What is the time complexity of looking up an element in a hash map (on average)?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: 0
    }
  ]
};

// Convert a single Likert response (1–5) to a 0–100 score, honoring reverse-scored items.
function likertTo100(value, reverse) {
  const v = Number(value);
  if (!Number.isFinite(v) || v < 1 || v > 5) return 0;
  const adjusted = reverse ? 6 - v : v;
  return ((adjusted - 1) / 4) * 100;
}

function sectionAverage(items, responses) {
  if (!items.length) return 0;
  const sum = items.reduce(
    (acc, item) => acc + likertTo100(responses?.[item.id], !!item.reverse),
    0
  );
  return Math.round(sum / items.length);
}

function diagnosticScore(items, responses) {
  return items.reduce((acc, item) => {
    const picked = responses?.[item.id];
    return acc + (Number(picked) === item.answer ? 1 : 0);
  }, 0);
}

export function scoreSurvey(payload) {
  const { likert = {}, diagnostic: dsResponses = {} } = payload;

  const shi = sectionAverage(sections.SHI.items, likert);
  const sei = sectionAverage(sections.SEI.items, likert);
  const ati = sectionAverage(sections.ATI.items, likert);
  const swi = sectionAverage(sections.SWI.items, likert);
  const ds = diagnosticScore(diagnostic.items, dsResponses);

  // Risk_Count = how many indices fall below their threshold.
  const flags = {
    SHI: shi < 60,
    SEI: sei < 60,
    ATI: ati < 60,
    SWI: swi < 60,
    DS: ds < 2
  };
  const riskCount = Object.values(flags).filter(Boolean).length;

  let tier = "Low";
  if (riskCount >= 4) tier = "High";
  else if (riskCount >= 2) tier = "Medium";

  return {
    SHI: shi,
    SEI: sei,
    ATI: ati,
    SWI: swi,
    DS: ds,
    flags,
    risk_count: riskCount,
    tier
  };
}

// Generate human-readable mentoring notes from the score profile.
export function buildMentoringNotes(scores) {
  const notes = [];
  if (scores.SEI < 60) {
    notes.push({
      key: "SEI",
      severity: scores.SEI < 40 ? "high" : "medium",
      title: "Confidence-building support",
      body: "Self-efficacy is below the comfort line — pair with success-oriented tasks, small wins, and a peer mentor."
    });
  }
  if (scores.SWI < 60) {
    notes.push({
      key: "SWI",
      severity: scores.SWI < 40 ? "high" : "medium",
      title: "Stress / well-being check-in",
      body: "Elevated stress signals. Consider a 1:1 wellness chat and, if needed, a referral to the campus counselor."
    });
  }
  if (scores.SHI < 60) {
    notes.push({
      key: "SHI",
      severity: scores.SHI < 40 ? "high" : "medium",
      title: "Study-habit coaching",
      body: "Recommend a weekly planner, Pomodoro sessions, and structured note-review within 24h of each lecture."
    });
  }
  if (scores.ATI < 60) {
    notes.push({
      key: "ATI",
      severity: scores.ATI < 40 ? "high" : "medium",
      title: "Attention & thinking practice",
      body: "Introduce focus drills (single-tab study, 25-min blocks) and compare-and-contrast exercises in tutorials."
    });
  }
  if (scores.DS < 2) {
    notes.push({
      key: "DS",
      severity: scores.DS === 0 ? "high" : "medium",
      title: "Extra lab / coding practice",
      body: "Diagnostic shows core concept gaps. Schedule lab remediation on data structures and basic JS semantics."
    });
  }
  if (!notes.length) {
    notes.push({
      key: "OK",
      severity: "low",
      title: "On track",
      body: "All indices are within the healthy range. Continue current cadence and encourage peer-mentoring of others."
    });
  }
  return notes;
}
