// Survey schema and scoring engine mapped to the live Google Form

export const sections = {
  SHI: {
    title: "Study Habits",
    subtitle: "How you organise time and effort around study",
    short: "Study Habits Index",
    color: "#1e3a8a",
    items: [
      { id: "shi1", text: "I plan my study schedule and usually follow it." },
      { id: "shi2", text: "I revise class codes within 24 hours." },
      { id: "shi3", text: "I practice coding at least three days a week." },
      { id: "shi4", text: "I can study 30+ minutes without phone distraction." },
      { id: "shi5", text: "I ask doubts whenever I get stuck." }
    ]
  },
  SEI: {
    title: "Self-Efficacy",
    subtitle: "Your confidence in your own academic ability",
    short: "Self-Efficacy Index",
    color: "#0f766e",
    items: [
      { id: "sei1", text: "I can trace small code and predict output." },
      { id: "sei2", text: "I can write simple if-else and loops without help." },
      { id: "sei3", text: "I can debug basic syntax or logic errors." },
      { id: "sei4", text: "I feel confident solving a new programming problem." },
      { id: "sei5", text: "I enjoy coding exercises." }
    ]
  },
  ATI: {
    title: "Attention & Thinking",
    subtitle: "How well you focus and reason in academic work",
    short: "Attention/Thinking Index",
    color: "#7c3aed",
    items: [
      { id: "ati1", text: "Notifications distract me while studying. (reverse)", reverse: true },
      { id: "ati2", text: "I lose focus after a few lines of code. (reverse)", reverse: true },
      { id: "ati3", text: "I can break a problem into smaller steps." },
      { id: "ati4", text: "I can explain my code logic to others." },
      { id: "ati5", text: "I can read error messages patiently." }
    ]
  },
  SWI: {
    title: "Stress & Well-being",
    subtitle: "How stress and mood affect your studies",
    short: "Stress & Well-being Index",
    color: "#b45309",
    items: [
      { id: "swi1", text: "I feel anxious during coding tasks. (reverse)", reverse: true },
      { id: "swi2", text: "I sleep well and feel fresh in class." },
      { id: "swi3", text: "The workload feels manageable." },
      { id: "swi4", text: "I can balance home and study time." },
      { id: "swi5", text: "I know whom to contact if I feel stuck." }
    ]
  }
};

export const diagnostic = {
  title: "Diagnostic Skill Check",
  subtitle: "Core syntax, logic, and debugging evaluation",
  short: "Diagnostic Skill Score",
  color: "#be123c",
  items: [
    {
      id: "ds1",
      text: "MCQ 1: What will be printed?\n\nint x = 5;\nif (x > 3) printf(\"A\"); else printf(\"B\");",
      options: ["A", "B", "Compile error", "Runtime error"],
      answer: 0,
      type: "mcq"
    },
    {
      id: "ds2",
      text: "MCQ 2: Which loop runs 10 times?",
      options: [
        "for(i=0;i<=10;i++)",
        "for(i=1;i<=10;i++)",
        "for(i=1;i<10;i++)",
        "for(i=0;i<9;i++)"
      ],
      answer: 1,
      type: "mcq"
    },
    {
      id: "ds3",
      text: "Short code: Write one C line to print \"Hello World\".",
      placeholder: "e.g., printf(\"Hello World\");",
      type: "text"
    },
    {
      id: "ds4",
      text: "Debug: What is wrong here and how would you fix it?\n\nfor(i=1;i<=n;i++);\n    sum += i;",
      placeholder: "Describe the issue or write the corrected line",
      type: "text"
    }
  ]
};

// Demographics, hardware, and reflection questions
export const formMetadata = {
  stream: {
    id: "stream",
    text: "Stream (10+2)",
    options: ["Arts", "Science", "Commerce", "Other"]
  },
  priorCoding: {
    id: "prior_coding",
    text: "Prior coding exposure",
    options: ["Yes", "No"]
  },
  deviceAvailability: {
    id: "device_availability",
    text: "Device availability for practice",
    options: ["Phone only", "Laptop + Phone", "Lab only"]
  },
  studyHours: {
    id: "study_hours",
    text: "Study hours per day (average)",
    placeholder: "e.g., 2"
  },
  sleepHours: {
    id: "sleep_hours",
    text: "Sleep hours per night (average)",
    placeholder: "e.g., 7"
  },
  confusingPart: {
    id: "confusing_part",
    text: "What part of programming do you find most confusing right now?",
    placeholder: "Describe in a few words"
  },
  supportType: {
    id: "support_type",
    text: "What support would help you most next week?",
    options: [
      "Extra lab slot",
      "Peer study group",
      "Printed notes",
      "Short video tutorial",
      "1:1 doubt-clinic"
    ]
  }
};

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

