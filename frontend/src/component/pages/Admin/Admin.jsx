import React, { useMemo, useState } from 'react'

/* ----------------------------------------------------------------
   Smart Resume — Admin Page (content only, Tailwind CSS)
   No sidebar / header / footer — drop it inside your own layout.
   Replace the mock data below with data from your Express API.
------------------------------------------------------------------ */

/* ---------- Inline icon set ---------- */
const paths = {
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h5',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m22 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  chart: 'M3 3v18h18M7 15l4-4 3 3 5-6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
  close: 'M18 6 6 18M6 6l12 12',
  up: 'm18 15-6-6-6 6',
  down: 'm6 9 6 6 6-6',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  trash: 'M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  sparkle: 'M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3Z',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m14-7-5-5-5 5m5-5v12',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5m-5 5V3',
}

const Icon = ({ name, className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={paths[name]} />
  </svg>
)

/* ---------- Mock data ---------- */
const stats = [
  { label: 'Total Resumes', value: '12,842', change: 12.5, icon: 'file', tint: 'from-indigo-500 to-violet-500' },
  { label: 'Active Users', value: '3,291', change: 8.2, icon: 'users', tint: 'from-sky-500 to-cyan-500' },
  { label: 'Avg. ATS Score', value: '72.4', change: 3.1, icon: 'sparkle', tint: 'from-emerald-500 to-teal-500' },
  { label: 'Analyses Today', value: '486', change: -4.3, icon: 'chart', tint: 'from-amber-500 to-orange-500' },
]

const weekly = [
  { day: 'Mon', uploads: 320, analyzed: 290 },
  { day: 'Tue', uploads: 410, analyzed: 380 },
  { day: 'Wed', uploads: 380, analyzed: 350 },
  { day: 'Thu', uploads: 520, analyzed: 470 },
  { day: 'Fri', uploads: 610, analyzed: 580 },
  { day: 'Sat', uploads: 290, analyzed: 270 },
  { day: 'Sun', uploads: 240, analyzed: 220 },
]

const scoreBands = [
  { label: 'Excellent (85+)', pct: 22, color: 'bg-emerald-500' },
  { label: 'Good (70–84)', pct: 38, color: 'bg-indigo-500' },
  { label: 'Average (50–69)', pct: 27, color: 'bg-amber-500' },
  { label: 'Poor (<50)', pct: 13, color: 'bg-rose-500' },
]

const topSkills = [
  { name: 'React', count: 4210 },
  { name: 'Node.js', count: 3685 },
  { name: 'MongoDB', count: 2940 },
  { name: 'Python', count: 2710 },
  { name: 'AWS', count: 1980 },
]

const resumes = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@mail.com', role: 'Frontend Developer', score: 91, status: 'Analyzed', date: '25 Oct 2026' },
  { id: 2, name: 'Priya Patel', email: 'priya@mail.com', role: 'Data Analyst', score: 78, status: 'Analyzed', date: '25 Oct 2026' },
  { id: 3, name: 'Rohan Mehta', email: 'rohan@mail.com', role: 'Backend Engineer', score: 0, status: 'Processing', date: '25 Oct 2026' },
  { id: 4, name: 'Sneha Iyer', email: 'sneha@mail.com', role: 'UI/UX Designer', score: 64, status: 'Analyzed', date: '24 Oct 2026' },
  { id: 5, name: 'Karan Verma', email: 'karan@mail.com', role: 'DevOps Engineer', score: 0, status: 'Failed', date: '24 Oct 2026' },
  { id: 6, name: 'Ananya Gupta', email: 'ananya@mail.com', role: 'Full Stack Developer', score: 86, status: 'Analyzed', date: '24 Oct 2026' },
  { id: 7, name: 'Vikram Singh', email: 'vikram@mail.com', role: 'ML Engineer', score: 47, status: 'Analyzed', date: '23 Oct 2026' },
]

const activity = [
  { text: 'Ananya Gupta uploaded a new resume', time: '2 min ago', icon: 'upload', color: 'text-indigo-600 bg-indigo-50' },
  { text: 'Analysis completed for Aarav Sharma', time: '8 min ago', icon: 'sparkle', color: 'text-emerald-600 bg-emerald-50' },
  { text: 'New user registered: Meera Joshi', time: '21 min ago', icon: 'users', color: 'text-sky-600 bg-sky-50' },
  { text: 'Parsing failed for Karan Verma', time: '1 hr ago', icon: 'close', color: 'text-rose-600 bg-rose-50' },
]

