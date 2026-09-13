'use client'

import React, { useState } from 'react'
import { FiCheck, FiArrowRight, FiTerminal, FiLayers, FiCpu, FiShield, FiUploadCloud, FiServer } from 'react-icons/fi'

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      num: '01',
      title: 'Prompt Intake',
      summary: 'Submit an idea via the Monaco web editor or CLI.',
      description: 'Developers initiate projects via structured natural language, API contracts, or markdown PRDs. StackPilot normalizes requirements into deterministic agent tasks.',
      agent: 'Interface Gateway',
      artifact: 'prd_spec.json',
      tags: ['Web Editor', 'CLI Input', 'Natural Language'],
    },
    {
      num: '02',
      title: 'Requirement Analysis',
      summary: 'Planner Agent breaks it into features, endpoints, database structure, and modules.',
      description: 'The Planner Agent decomposes high-level scope into atomic dependencies, identifying relational entity boundaries, state requirements, and auth matrices.',
      agent: 'Planner Agent',
      artifact: 'feature_tree.manifest',
      tags: ['Schema Design', 'Feature Graph', 'Dependency DAG'],
    },
    {
      num: '03',
      title: 'Architecture',
      summary: 'Architect Agent decides framework, folder structure, schema, and system design.',
      description: 'Selects optimal runtime frameworks (Next.js, FastAPI, Node, Go), folder modularization, microservice boundaries, and message queue topics.',
      agent: 'Architect Agent',
      artifact: 'system_architecture.yaml',
      tags: ['Framework Config', 'System Design', 'Module Boundaries'],
    },
    {
      num: '04',
      title: 'Context Retrieval (KarmaRepo)',
      summary: 'Agents query the vector DB, project files, docs, and relevant web references.',
      description: 'KarmaRepo performs continuous semantic indexing with Kafka synchronization, feeding real-time context and dependency graph data to code agents.',
      agent: 'KarmaRepo Memory Engine',
      artifact: 'context_embeddings.bin',
      tags: ['Semantic Search', 'Vector Embeddings', 'Knowledge Graph'],
    },
    {
      num: '05',
      title: 'Code Generation',
      summary: 'Karma H1/H2/H3 generate and validate code in parallel.',
      description: 'Karma H1 writes primary modules, H2 develops fault-tolerant alternatives, and H3 runs continuous static analysis and merge reconciliation.',
      agent: 'Karma H-Series Cluster',
      artifact: 'source_bundle.tar.gz',
      tags: ['Parallel AST', 'H1 Primary', 'H2 Fallback', 'H3 Consensus'],
    },
    {
      num: '06',
      title: 'Testing & Self-Healing',
      summary: 'Automated tests run; the Self-Healing Agent auto-fixes or regenerates faulty modules.',
      description: 'Unit, integration, and load tests execute in isolated sandbox containers. Any stack trace or assertion failure triggers autonomous regeneration.',
      agent: 'Self-Healing Monitor',
      artifact: 'test_report_pass.log',
      tags: ['Automated TDD', 'Self-Healing Loop', 'E2E Sandboxing'],
    },
    {
      num: '07',
      title: 'Deployment',
      summary: 'DevOps Agent builds Docker containers, configures CI/CD, and deploys to the cloud.',
      description: 'Automates multi-stage Docker builds, Kubernetes manifests, Terraform cloud provisioning (AWS/GCP/Vercel), and health-check monitoring.',
      agent: 'DevOps Agent',
      artifact: 'deploy_manifest.k8s',
      tags: ['Docker Container', 'Kubernetes', 'CI/CD Pipeline'],
    },
    {
      num: '08',
      title: 'Autonomous MCP Server (Future Vision)',
      summary: 'The pipeline runs, monitors, and heals itself with no human in the loop, controllable remotely.',
      description: 'External IDEs and remote agentic coordinators connect directly over the Model Context Protocol, enabling full headless system evolution.',
      agent: 'MCP Autonomous Gateway',
      artifact: 'mcp_protocol_stream',
      tags: ['Model Context Protocol', 'Headless Ops', 'Zero Human-in-Loop'],
    },
  ]

  return (
    <section id="workflow" className="py-24 sm:py-32 border-t border-white/5 relative bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 font-mono text-sm sm:text-base font-semibold">(04)</span>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">How It Works.</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl">
            From prompt to production.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl">
            An 8-stage deterministic pipeline where specialized agents coordinate to engineer, verify, and ship complete software stacks.
          </p>
        </div>

        {/* Stepper Grid / Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: List of 8 Steps */}
          <div className="lg:col-span-7 space-y-3">
            {steps.map((step, index) => {
              const isActive = activeStep === index
              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(index)}
                  className={`cursor-pointer rounded-xl border p-4 sm:p-5 transition-all duration-200 flex items-start gap-4 ${
                    isActive
                      ? 'border-amber-500/50 bg-[#161616] shadow-lg shadow-amber-950/15'
                      : 'border-white/5 bg-[#101010] hover:border-white/15 hover:bg-[#131313]'
                  }`}
                >
                  <span className={`font-mono text-base sm:text-lg font-bold shrink-0 ${
                    isActive ? 'text-amber-400' : 'text-neutral-600'
                  }`}>
                    {step.num}
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-base sm:text-lg font-bold tracking-tight ${
                        isActive ? 'text-white' : 'text-neutral-300'
                      }`}>
                        {step.title}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                          Active Stage
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                      {step.summary}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Step Detail Card / Interactive Artifact Inspector */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-500 uppercase tracking-widest font-bold">
                    STAGE {steps[activeStep].num} INSPECTOR
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-500">
                  {activeStep + 1} of 8
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {steps[activeStep].title}
              </h3>
              
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400/90 mb-4 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                <span>Coordinator:</span>
                <span className="font-semibold text-white">{steps[activeStep].agent}</span>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                {steps[activeStep].description}
              </p>

              {/* Artifact Output Pill */}
              <div className="mb-6 p-3 rounded-xl bg-[#090909] border border-white/5 font-mono text-xs">
                <div className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">Generated Artifact:</div>
                <div className="text-amber-300 font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {steps[activeStep].artifact}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {steps[activeStep].tags.map((tag) => (
                  <span key={tag} className="sp-pill-tag text-[11px] py-0.5 px-2.5">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Next step button */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button
                  onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))}
                  className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
                >
                  &larr; Prev Step
                </button>
                <button
                  onClick={() => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))}
                  className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors font-semibold"
                >
                  <span>Next Step</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
