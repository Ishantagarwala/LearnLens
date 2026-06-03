import { Router } from 'express';
import openai from '../lib/openai.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { extractTextFromFile } from '../lib/extractText.js';
import fs from 'fs';

const router = Router();
const MODEL = 'gpt-4o-mini';

router.post('/career-match', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;

    const prompt = `You are a career counselor AI. Based on the following questionnaire answers from a student, suggest the top 5 career matches.

Questionnaire Answers:
- Interests: ${answers.interests}
- Skills: ${answers.skills}
- Education Level: ${answers.education}
- Preferred Work Style: ${answers.workStyle}
- Salary Preference: ${answers.salary}

Return a JSON array with exactly 5 objects, each having:
- "title": career title
- "matchPercent": number 70-99
- "description": 2 sentence description
- "requiredSkills": array of 4-6 skills
- "avgSalary": salary range string
- "growthOutlook": "High" | "Medium" | "Low"

Return ONLY valid JSON array, no markdown.`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content.trim();
    const careers = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, ''));
    res.json({ careers });
  } catch (err) {
    console.error('Career match error:', err);
    res.status(500).json({ error: 'Failed to generate career matches' });
  }
});

router.post('/roadmap', authMiddleware, async (req, res) => {
  try {
    const { career } = req.body;

    const prompt = `Create a detailed 6-month learning roadmap for someone who wants to become a ${career}. 

Return a JSON object with:
- "career": "${career}"
- "duration": "6 months"
- "milestones": array of 6 objects (one per month), each with:
  - "month": number 1-6
  - "title": milestone title
  - "skills": array of 2-3 skills to learn
  - "tasks": array of 3-4 specific tasks/actions
  - "resources": array of 2-3 resource names (courses, books, tutorials)

Return ONLY valid JSON, no markdown.`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content.trim();
    const roadmap = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, ''));
    res.json({ roadmap });
  } catch (err) {
    console.error('Roadmap error:', err);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
});

router.post('/courses', authMiddleware, async (req, res) => {
  try {
    const { topic, level } = req.body;

    const prompt = `Recommend 8 online courses for learning "${topic}"${level ? ` at ${level} level` : ''}.

Return a JSON array of 8 objects, each with:
- "title": course title
- "platform": one of "Coursera", "Udemy", "YouTube", "edX", "freeCodeCamp", "Pluralsight", "LinkedIn Learning", "Khan Academy"
- "level": "Beginner" | "Intermediate" | "Advanced"
- "duration": estimated duration string
- "isFree": boolean
- "description": 1 sentence description
- "link": a plausible URL for the course

Return ONLY valid JSON array, no markdown.`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content.trim();
    const courses = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, ''));
    res.json({ courses });
  } catch (err) {
    console.error('Courses error:', err);
    res.status(500).json({ error: 'Failed to generate course recommendations' });
  }
});

router.post('/pdf-assistant', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { action } = req.body;
    const text = await extractTextFromFile(req.file.path);

    fs.unlinkSync(req.file.path);

    const prompts = {
      summarize: `Summarize the following document concisely, highlighting key points:\n\n${text.slice(0, 8000)}`,
      mcq: `Generate 10 multiple choice questions from this text. Each question should have 4 options (A, B, C, D) and indicate the correct answer.

Return a JSON array of 10 objects with:
- "question": string
- "options": { "A": string, "B": string, "C": string, "D": string }
- "correct": "A" | "B" | "C" | "D"
- "explanation": brief explanation

Text:\n${text.slice(0, 8000)}

Return ONLY valid JSON array, no markdown.`,
      flashcards: `Create 10 flashcards from this text for study purposes.

Return a JSON array of 10 objects with:
- "front": question or term
- "back": answer or definition

Text:\n${text.slice(0, 8000)}

Return ONLY valid JSON array, no markdown.`,
      explain: `Explain the key concepts from this document in simple terms. Break it down into clear sections with headers:\n\n${text.slice(0, 8000)}`,
    };

    const prompt = prompts[action] || prompts.summarize;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const result = completion.choices[0].message.content.trim();

    if (action === 'mcq' || action === 'flashcards') {
      try {
        const parsed = JSON.parse(result.replace(/```json?\n?/g, '').replace(/```/g, ''));
        return res.json({ result: parsed, type: action });
      } catch {
        return res.json({ result, type: 'text' });
      }
    }

    res.json({ result, type: 'text' });
  } catch (err) {
    console.error('PDF assistant error:', err);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messages = [
      {
        role: 'system',
        content: 'You are CareerPilot AI Tutor, an expert educational assistant. Help students with career guidance, study tips, technical concepts, interview prep, and learning strategies. Be friendly, encouraging, and thorough. Use markdown formatting for better readability.',
      },
      ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages,
      stream: true,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate response' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      res.end();
    }
  }
});

router.post('/resume-analyze', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { jobDescription } = req.body;
    const text = await extractTextFromFile(req.file.path);

    fs.unlinkSync(req.file.path);

    const prompt = `You are an expert HR recruiter and resume coach. Analyze the provided resume and return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "verdict": "<Poor|Average|Good|Excellent>",
  "atsScore": <number 0-100>,
  "atsExplanation": "<string explaining ATS compatibility>",
  "sectionScores": {
    "contactInfo": <0-100>,
    "summary": <0-100>,
    "workExperience": <0-100>,
    "education": <0-100>,
    "skills": <0-100>,
    "projects": <0-100>,
    "certifications": <0-100>,
    "formatting": <0-100>
  },
  "strengths": ["<string>", ...],
  "weaknesses": ["<string>", ...],
  "missingKeywords": ["<string>", ...],
  "recommendations": ["<string>", ...]
}

Resume Text:
${text.slice(0, 8000)}

${jobDescription ? `Target Job Description:\n${jobDescription}\n\nAnalyze how well this resume matches the job description and include relevant missing keywords.` : ''}

Return ONLY the JSON, no markdown code blocks.`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const result = completion.choices[0].message.content.trim();
    const report = JSON.parse(result.replace(/```json?\n?/g, '').replace(/```/g, ''));
    res.json({ report });
  } catch (err) {
    console.error('Resume analyze error:', err);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

router.post('/projects', authMiddleware, async (req, res) => {
  try {
    const { skillLevel, career } = req.body;

    const prompt = `Suggest 6 project ideas for someone at ${skillLevel} level who wants to become a ${career}.

Return a JSON array of 6 objects, each with:
- "title": project title
- "description": 2-3 sentence description
- "techStack": array of 3-5 technologies
- "difficulty": "Beginner" | "Intermediate" | "Advanced"
- "estimatedTime": time string (e.g. "2-3 weeks")
- "githubSearchQuery": a GitHub search query to find similar projects

Return ONLY valid JSON array, no markdown.`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content.trim();
    const projects = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, ''));
    res.json({ projects });
  } catch (err) {
    console.error('Projects error:', err);
    res.status(500).json({ error: 'Failed to generate project ideas' });
  }
});

export default router;