/* ---------- Helpers ---------- */
const statusStyles = {
  Analyzed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Processing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const scoreColor = (s) =>
  s >= 85 ? 'bg-emerald-500' : s >= 70 ? 'bg-indigo-500' : s >= 50 ? 'bg-amber-500' : 'bg-rose-500'

const initials = (name) => name.split(' ').map((n) => n[0]).join('')

const Card = ({ className = '', children }) => (
  <div className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ${className}`}>
    {children}
  </div>
)

/* ---------- Page ---------- */
function Admin() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(
    () =>
      resumes.filter(
        (r) =>
          (filter === 'All' || r.status === filter) &&
          (r.name + r.email + r.role).toLowerCase().includes(query.toLowerCase())
      ),
    [query, filter]
  )

  const maxWeekly = Math.max(...weekly.map((d) => d.uploads))
  const maxSkill = topSkills[0].count

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Smart Resume Admin</h2>
            <p className="mt-1 text-sm text-slate-500">Overview of resumes, users and analysis performance.</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              <Icon name="download" className="h-4 w-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-700">
              <Icon name="sparkle" className="h-4 w-4" /> New Job Role
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{s.value}</p>
                </div>
                <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${s.tint} text-white shadow-lg`}>
                  <Icon name={s.icon} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs">
                <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold ${
                  s.change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  <Icon name={s.change >= 0 ? 'up' : 'down'} className="h-3 w-3" />
                  {Math.abs(s.change)}%
                </span>
                <span className="text-slate-500">vs last week</span>
              </div>
            </Card>
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">Resume Activity</h3>
                <p className="text-xs text-slate-500">Uploads vs analyses this week</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" /> Uploads</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-200" /> Analyzed</span>
              </div>
            </div>
            <div className="mt-6 flex h-64 items-end gap-3 sm:gap-6">
              {weekly.map((d) => (
                <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-56 w-full items-end justify-center gap-1">
                    <div className="pointer-events-none absolute -top-2 z-10 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] text-white opacity-0 transition group-hover:opacity-100">
                      {d.uploads} / {d.analyzed}
                    </div>
                    <div className="w-1/2 max-w-[18px] rounded-t-md bg-indigo-500 transition-all group-hover:bg-indigo-600"
                      style={{ height: `${(d.uploads / maxWeekly) * 100}%` }} />
                    <div className="w-1/2 max-w-[18px] rounded-t-md bg-indigo-200"
                      style={{ height: `${(d.analyzed / maxWeekly) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{d.day}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-900">ATS Score Distribution</h3>
            <p className="text-xs text-slate-500">Across all analyzed resumes</p>
            <div className="relative mx-auto mt-6 h-40 w-40">
              <div
                className="h-full w-full rounded-full"
                style={{ background: 'conic-gradient(#10b981 0 22%, #6366f1 22% 60%, #f59e0b 60% 87%, #f43f5e 87% 100%)' }}
              />
              <div className="absolute inset-4 grid place-items-center rounded-full bg-white">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">72.4</p>
                  <p className="text-[11px] text-slate-500">Avg. score</p>
                </div>
              </div>
            </div>
            <ul className="mt-6 space-y-2.5">
              {scoreBands.map((b) => (
                <li key={b.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} /> {b.label}
                  </span>
                  <span className="font-semibold text-slate-900">{b.pct}%</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Table + side panels */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="p-0 xl:col-span-2">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Recent Resumes</h3>
                <p className="text-xs text-slate-500">{filtered.length} results</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-medium">
                  {['All', 'Analyzed', 'Processing', 'Failed'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-lg px-3 py-1.5 transition ${
                        filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-44"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Target Role</th>
                    <th className="px-5 py-3">ATS Score</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <tr key={r.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                            {initials(r.name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{r.name}</p>
                            <p className="text-xs text-slate-500">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{r.role}</td>
                      <td className="px-5 py-3.5">
                        {r.status === 'Analyzed' ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                              <div className={`h-full rounded-full ${scoreColor(r.score)}`} style={{ width: `${r.score}%` }} />
                            </div>
                            <span className="font-semibold text-slate-900">{r.score}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[r.status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full bg-current ${r.status === 'Processing' ? 'animate-pulse' : ''}`} />
                          {r.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{r.date}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" aria-label="View">
                            <Icon name="eye" className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete">
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">
                        No resumes match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <span>Showing 1–{filtered.length} of 12,842</span>
              <div className="flex gap-1">
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50">Previous</button>
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50">Next</button>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-slate-900">Top Skills Detected</h3>
              <p className="text-xs text-slate-500">Most common in uploaded resumes</p>
              <ul className="mt-5 space-y-4">
                {topSkills.map((s, i) => (
                  <li key={s.name}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        <span className="mr-2 text-slate-400">#{i + 1}</span>{s.name}
                      </span>
                      <span className="text-slate-500">{s.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        style={{ width: `${(s.count / maxSkill) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Recent Activity</h3>
                <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View all</button>
              </div>
              <ul className="mt-5 space-y-4">
                {activity.map((a, i) => (
                  <li key={i} className="flex gap-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${a.color}`}>
                      <Icon name={a.icon} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">{a.text}</p>
                      <p className="text-xs text-slate-400">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Admin