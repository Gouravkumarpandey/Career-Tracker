const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const { CAREER_PATHS } = require('../roadmap/roadmap.service');
const { OpenAI } = require('openai');
const env = require('../../config/env');

const openai = new OpenAI({
  apiKey: env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

const analyzeResume = async (userId, resumeId) => {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId }
  });

  if (!resume) {
    throw new ApiError(404, 'Resume not found.');
  }

  // Use Grok to analyze resume title/content
  const completion = await openai.chat.completions.create({
    model: 'grok-beta',
    messages: [
      {
        role: 'system',
        content: 'You are an expert ATS and resume analyzer. Return ONLY a valid JSON object with the following keys (all numbers out of 100 except counts): grammarScore, actionVerbsCount, quantifiableMetricsCount, readabilityIndex.'
      },
      {
        role: 'user',
        content: `Analyze this resume (title/content): ${resume.title}\nProvide the metrics JSON.`
      }
    ]
  });

  let analysisStr = completion.choices[0].message.content.trim();
  // Strip markdown if present
  if (analysisStr.startsWith('```json')) {
    analysisStr = analysisStr.substring(7, analysisStr.length - 3).trim();
  }
  
  let analysis;
  try {
    analysis = JSON.parse(analysisStr);
  } catch (error) {
    console.error("Grok JSON parse error:", error);
    // Fallback if Grok fails to format properly
    analysis = { grammarScore: 80, actionVerbsCount: 10, quantifiableMetricsCount: 3, readabilityIndex: 70 };
  }

  // Upsert analysis
  const metrics = await prisma.resumeMetricsAnalysis.upsert({
    where: { resumeId },
    update: analysis,
    create: {
      ...analysis,
      resumeId
    }
  });

  return {
    resumeId,
    title: resume.title,
    analysis: metrics
  };
};

const analyzeResumeTextDirect = async (userId, resumeText) => {
  const completion = await openai.chat.completions.create({
    model: 'grok-beta',
    messages: [
      {
        role: 'system',
        content: 'You are an expert ATS and resume analyzer. Return ONLY a valid JSON object with the following keys (all numbers out of 100 except counts): grammarScore, actionVerbsCount, quantifiableMetricsCount, readabilityIndex. Also include an "overallScore" out of 100, and an array of strings called "feedback" with 3-4 actionable tips.'
      },
      {
        role: 'user',
        content: `Analyze this resume content for ATS compatibility and quality:\n\n${resumeText}\n\nProvide the metrics JSON.`
      }
    ]
  });

  let analysisStr = completion.choices[0].message.content.trim();
  if (analysisStr.startsWith('```json')) {
    analysisStr = analysisStr.substring(7, analysisStr.length - 3).trim();
  }
  
  try {
    return JSON.parse(analysisStr);
  } catch (error) {
    console.error("Grok JSON parse error:", error);
    throw new ApiError(500, 'Failed to parse ATS analysis from Grok.');
  }
};

const generateResume = async (userId, data) => {
  const { targetRole, experience, skills, education } = data;
  const systemPrompt = `You are an expert resume writer and ATS optimizer.
Your task is to generate a highly professional, ATS-friendly resume in Markdown format based on the user's provided details.
Do NOT use tables, columns, or complex formatting. Use standard headings (e.g., # Experience, ## Job Title, etc.) and bullet points.
Include the following sections if information is provided: Professional Summary, Core Competencies (Skills), Professional Experience, and Education.
Write compelling, action-oriented bullet points that highlight impact and results. If metrics are missing, use placeholders like [Metric] or [Percentage].
Return ONLY the raw Markdown text of the resume. Do not include any conversational filler.`;

  const userPrompt = `Generate an ATS-friendly resume for the target role: ${targetRole}

Experience:
${experience}

Skills:
${skills}

Education:
${education}`;

  return await _callGrokAPI(systemPrompt, userPrompt);
};

