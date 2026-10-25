/* ------------------------------------------------------------------
   Resume Analyzer (ATS-style)
   Resume text ko Job Description se compare karke match percentage,
   score breakdown, matched/missing skills aur suggestions deta hai.
   Koi paid AI API nahi chahiye — sab kuch locally hota hai.
------------------------------------------------------------------- */

// ---------- Skill dictionary: canonical name -> aliases ----------
const SKILLS = {
  // Languages
  JavaScript: ["javascript", "js", "es6", "ecmascript"],
  TypeScript: ["typescript", "ts"],
  Python: ["python"],
  Java: ["java"],
  "C++": ["c++", "cpp"],
  "C#": ["c#", "csharp"],
  Go: ["golang"],
  Rust: ["rust"],
  PHP: ["php"],
  Ruby: ["ruby"],
  Kotlin: ["kotlin"],
  Swift: ["swift"],
  Dart: ["dart"],
  SQL: ["sql"],
  HTML: ["html", "html5"],
  CSS: ["css", "css3"],

  // Frontend
  React: ["react", "react.js", "reactjs"],
  "Next.js": ["next.js", "nextjs"],
  Angular: ["angular", "angularjs"],
  "Vue.js": ["vue", "vue.js", "vuejs"],
  Redux: ["redux", "redux toolkit"],
  "Tailwind CSS": ["tailwind", "tailwindcss", "tailwind css"],
  Bootstrap: ["bootstrap"],
  SASS: ["sass", "scss"],
  "React Native": ["react native"],
  Flutter: ["flutter"],

  // Backend
  "Node.js": ["node", "node.js", "nodejs"],
  "Express.js": ["express", "express.js", "expressjs"],
  NestJS: ["nestjs", "nest.js"],
  Django: ["django"],
  Flask: ["flask"],
  FastAPI: ["fastapi"],
  "Spring Boot": ["spring boot", "springboot", "spring"],
  ".NET": ["asp.net", ".net", "dotnet"],
  Laravel: ["laravel"],
  "REST API": ["rest", "restful", "rest api", "rest apis", "restful api"],
  GraphQL: ["graphql"],
  Microservices: ["microservice", "microservices"],
  "Socket.io": ["socket.io", "websocket", "websockets"],
  JWT: ["jwt", "json web token"],
  OAuth: ["oauth", "oauth2"],

  // Databases
  MongoDB: ["mongodb", "mongo"],
  Mongoose: ["mongoose"],
  MySQL: ["mysql"],
  PostgreSQL: ["postgresql", "postgres"],
  Redis: ["redis"],
  Firebase: ["firebase"],
  Oracle: ["oracle"],

  // DevOps / Cloud
  AWS: ["aws", "amazon web services", "ec2", "s3", "lambda"],
  Azure: ["azure"],
  GCP: ["gcp", "google cloud"],
  Docker: ["docker"],
  Kubernetes: ["kubernetes", "k8s"],
  "CI/CD": ["ci/cd", "cicd", "continuous integration", "github actions", "jenkins"],
  Git: ["git", "github", "gitlab", "bitbucket"],
  Linux: ["linux", "unix", "bash"],
  Nginx: ["nginx"],
  Terraform: ["terraform"],

  // Testing
  Jest: ["jest"],
  Mocha: ["mocha", "chai"],
  Cypress: ["cypress"],
  Selenium: ["selenium"],
  "Unit Testing": ["unit testing", "unit tests", "tdd", "test driven"],

  // Data / AI
  "Machine Learning": ["machine learning", "ml"],
  "Deep Learning": ["deep learning"],
  NLP: ["nlp", "natural language processing"],
  TensorFlow: ["tensorflow"],
  PyTorch: ["pytorch"],
  "scikit-learn": ["scikit-learn", "sklearn"],
  Pandas: ["pandas"],
  NumPy: ["numpy"],
  "Power BI": ["power bi", "powerbi"],
  Tableau: ["tableau"],
  Excel: ["excel", "ms excel"],
  "Data Analysis": ["data analysis", "data analytics"],
  LLM: ["llm", "llms", "large language models", "generative ai", "genai"],

  // Design / Tools
  Figma: ["figma"],
  "Adobe XD": ["adobe xd"],
  Photoshop: ["photoshop"],
  Postman: ["postman"],
  Jira: ["jira"],
  Agile: ["agile", "scrum", "kanban"],

  // Soft skills
  Communication: ["communication", "communication skills"],
  Leadership: ["leadership", "team lead", "led a team"],
  "Problem Solving": ["problem solving", "problem-solving"],
  Teamwork: ["teamwork", "collaboration", "team player"],
};

const SECTIONS = {
  Summary: ["summary", "profile", "objective", "about me", "professional summary"],
  Experience: ["experience", "work experience", "employment", "work history", "internship", "internships"],
  Education: ["education", "academic", "qualification", "qualifications"],
  Skills: ["skills", "technical skills", "core competencies", "tech stack"],
  Projects: ["projects", "personal projects", "academic projects"],
  Certifications: ["certifications", "certificates", "certification", "courses"],
};

const ACTION_VERBS = [
  "achieved", "built", "created", "designed", "developed", "delivered", "deployed",
  "engineered", "implemented", "improved", "increased", "reduced", "launched", "led",
  "managed", "optimized", "automated", "architected", "collaborated", "migrated",
  "integrated", "streamlined", "mentored", "resolved", "spearheaded", "initiated",
  "established", "enhanced", "accelerated", "maintained", "refactored", "scaled",
];

const STOPWORDS = new Set(
  (
    "a about above after again against all am an and any are as at be because been before being below between both but by " +
    "can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how " +
    "i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own " +
    "same she should so some such than that the their theirs them themselves then there these they this those through to too under until up " +
    "very was we were what when where which while who whom why will with you your yours yourself yourselves " +
    "able ability etc including include includes using use used work working works job role candidate candidates team teams company " +
    "looking seeking must should would plus strong good great excellent knowledge understanding experience experienced year years yrs " +
    "required requirements requirement preferred responsibilities responsibility qualifications skills skill ideal join well new also " +
    "across within based like least min minimum ensure help day per apply opportunity position environment hands related relevant " +
    "familiarity familiar proficiency proficient expertise expert solid bonus nice degree bachelor bachelors master masters field equivalent " +
    "present presenting hiring hire hired write writing build building make making want wants need needs get take give know will shall may might " +
    "full-time part-time remote onsite hybrid location salary ctc lpa benefits immediate joiners joiner apply interested " +
    "we're you'll you're it's they're etc. e.g. i.e. us our ourselves company's"
  ).split(" ")
);

// ---------- Helpers ----------
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

// Word-boundary jo "c++", "node.js", "c#" jaise terms ke saath bhi kaam kare
const termRegex = (term) =>
  new RegExp(`(?<![a-z0-9+#.])${escapeRegex(term.toLowerCase())}(?![a-z0-9+#])`, "i");

const normalize = (text) =>
  (text || "")
    .replace(/ /g, " ")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[ \t]+/g, " ")
    .toLowerCase();

const pct = (n) => Math.max(0, Math.min(100, Math.round(n)));

// Keyword ke word-forms bhi match karo: collaborate ~ collaborated/collaborating,
// pipelines ~ pipeline, scalable ~ scalability
const stem = (w) => w.replace(/(ing|ed|es|s|e|ity|ability|able|ation|ment)$/, "");
const keywordInText = (keyword, text) => {
  if (termRegex(keyword).test(text)) return true;
  const root = stem(keyword);
  if (root.length < 4) return false;
  return new RegExp(`(?<![a-z0-9])${escapeRegex(root)}[a-z]{0,6}(?![a-z0-9])`, "i").test(text);
};

const findSkills = (text) =>
  Object.entries(SKILLS)
    .filter(([, aliases]) => aliases.some((a) => termRegex(a).test(text)))
    .map(([name]) => name);

// JD se important keywords nikalta hai (skills ke alawa)
const extractKeywords = (jdText, skillNames, limit = 20) => {
  const skillTokens = new Set(
    skillNames.flatMap((s) => SKILLS[s].concat(s.toLowerCase())).flatMap((a) => a.split(/\s+/))
  );

  const freq = {};
  jdText
    .split(/[^a-z0-9+#.\-]+/)
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^[\d+\-.]+$/.test(w) && !skillTokens.has(w))
    .forEach((w) => (freq[w] = (freq[w] || 0) + 1));

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([w]) => w);
};

// JD me "3+ years" jaisi requirement
const requiredYears = (jdText) => {
  const matches = [...jdText.matchAll(/(?<![\d.])(\d{1,2})\s*\+?\s*(?:-|to)?\s*(?:\d{1,2})?\s*\+?\s*(?:years?|yrs?)/g)];
  if (!matches.length) return null;
  return Math.min(...matches.map((m) => parseInt(m[1], 10)).filter((n) => n > 0 && n < 30)) || null;
};

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };

// Resume se total experience (years) — date ranges merge karke, ya "X years" statement se
const resumeYears = (text) => {
  const now = new Date();
  const month = "(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\\.?";
  const re = new RegExp(
    `(?:${month}\\s*)?((?:19|20)\\d{2})\\s*(?:-|to|until)\\s*(?:(?:${month}\\s*)?((?:19|20)\\d{2})|(present|current|now|till date|date))`,
    "g"
  );

  const ranges = [];
  for (const m of text.matchAll(re)) {
    const sm = m[1] ? MONTHS[m[1].slice(0, 3)] : 0;
    const sy = parseInt(m[2], 10);
    let em, ey;
    if (m[5]) {
      ey = now.getFullYear();
      em = now.getMonth();
    } else {
      ey = parseInt(m[4], 10);
      em = m[3] ? MONTHS[m[3].slice(0, 3)] : 11;
    }
    const start = sy * 12 + sm;
    const end = ey * 12 + em;
    if (sy >= 1970 && end >= start && end <= now.getFullYear() * 12 + 11) ranges.push([start, end]);
  }

  // Education ranges ko (4-5 saal wale) bhi count ho sakte hain — isliye
  // explicit "X years of experience" statement ko priority dete hain.
  const stated = text.match(/(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:professional\s+|industry\s+|work\s+)?experience/);
  if (stated) return parseFloat(stated[1]);

  if (!ranges.length) return null;

  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0].slice()];
  for (const [s, e] of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  const months = merged.reduce((sum, [s, e]) => sum + (e - s + 1), 0);
  return Math.round((months / 12) * 10) / 10;
};

const verdictFor = (score) =>
  score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Average" : "Poor";

// ---------- Main ----------
function analyzeResume(resumeRaw, jdRaw) {
  const resume = normalize(resumeRaw);
  const jd = normalize(jdRaw);

  // 1. Skills
  const jdSkills = findSkills(jd);
  const resumeSkills = findSkills(resume);
  const matchedSkills = jdSkills.filter((s) => resumeSkills.includes(s));
  const missingSkills = jdSkills.filter((s) => !resumeSkills.includes(s));
  const extraSkills = resumeSkills.filter((s) => !jdSkills.includes(s));

  // 2. Keywords
  const keywords = extractKeywords(jd, jdSkills);
  const matchedKeywords = keywords.filter((k) => keywordInText(k, resume));
  const missingKeywords = keywords.filter((k) => !matchedKeywords.includes(k));

  const keywordScore = keywords.length ? (matchedKeywords.length / keywords.length) * 100 : 70;
  const skillScore = jdSkills.length ? (matchedSkills.length / jdSkills.length) * 100 : keywordScore;

  // 3. Experience
  const reqYears = requiredYears(jd);
  const foundYears = resumeYears(resume);
  let experienceScore;
  if (reqYears == null) experienceScore = foundYears ? 100 : 75;
  else if (foundYears == null) experienceScore = 40;
  else experienceScore = Math.min(1, foundYears / reqYears) * 100;

  // 4. Sections
  const lines = resume.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const foundSections = Object.entries(SECTIONS)
    .filter(([, heads]) =>
      lines.some((l) => l.length <= 40 && heads.some((h) => l.replace(/[:|•\-]/g, "").trim().startsWith(h)))
    )
    .map(([name]) => name);
  const missingSections = Object.keys(SECTIONS).filter((s) => !foundSections.includes(s));
  const sectionScore = (foundSections.length / Object.keys(SECTIONS).length) * 100;

  // 5. Formatting / ATS readability
  const contact = {
    email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(resume),
    phone: /(\+?\d[\d\s\-()]{8,}\d)/.test(resume),
    linkedin: /linkedin\.com\/|linkedin/.test(resume),
    github: /github\.com\/|github/.test(resume),
  };
  const words = resume.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const actionVerbs = ACTION_VERBS.filter((v) => termRegex(v).test(resume)).length;
  const quantified = (resume.match(/\d+(?:\.\d+)?\s*(?:%|\+|x\b|k\b|lpa|users|clients|projects|ms\b|million|crore|lakh)|[$₹]\s?\d+/g) || []).length;

  let formatScore = 0;
  if (contact.email) formatScore += 25;
  if (contact.phone) formatScore += 20;
  if (contact.linkedin) formatScore += 10;
  if (wordCount >= 250 && wordCount <= 1200) formatScore += 20;
  else if (wordCount >= 150) formatScore += 10;
  if (actionVerbs >= 5) formatScore += 15;
  else if (actionVerbs >= 2) formatScore += 8;
  if (quantified >= 3) formatScore += 10;
  else if (quantified >= 1) formatScore += 5;

  // ---------- Final weighted score ----------
  const breakdown = {
    skills: pct(skillScore),
    keywords: pct(keywordScore),
    experience: pct(experienceScore),
    sections: pct(sectionScore),
    formatting: pct(formatScore),
  };

  const matchPercentage = pct(
    breakdown.skills * 0.4 +
      breakdown.keywords * 0.25 +
      breakdown.experience * 0.15 +
      breakdown.sections * 0.1 +
      breakdown.formatting * 0.1
  );
  const verdict = verdictFor(matchPercentage);

  // ---------- Strengths ----------
  const strengths = [];
  if (breakdown.skills >= 70 && jdSkills.length)
    strengths.push(`Covers ${matchedSkills.length} of ${jdSkills.length} required skills (${matchedSkills.slice(0, 5).join(", ")}).`);
  if (reqYears && foundYears && foundYears >= reqYears)
    strengths.push(`Experience (${foundYears} yrs) meets the ${reqYears}+ years requirement.`);
  if (actionVerbs >= 5) strengths.push("Uses strong action verbs to describe work.");
  if (quantified >= 3) strengths.push("Includes measurable, quantified achievements.");
  if (foundSections.length >= 5) strengths.push("Well-structured with all key resume sections.");
  if (extraSkills.length >= 3) strengths.push(`Brings additional skills: ${extraSkills.slice(0, 4).join(", ")}.`);

  // ---------- Suggestions ----------
  const suggestions = [];
  if (missingSkills.length)
    suggestions.push(`Add these skills from the job description if you have them: ${missingSkills.slice(0, 8).join(", ")}.`);
  if (missingKeywords.length >= 3)
    suggestions.push(`Use important JD keywords in your experience/projects: ${missingKeywords.slice(0, 8).join(", ")}.`);
  if (reqYears && foundYears != null && foundYears < reqYears)
    suggestions.push(`The role asks for ${reqYears}+ years; highlight internships, freelance or project work to close the gap.`);
  if (reqYears && foundYears == null)
    suggestions.push("Add clear dates (e.g. Jan 2022 – Present) to each role so ATS can calculate your experience.");
  if (missingSections.length)
    suggestions.push(`Add missing sections: ${missingSections.join(", ")}.`);
  if (!contact.email || !contact.phone)
    suggestions.push("Make sure your email and phone number are clearly visible at the top.");
  if (!contact.linkedin) suggestions.push("Add your LinkedIn profile URL.");
  if (!contact.github && jdSkills.some((s) => !["Communication", "Leadership", "Teamwork", "Problem Solving", "Agile"].includes(s)))
    suggestions.push("Add a GitHub/portfolio link to showcase your technical work.");
  if (actionVerbs < 5)
    suggestions.push("Start bullet points with action verbs like Developed, Built, Optimized, Led.");
  if (quantified < 3)
    suggestions.push("Quantify your impact with numbers (e.g. 'reduced load time by 40%', 'served 10k+ users').");
  if (wordCount < 250) suggestions.push("Your resume is quite short; add more detail on projects and responsibilities.");
  if (wordCount > 1200) suggestions.push("Your resume is long; keep it concise (1–2 pages).");

  const summary =
    `Your resume is a ${verdict.toLowerCase()} match (${matchPercentage}%) for this job. ` +
    (jdSkills.length
      ? `You match ${matchedSkills.length} of ${jdSkills.length} key skills` +
        (missingSkills.length ? `; the biggest gaps are ${missingSkills.slice(0, 3).join(", ")}.` : ".")
      : `About ${breakdown.keywords}% of the important job keywords appear in your resume.`);

  return {
    matchPercentage,
    verdict,
    breakdown,
    matchedSkills,
    missingSkills,
    extraSkills,
    matchedKeywords,
    missingKeywords,
    experience: { required: reqYears, found: foundYears },
    sections: { found: foundSections, missing: missingSections },
    contact,
    stats: { wordCount, actionVerbs, quantifiedAchievements: quantified },
    strengths,
    suggestions,
    summary,
  };
}

module.exports = { analyzeResume };