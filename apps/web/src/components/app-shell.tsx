'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiStatus } from './api-status';
import { ThemeProvider, useTheme } from './theme-provider';

function ShellContent() {
  const { dark, toggle } = useTheme();
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-mark">O</span>
          <span>
            orgmind<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          <a className="nav-link active" href="#">
            <span>⌂</span> Overview
          </a>
          <a className="nav-link muted" href="#">
            <span>▤</span> Knowledge base
          </a>
          <a className="nav-link muted" href="#">
            <span>◷</span> Recent activity
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">JT</div>
          <div>
            <strong>Jahid Tuhin</strong>
            <small>Workspace owner</small>
          </div>
          <span className="more">···</span>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Overview
          </div>
          <div className="top-actions">
            <ApiStatus />
            <button className="icon-button" onClick={toggle} aria-label="Toggle dark mode">
              {dark ? '☀' : '☾'}
            </button>
            <div className="avatar small">JT</div>
          </div>
        </header>
        <section className="content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">YOUR COMPANY KNOWLEDGE, CONNECTED</p>
              <h1>
                Good morning, Jahid <span>✦</span>
              </h1>
              <p className="lead">A little more clarity for everything your team knows.</p>
            </div>
            <div className="date-chip">FRIDAY, NOVEMBER 6</div>
          </div>
          <div className="hero-card">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span className="sparkle">✳</span> MEET YOUR KNOWLEDGE ASSISTANT
              </div>
              <h2>
                Answers are already
                <br />
                within reach.
              </h2>
              <p>
                OrgMind brings your company knowledge together, so your team can focus on what
                matters next.
              </p>
              <button className="primary-button">
                Start a conversation <span>→</span>
              </button>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="orb-core">✳</div>
              <div className="float-card card-a">
                ⌕ <span>Find what you need</span>
              </div>
              <div className="float-card card-b">
                ✧ <span>Grounded in your knowledge</span>
              </div>
              <div className="float-card card-c">
                ↗ <span>Move forward with clarity</span>
              </div>
            </div>
          </div>
          <div className="section-head">
            <div>
              <h3>Your workspace</h3>
              <p>Everything starts with the knowledge you share.</p>
            </div>
            <button className="text-button">
              View all <span>→</span>
            </button>
          </div>
          <div className="stat-grid">
            <article className="stat-card">
              <div className="stat-icon violet">▤</div>
              <div className="stat-label">KNOWLEDGE SOURCES</div>
              <div className="stat-value">—</div>
              <div className="stat-note">Your team&apos;s shared knowledge</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon mint">✦</div>
              <div className="stat-label">QUESTIONS ANSWERED</div>
              <div className="stat-value">—</div>
              <div className="stat-note">Insights, ready when you are</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon amber">◷</div>
              <div className="stat-label">TIME GIVEN BACK</div>
              <div className="stat-value">—</div>
              <div className="stat-note">More space for meaningful work</div>
            </article>
          </div>
          <div className="bottom-note">
            <span>✳</span>
            <p>
              <strong>Good knowledge grows through sharing.</strong> Connect a source to give your
              workspace a strong start.
            </p>
            <button className="text-button">Explore knowledge base →</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export function AppShell() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <ShellContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
