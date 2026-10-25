import React, { useRef, useState } from 'react'
import { TowerIcon } from '../../../assets/icons/towericon';
import { analyzeResume } from '../../../api/authApi';

const MIN_JD = 50;
const MAX_SIZE = 5 * 1024 * 1024;

// Score ke hisab se colors
const scoreTheme = (s) =>
  s >= 85
    ? { text: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' }
    : s >= 70
    ? { text: 'text-indigo-600', bg: 'bg-indigo-50', bar: 'bg-indigo-500' }
    : s >= 50
    ? { text: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' }
    : { text: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500' };

const BREAKDOWN_LABELS = {
  skills: 'Skills Match',
  keywords: 'Keywords',
  experience: 'Experience',
  sections: 'Resume Sections',
  formatting: 'Formatting & Contact',
};

const getUserName = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.name || 'User';
  } catch {
    return 'User';
  }
};

function Chip({ children, tone }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Dashboard() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setError('');
    if (!f) return setFile(null);

    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF format (.pdf) resumes are accepted.');
      e.target.value = '';
      return setFile(null);
    }
    if (f.size > MAX_SIZE) {
      setError('Resume must be smaller than 5 MB.');
      e.target.value = '';
      return setFile(null);
    }
    setFile(f);
  };

  const handleAnalyze = async () => {
    setError('');
    if (!file) return setError('Please upload your resume first.');
    if (jobDesc.trim().length < MIN_JD)
      return setError(`Please paste the complete job description (at least ${MIN_JD} characters).`);

    setLoading(true);
    try {
      const data = await analyzeResume(file, jobDesc.trim());
      setResult(data.analysis);
    } catch (err) {
      setError(err.status === 401 ? 'Your session has expired. Please log in again.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDesc('');
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const theme = result ? scoreTheme(result.matchPercentage) : null;

  return (
    // pt-20 on mobile leaves room for the sidebar's fixed hamburger button
    <div className="grid min-h-screen w-full grid-cols-1 gap-6 bg-slate-50 px-4 pb-8 pt-20 md:px-8 md:pt-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
            Smart Resume Screening
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Resume Match Score
          </div>
        </div>

        {/* ===== Upload form ===== */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="text-sm font-semibold text-slate-900">🔔 Important Instruction</div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
            📝 Please paste the complete job description in the 'Job Description' field before uploading the resume.
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-800">
            ❔ Only PDF format (.pdf) resumes are accepted.
          </div>

          <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40">
            <div className="text-base font-semibold text-slate-900">Upload Your Resume</div>
            <div className="flex flex-col gap-2">
              <label htmlFor="inputfield" className="text-sm font-medium text-slate-600">
                Upload Resume
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                id="inputfield"
                onChange={handleFile}
                disabled={loading}
                className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition-colors hover:file:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {file && (
                <p className="text-xs text-slate-500">
                  Selected: <span className="font-medium text-slate-700">{file.name}</span> ({(file.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <textarea
              placeholder="Paste your job description..."
              rows={5}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              disabled={loading}
              className="min-h-[160px] w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
            />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{jobDesc.trim().length} characters{jobDesc.trim().length < MIN_JD && ` (min ${MIN_JD})`}</span>
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {result && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  New Analysis
                </button>
              )}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>

        {/* ===== Detailed analysis ===== */}
        {result && (
          <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div>
              <div className="text-base font-semibold text-slate-900">Detailed Analysis</div>
              <p className="text-xs text-slate-500">
                {result.jobTitle} · {result.fileName}
              </p>
            </div>

            {/* Breakdown */}
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(result.breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{BREAKDOWN_LABELS[key] || key}</span>
                    <span className="font-semibold text-slate-900">{value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${scoreTheme(value).bar} transition-all duration-700`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <b className="text-sm font-semibold text-slate-900">✅ Matched Skills ({result.matchedSkills.length})</b>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.matchedSkills.length
                    ? result.matchedSkills.map((s) => <Chip key={s} tone="green">{s}</Chip>)
                    : <span className="text-sm text-slate-500">No matching skills found.</span>}
                </div>
              </div>
              <div>
                <b className="text-sm font-semibold text-slate-900">❌ Missing Skills ({result.missingSkills.length})</b>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.missingSkills.length
                    ? result.missingSkills.map((s) => <Chip key={s} tone="red">{s}</Chip>)
                    : <span className="text-sm text-slate-500">You have all the required skills. 🎉</span>}
                </div>
              </div>
            </div>

            {result.extraSkills?.length > 0 && (
              <div>
                <b className="text-sm font-semibold text-slate-900">➕ Additional Skills</b>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.extraSkills.map((s) => <Chip key={s} tone="slate">{s}</Chip>)}
                </div>
              </div>
            )}

            {/* Experience + stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Required Exp.', result.experience?.required != null ? `${result.experience.required}+ yrs` : '—'],
                ['Your Exp.', result.experience?.found != null ? `${result.experience.found} yrs` : '—'],
                ['Action Verbs', result.stats?.actionVerbs ?? 0],
                ['Achievements', result.stats?.quantifiedAchievements ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div>
                <b className="text-sm font-semibold text-slate-900">💪 Strengths</b>
                <ul className="mt-2 space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="text-emerald-500">●</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div>
                <b className="text-sm font-semibold text-slate-900">💡 Suggestions to Improve</b>
                <ul className="mt-2 space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="text-amber-500">●</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Right column ===== */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-600/20">
          <div className="text-sm font-medium text-indigo-100">Analyze with A.I.</div>
          <img
            className="h-20 w-20 rounded-full border-4 border-white/30 object-cover shadow-md"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTluYoCu7ux3synmi_Akw92BIhgoj0jDt45AUWW7_2hcwu_48B6I1yu4Yjj&s=10"
            alt="Profile"
          />
          <h4 className="text-lg font-semibold">{getUserName()}</h4>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-8">
          <div className="text-sm font-semibold uppercase tracking-wider text-slate-500">Result</div>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8 text-sm text-slate-500">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              Analyzing your resume...
            </div>
          ) : result ? (
            <>
              <div className={`flex items-center justify-between rounded-xl px-5 py-4 ${theme.bg}`}>
                <div>
                  <h1 className={`text-4xl font-bold ${theme.text}`}>{result.matchPercentage}%</h1>
                  <p className={`text-sm font-semibold ${theme.text}`}>{result.verdict} Match</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm [&>svg]:h-6 [&>svg]:w-6 ${theme.text}`}>
                  <TowerIcon />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <b className="text-sm font-semibold text-slate-900">Feedback</b>
                <p className="text-sm leading-relaxed text-slate-600">{result.summary}</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 px-5 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm [&>svg]:h-6 [&>svg]:w-6">
                <TowerIcon />
              </div>
              <p className="text-sm font-medium text-slate-700">No analysis yet</p>
              <p className="text-xs text-slate-500">Upload your resume and paste a job description to see your match score.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard