import express from "express";
import cors from "cors";

import { sections, diagnostic, formMetadata } from "./survey.js";
import {
  addSubmission,
  classSummary,
  getStudent,
  listStudents
} from "./store.js";
import { seedClass } from "./seed.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || "mentor123";
const TEACHER_TOKEN = "mentormap-teacher-token";

function requireTeacher(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (token !== TEACHER_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "learnlens-backend" });
});

// Fetch survey schema (including sections, diagnostic, formMetadata)
app.get("/api/survey/schema", (_req, res) => {
  const publicDiagnostic = {
    ...diagnostic,
    items: diagnostic.items.map(({ answer: _a, ...rest }) => rest)
  };
  res.json({ sections, diagnostic: publicDiagnostic, formMetadata });
});

app.post("/api/survey/submit", (req, res) => {
  const { name, roll, email, likert, diagnostic: dsResponses, metadata } = req.body || {};
  if (!name || !likert || !dsResponses) {
    return res.status(400).json({ error: "Missing name, likert, or diagnostic responses." });
  }
  const record = addSubmission({ name, roll, email, likert, diagnostic: dsResponses, metadata });
  res.status(201).json({
    id: record.id,
    name: record.name,
    scores: record.scores,
    notes: record.notes
  });
});

app.post("/api/auth/teacher-login", (req, res) => {
  const { password } = req.body || {};
  if (password === TEACHER_PASSWORD) {
    return res.json({ token: TEACHER_TOKEN });
  }
  return res.status(401).json({ error: "Invalid password." });
});

app.get("/api/students", requireTeacher, (_req, res) => {
  res.json({ students: listStudents(), summary: classSummary() });
});

app.get("/api/students/:id", requireTeacher, (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found." });
  res.json(student);
});

// CSV Exporter updated for live questions pipeline
app.get("/api/exporter/csv", requireTeacher, (req, res) => {
  const students = listStudents();
  const headers = [
    "ID", "Name", "Roll", "Email", "SubmissionDate",
    "SHI", "SEI", "ATI", "SWI", "DS", "RiskCount", "MentoringTier",
    "Stream", "PriorCoding", "DeviceAvailability", "StudyHours", "SleepHours", "ConfusingPart", "SupportType"
  ];

  const rows = students.map(s => [
    s.id,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.roll.replace(/"/g, '""')}"`,
    `"${s.email.replace(/"/g, '""')}"`,
    s.submitted_at,
    s.scores.SHI,
    s.scores.SEI,
    s.scores.ATI,
    s.scores.SWI,
    s.scores.DS,
    s.scores.risk_count,
    s.scores.tier,
    `"${(s.metadata?.stream || "").replace(/"/g, '""')}"`,
    s.metadata?.prior_coding || "No",
    `"${(s.metadata?.device_availability || "").replace(/"/g, '""')}"`,
    s.metadata?.study_hours || 0,
    s.metadata?.sleep_hours || 0,
    `"${(s.metadata?.confusing_part || "").replace(/"/g, '""')}"`,
    `"${(s.metadata?.support_type || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  
  // Accept Bearer Token in query param for easier browser downloads
  const queryAuth = req.query.authorization || "";
  const token = queryAuth.replace(/^Bearer\s+/i, "").trim();
  if (token !== TEACHER_TOKEN) {
    // Check request headers if query auth was missing
    const header = req.headers.authorization || "";
    const headerToken = header.replace(/^Bearer\s+/i, "").trim();
    if (headerToken !== TEACHER_TOKEN) {
      return res.status(401).json({ error: "Unauthorized CSV export." });
    }
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=learnlens_student_data.csv");
  res.status(200).send(csvContent);
});

// Google Apps Script builder matching the live Google Form structure
app.get("/api/replication/apps-script", requireTeacher, (req, res) => {
  const serverUrl = req.query.serverUrl || "YOUR_SERVER_URL_HERE";
  const scriptCode = `/**
 * LearnLens Classroom Mentoring System (Live Form Replication)
 * Copy-paste this Google Apps Script into your Google Sheet Script Editor (Extensions > Apps Script).
 * Run the 'setupSurveySystem' function once to create the Form and link it.
 */

const SHEET_NAME_RAW = "Raw Responses";
const SHEET_NAME_COMPUTED = "Computed Mentoring Sheets";
const SERVER_URL = "${serverUrl.replace(/\/$/, "")}";

function setupSurveySystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Create Sheets
  let rawSheet = ss.getSheetByName(SHEET_NAME_RAW);
  if (!rawSheet) {
    rawSheet = ss.insertSheet(SHEET_NAME_RAW);
  }
  
  let compSheet = ss.getSheetByName(SHEET_NAME_COMPUTED);
  if (!compSheet) {
    compSheet = ss.insertSheet(SHEET_NAME_COMPUTED);
  }
  
  // Setup headers on computed sheet
  compSheet.clear();
  const headers = [
    "Timestamp", "Name", "Roll Number", "Email",
    "Study Habits Index (SHI)", "Self-Efficacy Index (SEI)", "Attention/Thinking Index (ATI)", "Stress & Well-being Index (SWI)", 
    "Diagnostic Skill Score (DS)", "Risk Indicators Count", "Mentoring Priority Tier",
    "Stream", "Prior Coding", "Device Availability", "Study Hours/Day", "Sleep Hours/Night", "Confusing Concepts", "Preferred Support"
  ];
  compSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#f1f5f9");
  
  // 2. Create the Form
  const form = FormApp.create("LearnLens: Programming Psychology & Skill Diagnostic");
  form.setDescription("This reflection survey collects info on your study patterns, coding confidence, sleep metrics, and syntax skills. It helps us support you effectively next week.");
  
  // Section A - Basic Info
  form.addTextItem().setTitle("Full Name").setRequired(true);
  form.addTextItem().setTitle("Roll Number").setRequired(true);
  form.addTextItem().setTitle("Email Address").setRequired(false);
  
  form.addMultipleChoiceItem()
    .setTitle("Stream (10+2)")
    .setChoiceValues(["Arts", "Science", "Commerce", "Other"]);

  form.addMultipleChoiceItem()
    .setTitle("Prior coding exposure")
    .setChoiceValues(["Yes", "No"]);

  form.addMultipleChoiceItem()
    .setTitle("Device availability for practice")
    .setChoiceValues(["Phone only", "Laptop + Phone", "Lab only"]);

  form.addTextItem().setTitle("Study hours per day (average)");
  form.addTextItem().setTitle("Sleep hours per night (average)");
  
  // Section B - Study Habits Grid
  const gridSHI = form.addGridItem();
  gridSHI.setTitle("Section B: Rate the following (Study Habits)")
    .setRows([
      "I plan my study schedule and usually follow it.",
      "I revise class codes within 24 hours.",
      "I practice coding at least three days a week.",
      "I can study 30+ minutes without phone distraction.",
      "I ask doubts whenever I get stuck."
    ])
    .setColumns(["1 - Strongly Disagree", "2 - Disagree", "3 - Neutral", "4 - Agree", "5 - Strongly Agree"]);

  // Section C - Self-Efficacy Grid
  const gridSEI = form.addGridItem();
  gridSEI.setTitle("Section C: Rate the following (Self-Efficacy)")
    .setRows([
      "I can trace small code and predict output.",
      "I can write simple if-else and loops without help.",
      "I can debug basic syntax or logic errors.",
      "I feel confident solving a new programming problem.",
      "I enjoy coding exercises."
    ])
    .setColumns(["1 - Strongly Disagree", "2 - Disagree", "3 - Neutral", "4 - Agree", "5 - Strongly Agree"]);

  // Section D - Attention & Thinking Grid
  const gridATI = form.addGridItem();
  gridATI.setTitle("Section D: Rate the following (Attention & Thinking)")
    .setRows([
      "Notifications distract me while studying. (reverse)",
      "I lose focus after a few lines of code. (reverse)",
      "I can break a problem into smaller steps.",
      "I can explain my code logic to others.",
      "I can read error messages patiently."
    ])
    .setColumns(["1 - Strongly Disagree", "2 - Disagree", "3 - Neutral", "4 - Agree", "5 - Strongly Agree"]);

  // Section E - Stress Grid
  const gridSWI = form.addGridItem();
  gridSWI.setTitle("Section E: Rate the following (Stress & Well-Being)")
    .setRows([
      "I feel anxious during coding tasks. (reverse)",
      "I sleep well and feel fresh in class.",
      "The workload feels manageable.",
      "I can balance home and study time.",
      "I know whom to contact if I feel stuck."
    ])
    .setColumns(["1 - Strongly Disagree", "2 - Disagree", "3 - Neutral", "4 - Agree", "5 - Strongly Agree"]);

  // Section F - Mini Skill Check
  form.addMultipleChoiceItem()
    .setTitle("MCQ 1: What will be printed? (int x = 5; if (x > 3) printf(\\\"A\\\"); else printf(\\\"B\\\");)")
    .setChoiceValues(["A", "B", "Compile error", "Runtime error"]);

  form.addMultipleChoiceItem()
    .setTitle("MCQ 2: Which loop runs 10 times?")
    .setChoiceValues([
      "for(i=0;i<=10;i++)",
      "for(i=1;i<=10;i++)",
      "for(i=1;i<10;i++)",
      "for(i=0;i<9;i++)"
    ]);

  form.addTextItem().setTitle("Short code: Write one C line to print \\\"Hello World\\\".");
  form.addTextItem().setTitle("Debug: What is wrong here and how would you fix it? (for(i=1;i<=n;i++); sum += i;)");

  // Section G - Reflection & Support
  form.addTextItem().setTitle("What part of programming do you find most confusing right now?");
  
  form.addMultipleChoiceItem()
    .setTitle("What support would help you most next week?")
    .setChoiceValues([
      "Extra lab slot",
      "Peer study group",
      "Printed notes",
      "Short video tutorial",
      "1:1 doubt-clinic"
    ]);

  // Link Form to Spreadsheet
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  
  // Set up onSubmit trigger
  ScriptApp.newTrigger("onFormSubmitEvent")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  Logger.log("Form created and linked! Edit URL: " + form.getEditUrl());
}

function onFormSubmitEvent(e) {
  const rawValues = e.values; // raw form values array
  const timestamp = rawValues[0];
  const name = rawValues[1];
  const roll = rawValues[2];
  const email = rawValues[3];
  
  // Metadata
  const stream = rawValues[4];
  const priorCoding = rawValues[5];
  const device = rawValues[6];
  const studyHours = parseFloat(rawValues[7]) || 0;
  const sleepHours = parseFloat(rawValues[8]) || 0;
  
  // Likert sections (Grid Items)
  const shi = computeAverageIndex(rawValues.slice(9, 14), [false, false, false, false, false]);
  const sei = computeAverageIndex(rawValues.slice(14, 19), [false, false, false, false, false]);
  const ati = computeAverageIndex(rawValues.slice(19, 24), [true, true, false, false, false]);
  const swi = computeAverageIndex(rawValues.slice(24, 29), [true, false, false, false, false]);
  
  // Diagnostic Score
  const q1 = rawValues[29] === "A" ? 1 : 0;
  const q2 = rawValues[30] === "for(i=1;i<=10;i++)" ? 1 : 0;
  
  const q3Val = (rawValues[31] || "").toLowerCase();
  const q3 = (q3Val.includes("printf") && q3Val.includes("hello")) ? 1 : 0;
  
  const q4Val = (rawValues[32] || "").toLowerCase();
  const q4 = (q4Val.includes("semicolon") || q4Val.includes(";") || q4Val.includes("remove")) ? 1 : 0;
  
  const ds = q1 + q2 + q3 + q4;
  
  // Reflection & Support preferences
  const confusingPart = rawValues[33];
  const supportType = rawValues[34];
  
  // Calculation rules
  const flags = [shi < 60, sei < 60, ati < 60, swi < 60, ds < 2];
  const riskCount = flags.filter(Boolean).length;
  
  let tier = "Low";
  if (riskCount >= 4) tier = "High";
  else if (riskCount >= 2) tier = "Medium";
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const compSheet = ss.getSheetByName(SHEET_NAME_COMPUTED);
  compSheet.appendRow([
    timestamp, name, roll, email,
    shi, sei, ati, swi, ds, riskCount, tier,
    stream, priorCoding, device, studyHours, sleepHours, confusingPart, supportType
  ]);
  
  // Post data to LearnLens Server if URL is configured
  if (SERVER_URL && SERVER_URL.indexOf("YOUR_") === -1 && SERVER_URL.length > 5) {
    try {
      const payload = {
        name: name,
        roll: roll,
        email: email,
        likert: {
          shi1: parseInt(rawValues[9].charAt(0)),
          shi2: parseInt(rawValues[10].charAt(0)),
          shi3: parseInt(rawValues[11].charAt(0)),
          shi4: parseInt(rawValues[12].charAt(0)),
          shi5: parseInt(rawValues[13].charAt(0)),
          sei1: parseInt(rawValues[14].charAt(0)),
          sei2: parseInt(rawValues[15].charAt(0)),
          sei3: parseInt(rawValues[16].charAt(0)),
          sei4: parseInt(rawValues[17].charAt(0)),
          sei5: parseInt(rawValues[18].charAt(0)),
          ati1: parseInt(rawValues[19].charAt(0)),
          ati2: parseInt(rawValues[20].charAt(0)),
          ati3: parseInt(rawValues[21].charAt(0)),
          ati4: parseInt(rawValues[22].charAt(0)),
          ati5: parseInt(rawValues[23].charAt(0)),
          swi1: parseInt(rawValues[24].charAt(0)),
          swi2: parseInt(rawValues[25].charAt(0)),
          swi3: parseInt(rawValues[26].charAt(0)),
          swi4: parseInt(rawValues[27].charAt(0)),
          swi5: parseInt(rawValues[28].charAt(0))
        },
        diagnostic: {
          ds1: rawValues[29] === "A" ? 0 : 1,
          ds2: rawValues[30] === "for(i=1;i<=10;i++)" ? 1 : 0,
          ds3: rawValues[31],
          ds4: rawValues[32]
        },
        metadata: {
          stream: stream,
          prior_coding: priorCoding,
          device_availability: device,
          study_hours: studyHours,
          sleep_hours: sleepHours,
          confusing_part: confusingPart,
          support_type: supportType
        }
      };
      
      const options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      UrlFetchApp.fetch(SERVER_URL + "/api/survey/submit", options);
    } catch (err) {
      Logger.log("Failed to sync to LearnLens Server: " + err.toString());
    }
  }
}

function computeAverageIndex(answers, reverseFlags) {
  let sum = 0;
  for (let i = 0; i < answers.length; i++) {
    let score = parseInt(answers[i].charAt(0));
    if (isNaN(score)) score = 3; // default neutral
    const adjusted = reverseFlags[i] ? (6 - score) : score;
    sum += ((adjusted - 1) / 4) * 100;
  }
  return Math.round(sum / answers.length);
}
`;
  res.json({ script: scriptCode });
});

// Python notebook exporter script for ML pipeline matching new headers
app.get("/api/exporter/python-ml", requireTeacher, (req, res) => {
  const pythonScript = `#!/usr/bin/env python3
"""
LearnLens - Module 5 ML Pipeline (Live Form Schema)
This script loads the exported survey CSV, executes K-Means clustering to partition 
students into behavioral cohorts, and trains a Random Forest Classifier to predict priority tiers.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

print("🚀 Launching LearnLens ML Pipeline...")

# 1. Load Data
try:
    df = pd.read_csv("learnlens_student_data.csv")
    print(f"Loaded {len(df)} student profiles successfully.")
except FileNotFoundError:
    print("❌ Error: 'learnlens_student_data.csv' not found. Please place it in this directory.")
    exit(1)

# 2. Inspect features
features = ["SHI", "SEI", "ATI", "SWI", "DS"]
X = df[features]
y = df["MentoringTier"]

# Fill empty values if any
X = X.fillna(X.mean())

print("\\n--- Class Priorities Snapshot ---")
print(y.value_counts())

# 3. K-Means Clustering (Discovering Cohorts)
print("\\n--- Segmenting Students into 3 Clusters (K-Means) ---")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
df["Cluster"] = kmeans.fit_predict(X_scaled)

# View cluster averages
cluster_summary = df.groupby("Cluster")[features].mean()
print(cluster_summary)

# 4. Supervised Random Forest Classifier
print("\\n--- Training Random Forest Tier Predictor ---")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Accuracy & reports
y_pred = rf.predict(X_test)
print("\\nModel Evaluation Report:")
print(classification_report(y_test, y_pred, zero_division=0))

# Feature Importances
importances = pd.Series(rf.feature_importances_, index=features).sort_values(ascending=False)
print("\\nFeature Importance in Tier Determination:")
print(importances)

# 5. Save cluster-enriched results
df.to_csv("learnlens_ml_enriched_data.csv", index=False)
print("\\n✅ Success: Saved ML cohort details to 'learnlens_ml_enriched_data.csv'")
`;

  // Accept Bearer Token in query param for browser download links
  const queryAuth = req.query.authorization || "";
  const token = queryAuth.replace(/^Bearer\s+/i, "").trim();
  if (token !== TEACHER_TOKEN) {
    const header = req.headers.authorization || "";
    const headerToken = header.replace(/^Bearer\s+/i, "").trim();
    if (headerToken !== TEACHER_TOKEN) {
      return res.status(401).json({ error: "Unauthorized ML script export." });
    }
  }

  res.setHeader("Content-Type", "application/x-python");
  res.setHeader("Content-Disposition", "attachment; filename=learnlens_ml_pipeline.py");
  res.status(200).send(pythonScript);
});

// Dynamic Clustering (Module 5 live display logic based on active backend data)
app.get("/api/ml/clusters", requireTeacher, (_req, res) => {
  const students = listStudents();
  
  const clusters = {
    "High Stress & Anxiety": [],
    "Skill Gap / Logic Remediation": [],
    "Study Habits & Confidence Gaps": [],
    "Stable Cohort (Peer Mentors)": []
  };

  for (const s of students) {
    if (s.scores.SWI < 60) {
      clusters["High Stress & Anxiety"].push(s.id);
    } else if (s.scores.DS < 2) {
      clusters["Skill Gap / Logic Remediation"].push(s.id);
    } else if (s.scores.SEI < 60 || s.scores.SHI < 60) {
      clusters["Study Habits & Confidence Gaps"].push(s.id);
    } else {
      clusters["Stable Cohort (Peer Mentors)"].push(s.id);
    }
  }

  res.json({
    note: "Rule-based mock K-Means clusters mapped dynamically to student roster.",
    clusters: Object.entries(clusters).map(([label, ids]) => ({
      label,
      size: ids.length,
      student_ids: ids
    }))
  });
});

const PORT = Number(process.env.PORT) || 4000;
seedClass();
app.listen(PORT, () => {
  console.log(`LearnLens backend listening on http://localhost:${PORT}`);
});