const getSkillGapAnalysis = async (userId, targetType, targetId) => {
  const userSkills = await prisma.skill.findMany({
    where: { userId },
    select: { name: true }
  });

  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  let targetName = '';

  if (targetType === 'job') {
    const job = await prisma.job.findUnique({ where: { id: parseInt(targetId) } });
    if (!job) throw new ApiError(404, 'Target job listing not found.');
    targetName = `${job.title} at ${job.company}`;
  } else if (targetType === 'path') {
    const path = CAREER_PATHS.find(p => p.id === parseInt(targetId));
    if (!path) throw new ApiError(404, 'Target career path not found.');
    targetName = path.title;
  } else {
    throw new ApiError(400, 'Invalid targetType. Must be "job" or "path".');
  }

  const prompt = `
    The user wants to become or qualify for: "${targetName}".
    The user's current skills are: [${userSkillNames.join(', ')}].
    Analyze the gap between their current skills and the skills typically required for this target.
    Return ONLY a valid JSON object with the following keys:
    - matchingSkills (array of strings)
    - missingSkills (array of strings)
    - matchPercentage (number between 0 and 100)
    - gapPercentage (number between 0 and 100)
    - recommendation (string, a short personalized recommendation on what to learn)
  `;

  const completion = await openai.chat.completions.create({
    model: 'grok-beta',
    messages: [
      { role: 'system', content: 'You are an expert technical recruiter and career coach. Always output valid JSON.' },
      { role: 'user', content: prompt }
    ]
  });

  let resStr = completion.choices[0].message.content.trim();
  if (resStr.startsWith('```json')) resStr = resStr.substring(7, resStr.length - 3).trim();
  
  let gapData;
  try {
    gapData = JSON.parse(resStr);
  } catch (error) {
    throw new ApiError(500, 'Failed to parse AI response for skill gap analysis.');
  }

  return {
    targetType,
    targetId,
    targetName,
    ...gapData
  };
};

const getCareerRecommendations = async (userId) => {
  const skills = await prisma.skill.findMany({
    where: { userId },
    select: { name: true }
  });

  if (skills.length === 0) {
    return { recommendations: [], message: 'Please add some skills to get personalized career recommendations.' };
  }

  const skillNames = skills.map(s => s.name);

  const prompt = `
    A user has the following skills: [${skillNames.join(', ')}].
    Based on these skills, suggest exactly 3 possible career paths they could pursue.
    Return ONLY a valid JSON object with a key "recommendations" which is an array of objects.
    Each object must have:
    - suggestedCareer (string)
    - reasoning (string, explaining why based on their specific skills)
    - confidenceScore (number between 0.0 and 1.0)
  `;

  const completion = await openai.chat.completions.create({
    model: 'grok-beta',
    messages: [
      { role: 'system', content: 'You are an expert career counselor. Always output valid JSON.' },
      { role: 'user', content: prompt }
    ]
  });

  let resStr = completion.choices[0].message.content.trim();
  if (resStr.startsWith('```json')) resStr = resStr.substring(7, resStr.length - 3).trim();
  
  let recData;
  try {
    recData = JSON.parse(resStr);
  } catch (error) {
    throw new ApiError(500, 'Failed to parse AI response for career recommendations.');
  }

  // Save recommendations to DB
  return prisma.$transaction(async (tx) => {
    await tx.aIRecommendation.deleteMany({ where: { userId } });
    const createdRecs = [];
    for (const rec of recData.recommendations) {
      const dbRec = await tx.aIRecommendation.create({
        data: {
          suggestedCareer: rec.suggestedCareer,
          reasoning: rec.reasoning,
          confidenceScore: rec.confidenceScore,
          userId
        }
      });
      createdRecs.push(dbRec);
    }
    return createdRecs;
  });
};

const getLearningRecommendations = async (userId) => {
  // Using the new Grok-powered getSkillGapAnalysis
  const enrollments = await prisma.assessment.findMany({
    where: { userId, category: 'CareerPathEnrollment' }
  });

  let missingSkills = [];
  if (enrollments.length > 0) {
    for (const en of enrollments) {
      const pathTitle = en.title.substring(10);
      const path = CAREER_PATHS.find(p => p.title === pathTitle);
      if (path) {
        try {
          const gap = await getSkillGapAnalysis(userId, 'path', path.id);
          missingSkills.push(...gap.missingSkills);
        } catch(e) {
          console.error("Gap analysis failed in learning recommendation:", e);
        }
      }
    }
  }

  if (missingSkills.length === 0) missingSkills = ['Data Structures', 'REST APIs', 'SQL'];
  missingSkills = [...new Set(missingSkills)];

  const recommendedResources = [];
  for (const skill of missingSkills) {
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { title: { contains: skill, mode: 'insensitive' } },
          { category: { contains: skill, mode: 'insensitive' } }
        ]
      },
      take: 2
    });

    if (resources.length > 0) {
      recommendedResources.push(...resources);
    } else {
      recommendedResources.push({
        title: `Introduction to ${skill}`,
        type: 'Course',
        url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
        category: skill,
        isPremium: false
      });
    }
  }

  return {
    missingSkillsDetected: missingSkills,
    recommendedResources: recommendedResources.slice(0, 5)
  };
};
const models = require('../../utils/models');

