'use client';

import React, { useState } from 'react';
import './DashboardExplainer.css';

export interface ExplainerFeature {
  id: number;
  title: string;
  description: string;
  marker: { top: string; left: string };
  area: { top: string; left: string; width: string; height: string };
}

const DASHBOARD_FEATURES: ExplainerFeature[] = [
  {
    id: 1,
    title: 'Sliding Dashboard Menu',
    description: 'Layered left-side panel powered by React Bits StaggeredMenu. Access Chat, Projects, New Project, and Settings with smooth physics.',
    marker: { top: '12%', left: '8%' },
    area: { top: '2%', left: '2%', width: '15%', height: '18%' }
  },
  {
    id: 2,
    title: 'Top Bar & Actions',
    description: 'Displays current workspace breadcrumb (StackPilot / Section) and one-click access to the project creation modal.',
    marker: { top: '12%', left: '50%' },
    area: { top: '0%', left: '18%', width: '80%', height: '14%' }
  },
  {
    id: 3,
    title: 'AI Prompt Bar',
    description: 'Central interface equipped with Nova 3 & Nova Mini model selectors, thinking effort slider, mic dictation, and file attachments.',
    marker: { top: '56%', left: '50%' },
    area: { top: '46%', left: '18%', width: '64%', height: '22%' }
  },
  {
    id: 4,
    title: 'Live Build & Logs Terminal',
    description: 'Real-time WebSocket terminal logs streaming folder generation, scaffolding, and container orchestration.',
    marker: { top: '80%', left: '50%' },
    area: { top: '70%', left: '15%', width: '70%', height: '24%' }
  },
  {
    id: 5,
    title: 'Interactive Asset Folder',
    description: 'Expandable 3D React Bits Folder displaying your project auth assets, designs, and preview screenshots.',
    marker: { top: '56%', left: '88%' },
    area: { top: '44%', left: '82%', width: '16%', height: '26%' }
  },
  {
    id: 6,
    title: 'Real-time Socket Engine',
    description: 'Persistent bidirectional connection powering immediate AI token streaming and execution interrupts.',
    marker: { top: '30%', left: '50%' },
    area: { top: '20%', left: '25%', width: '50%', height: '22%' }
  },
  {
    id: 7,
    title: 'Workspace Identity',
    description: 'Personalized user context automatically injected into AI prompts for custom development workflows.',
    marker: { top: '12%', left: '88%' },
    area: { top: '2%', left: '80%', width: '18%', height: '12%' }
  }
];

export const DashboardExplainer: React.FC = () => {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <section className="explainer-container" aria-label="Dashboard Walkthrough">
      <div className="explainer-header">
        <div className="explainer-badge">Interactive Architecture</div>
        <h2 className="explainer-title">How the StackPilot Dashboard Works</h2>
        <p className="explainer-subtitle">
          Hover or focus any hotspot to see how every component connects across the real-time canvas.
        </p>
      </div>

      <div className="explainer-layout">
        {/* Mockup Canvas */}
        <div className="mockup-wrapper" role="region" aria-label="Dashboard interactive diagram">
          <div className="mockup-frame">
            {/* Topbar mockup */}
            <div className="mockup-topbar">
              <div className="flex items-center gap-2">
                <span className="w-16 h-5 rounded-full bg-neutral-200 block" />
                <span className="text-xs font-semibold text-neutral-400">/ Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 h-6 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  + New Project
                </span>
              </div>
            </div>

            {/* Main canvas mockup */}
            <div className="mockup-canvas">
              {/* Heading */}
              <div className="text-center space-y-1">
                <div className="h-4 w-48 bg-neutral-300 rounded mx-auto" />
                <div className="h-2 w-32 bg-neutral-200 rounded mx-auto" />
              </div>

              {/* Central Prompt Bar mockup */}
              <div className="mockup-prompt-placeholder">
                <div className="mockup-prompt-inner-bar">
                  <span className="w-5 h-5 rounded bg-neutral-700 block" />
                  <span className="mockup-tag">Nova 3</span>
                  <span className="mockup-tag">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-700 block" />
                  <span className="mockup-prompt-btn flex items-center justify-center text-[10px] text-white">
                    ↑
                  </span>
                </div>
              </div>

              {/* Logs card mockup */}
              <div className="mockup-card">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-mono text-neutral-400">
                  Engine connected • WebSocket streaming active
                </span>
              </div>
            </div>
          </div>

          {/* Highlight Areas */}
          {DASHBOARD_FEATURES.map(f => (
            <div
              key={`area-${f.id}`}
              className={`feature-highlight-area ${activeId === f.id ? 'active' : ''}`}
              style={{
                top: f.area.top,
                left: f.area.left,
                width: f.area.width,
                height: f.area.height
              }}
            />
          ))}

          {/* Numbered Hotspot Markers */}
          {DASHBOARD_FEATURES.map(f => (
            <button
              key={`marker-${f.id}`}
              type="button"
              className={`feature-marker ${activeId === f.id ? 'active' : ''}`}
              style={{ top: f.marker.top, left: f.marker.left }}
              aria-label={`Feature ${f.id}: ${f.title}`}
              onMouseEnter={() => setActiveId(f.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(f.id)}
              onBlur={() => setActiveId(null)}
              onClick={() => setActiveId(prev => (prev === f.id ? null : f.id))}
            >
              {f.id}
            </button>
          ))}
        </div>

        {/* Feature Legend */}
        <div className="legend-wrapper">
          {DASHBOARD_FEATURES.map(f => (
            <div
              key={`legend-${f.id}`}
              className={`legend-card ${activeId === f.id ? 'active' : ''}`}
              tabIndex={0}
              role="button"
              aria-pressed={activeId === f.id}
              onMouseEnter={() => setActiveId(f.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(f.id)}
              onBlur={() => setActiveId(null)}
              onClick={() => setActiveId(prev => (prev === f.id ? null : f.id))}
            >
              <div className="legend-num">{f.id}</div>
              <div className="flex-1 min-w-0">
                <h3 className="legend-title">{f.title}</h3>
                <p className="legend-desc">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardExplainer;