function evaluateDiagnostic(responses) {
  let score = 0;
  
  // MCQ 1
  if (Number(responses?.ds1) === 0) score += 1;
  
  // MCQ 2
  if (Number(responses?.ds2) === 1) score += 1;
  
  // Short code ds3: Print Hello World in C
  const ds3Val = (responses?.ds3 || "").toLowerCase();
  if (ds3Val.includes("printf") && ds3Val.includes("hello")) {
    score += 1;
  }
  
  // Debug ds4: for(i=1;i<=n;i++); sum += i;
  const ds4Val = (responses?.ds4 || "").toLowerCase();
  // Correct if they mention semicolon or show the corrected loop syntax
  if (
    ds4Val.includes("semicolon") || 
    ds4Val.includes("semi-colon") || 
    ds4Val.includes(";") || 
    ds4Val.includes("remove") ||
    ds4Val.includes("extra") ||
    (ds4Val.includes("for") && !ds4Val.includes("i++;") && !ds4Val.includes("i++);"))
  ) {
    score += 1;
  }
  
  return score;
}

export function scoreSurvey(payload) {
  const { likert = {}, diagnostic: dsResponses = {} } = payload;

  const shi = sectionAverage(sections.SHI.items, likert);
  const sei = sectionAverage(sections.SEI.items, likert);
  const ati = sectionAverage(sections.ATI.items, likert);
  const swi = sectionAverage(sections.SWI.items, likert);
  const ds = evaluateDiagnostic(dsResponses);

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

export function buildMentoringNotes(scores, meta = {}) {
  const notes = [];
  
  // Psychological/Habit notes
  if (scores.SEI < 60) {
    notes.push({
      key: "SEI",
      severity: scores.SEI < 40 ? "high" : "medium",
      title: "Self-Efficacy coaching",
      body: "Struggles with tracing or debugging code. Offer peer-assisted debugging sessions and celebrate small tracing successes."
    });
  }
  if (scores.SWI < 60) {
    notes.push({
      key: "SWI",
      severity: scores.SWI < 40 ? "high" : "medium",
      title: "Anxiety & workload check-in",
      body: "Student experiences high anxiety during coding. Recommend workload balancing and provide guidance on offline/relaxed practice."
    });
  }
  if (scores.SHI < 60) {
    notes.push({
      key: "SHI",
      severity: scores.SHI < 40 ? "high" : "medium",
      title: "Study habits adjustments",
      body: "Needs structured daily practice habits. Advise reviewing notes/codes daily and committing to at least 3 coding days a week."
    });
  }
  if (scores.ATI < 60) {
    notes.push({
      key: "ATI",
      severity: scores.ATI < 40 ? "high" : "medium",
      title: "Attention & focus training",
      body: "Easily distracted by notifications or loses focus quickly. Encourage single-tab coding mode and silent study periods."
    });
  }
  if (scores.DS < 2) {
    notes.push({
      key: "DS",
      severity: scores.DS === 0 ? "high" : "medium",
      title: "Core logic remediation",
      body: "Struggles with loops, if-conditions, or basic syntax. Assign standard tracing tasks and remedial syntax tutorials."
    });
  }

  // Device availability
  if (meta.device_availability === "Phone only") {
    notes.push({
      key: "PHONE_ONLY",
      severity: "high",
      title: "Hardware bottleneck",
      body: "Owns only a mobile phone for coding. Prioritize immediately for college lab times and encourage offline logic checks."
    });
  } else if (meta.device_availability === "Lab only") {
    notes.push({
      key: "LAB_ONLY",
      severity: "medium",
      title: "Lab access dependent",
      body: "Depends entirely on college labs for coding practice. Ensure student has priority scheduling in open lab hours."
    });
  }

  // Support requested
  if (meta.support_type === "1:1 doubt-clinic") {
    notes.push({
      key: "DOUBT_CLINIC",
      severity: "medium",
      title: "Requested 1:1 doubt clearing",
      body: "Student explicitly requested 1:1 support. Schedule a 10-minute session to address their specific coding bottlenecks."
    });
  } else if (meta.support_type === "Extra lab slot") {
    notes.push({
      key: "EXTRA_LAB",
      severity: "medium",
      title: "Requested extra lab time",
      body: "Wants additional lab slots. Grant access to after-hours lab sessions."
    });
  } else if (meta.support_type === "Printed notes") {
    notes.push({
      key: "PRINTED_NOTES",
      severity: "medium",
      title: "Requested printed handouts",
      body: "Requested offline printed reference materials. Provide printed sheets on loops and syntax."
    });
  }

  if (!notes.length) {
    notes.push({
      key: "OK",
      severity: "low",
      title: "On track",
      body: "All metrics are stable and healthy. Student is well-equipped to support peers as a coding buddy or study partner."
    });
  }
  return notes;
}
