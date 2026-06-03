import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ─── Roadmaps ───
router.get('/roadmaps', authMiddleware, async (req, res) => {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ roadmaps: roadmaps.map((r) => ({ ...r, content: JSON.parse(r.content) })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
});

router.post('/roadmaps', authMiddleware, async (req, res) => {
  try {
    const { career, content } = req.body;
    const roadmap = await prisma.roadmap.create({
      data: { userId: req.userId, career, content: JSON.stringify(content) },
    });
    res.status(201).json({ roadmap: { ...roadmap, content: JSON.parse(roadmap.content) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save roadmap' });
  }
});

router.delete('/roadmaps/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.roadmap.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    res.json({ message: 'Roadmap deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete roadmap' });
  }
});

// ─── Chats ───
router.get('/chats', authMiddleware, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, createdAt: true },
    });
    res.json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

router.post('/chats', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await prisma.chat.create({
      data: { userId: req.userId, title: title || 'New Chat' },
    });
    res.status(201).json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

router.get('/chats/:id/messages', authMiddleware, async (req, res) => {
  try {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/chats/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { role, content } = req.body;
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const message = await prisma.message.create({
      data: { chatId: req.params.id, role, content },
    });

    if (role === 'user' && chat.title === 'New Chat') {
      await prisma.chat.update({
        where: { id: req.params.id },
        data: { title: content.slice(0, 50) },
      });
    }

    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

router.delete('/chats/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.chat.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// ─── Resume Scans ───
router.get('/resume-scans', authMiddleware, async (req, res) => {
  try {
    const scans = await prisma.resumeScan.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      scans: scans.map((s) => ({ ...s, reportJson: JSON.parse(s.reportJson) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resume scans' });
  }
});

router.post('/resume-scans', authMiddleware, async (req, res) => {
  try {
    const { fileName, overallScore, reportJson } = req.body;
    const scan = await prisma.resumeScan.create({
      data: {
        userId: req.userId,
        fileName,
        overallScore,
        reportJson: JSON.stringify(reportJson),
      },
    });
    res.status(201).json({ scan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save resume scan' });
  }
});

// ─── Course Bookmarks ───
router.get('/bookmarks', authMiddleware, async (req, res) => {
  try {
    const bookmarks = await prisma.courseBookmark.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bookmarks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

router.post('/bookmarks', authMiddleware, async (req, res) => {
  try {
    const { courseName, platform, link } = req.body;
    const bookmark = await prisma.courseBookmark.create({
      data: { userId: req.userId, courseName, platform, link },
    });
    res.status(201).json({ bookmark });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to bookmark course' });
  }
});

router.delete('/bookmarks/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.courseBookmark.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });
    res.json({ message: 'Bookmark deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// ─── Dashboard Stats ───
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [roadmapCount, bookmarkCount, chatCount, latestScan] = await Promise.all([
      prisma.roadmap.count({ where: { userId: req.userId } }),
      prisma.courseBookmark.count({ where: { userId: req.userId } }),
      prisma.chat.count({ where: { userId: req.userId } }),
      prisma.resumeScan.findFirst({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      stats: {
        roadmapCount,
        bookmarkCount,
        chatCount,
        resumeScore: latestScan?.overallScore ?? null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;