const performRAGMatch = async (userId, resumeText, jobDescription) => {
  if (!resumeText || !jobDescription) {
    throw new ApiError(400, 'Both resumeText and jobDescription are required.');
  }

  // Step 1: Chunking the resume (sliding window of ~150 chars overlap)
  const chunkSize = 400;
  const chunkOverlap = 100;
  const chunks = [];
  
  for (let i = 0; i < resumeText.length; i += (chunkSize - chunkOverlap)) {
    const chunk = resumeText.slice(i, i + chunkSize).trim();
    if (chunk.length > 20) {
      chunks.push(chunk);
    }
  }

  if (chunks.length === 0) {
    chunks.push(resumeText);
  }

  // Step 2: Create Embeddings for Chunks using BGE small local model
  const chunkEmbeddings = await Promise.all(chunks.map(chunk => models.getEmbeddings(chunk)));
  
  // Create Embedding for Job Description
  const jobEmbedding = await models.getEmbeddings(jobDescription);

  // Step 3: Similarity Search (Cosine similarity)
  const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  const similarities = chunks.map((chunk, index) => ({
    chunk,
    similarity: cosineSimilarity(chunkEmbeddings[index], jobEmbedding)
  }));

  // Retrieve top similarity chunks
  const topSimilarityChunks = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10)
    .map(item => item.chunk);

  // Step 4: Reranker using BAAI/bge-reranker-base local model
  let finalContextChunks = [];
  try {
    const reranked = await models.rerank(jobDescription, topSimilarityChunks, 'Xenova/bge-reranker-base', 4);
    finalContextChunks = reranked.map(item => item.document);
  } catch (error) {
    console.error("Local Reranker failed, falling back to top similarity chunks:", error);
    finalContextChunks = topSimilarityChunks.slice(0, 4);
  }

  const contextText = finalContextChunks.join('\n\n');

  // Step 5: LLM Synthesis with Grok AI
  const completion = await openai.chat.completions.create({
    model: 'grok-beta',
    messages: [
      {
        role: 'system',
        content: 'You are an elite ATS matching system. Given a Job Description and relevant sections of a candidate\'s Resume, calculate the matching percentage and return a valid JSON object with the following exact keys: matchPercentage (number), strongMatches (array of strings), missingSkills (array of strings), suggestions (array of strings).'
      },
      {
        role: 'role',
        content: `Job Description:\n${jobDescription}\n\nRelevant Resume Context:\n${contextText}`
      }
    ]
  });

  let responseText = completion.choices[0].message.content.trim();
  if (responseText.startsWith('```json')) {
    responseText = responseText.substring(7, responseText.length - 3).trim();
  }

  try {
    const analysis = JSON.parse(responseText);
    return analysis;
  } catch (err) {
    console.error("Error parsing Grok RAG match output:", err);
    // Safe fallback
    return {
      matchPercentage: 70,
      strongMatches: ["Skills listed in resume"],
      missingSkills: ["Skills missing in text"],
      suggestions: ["Tailor your resume description more closely to target job posting."]
    };
  }
};

// New Chat Assistant Feature
const aiChatAssistant = async (userId, message, context = '') => {
  const completion = await openai.chat.completions.create({
    model: 'grok-beta',
    messages: [
      { role: 'system', content: `You are CareerFlow AI, a helpful and expert career coach. Keep responses concise and practical. User Context: ${context}` },
      { role: 'user', content: message }
    ]
  });

  return {
    message: completion.choices[0].message.content,
    timestamp: new Date()
  };
};

module.exports = {
  analyzeResume,
  analyzeResumeTextDirect,
  getSkillGapAnalysis,
  getCareerRecommendations,
  getLearningRecommendations,
  aiChatAssistant,
  performRAGMatch
};
