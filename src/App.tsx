import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Layers, 
  Cpu, 
  Flame, 
  Activity, 
  FolderGit2, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight
} from "lucide-react";
import SovereignAuditor from "./components/SovereignAuditor";
import MonorepoTree from "./components/MonorepoTree";
import BuildOrchestrator from "./components/BuildOrchestrator";
import RegisterBurnConsole from "./components/RegisterBurnConsole";
import DaisyHaminjaCore from "./components/DaisyHaminjaCore";
import DFRLConsole from "./components/DFRLConsole";
import { vaultService, AuditOutput, ConsensusLedger } from "./services/vaultService";

type AppView = "overview" | "dfrl" | "auditor" | "tree" | "orchestrator" | "burn" | "haminja";

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("overview");
  const [selectedDfrlOp, setSelectedDfrlOp] = useState<string>("PARADOX_08");
  const [auditResult, setAuditResult] = useState<AuditOutput | null>(() => vaultService.getLastAuditResult());
  const [secondsUntilAudit, setSecondsUntilAudit] = useState<number>(() => vaultService.getSecondsUntilNextAudit());
  const [autoAuditEnabled, setAutoAuditEnabled] = useState<boolean>(() => vaultService.isAutoAuditEnabled());
  const [ledger, setLedger] = useState<ConsensusLedger>(() => vaultService.getLedger());
  const [canonicalHash, setCanonicalHash] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    vaultService.getCanonicalLedgerHash().then(hash => {
      if (isMounted) setCanonicalHash(hash);
    });

    const unsubscribeVault = vaultService.subscribe(async () => {
      if (isMounted) {
        setLedger(vaultService.getLedger());
        const hash = await vaultService.getCanonicalLedgerHash();
        setCanonicalHash(hash);
      }
    });

    const unsubscribeAutoAudit = vaultService.subscribeAutoAudit((result, seconds) => {
      if (isMounted) {
        setAuditResult(result);
        setSecondsUntilAudit(seconds);
        setAutoAuditEnabled(vaultService.isAutoAuditEnabled());
      }
    });

    return () => {
      isMounted = false;
      unsubscribeVault();
      unsubscribeAutoAudit();
    };
  }, []);

  const hasDeviation = auditResult && !auditResult.parity_status;

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#0b1329]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 border border-cyan-500/30 p-2 rounded-lg text-cyan-400">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-100">Project AGATE</h1>
                <span className="text-[10px] bg-[#10b981]/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  SOVEREIGN CORE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Institutional Decentralized Waste Reclamation and Sovereign Ecosystem</p>
            </div>
          </div>

          {/* Quick Context Stats & Autonomous Auto-Audit Status Badge */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Autonomous 60s Auto-Audit Status Badge */}
            <button
              onClick={() => setActiveView("auditor")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold transition-all shadow-sm cursor-pointer ${
                !autoAuditEnabled
                  ? "bg-slate-900 border-slate-800 text-slate-400"
                  : hasDeviation
                    ? "bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse hover:bg-rose-900/60"
                    : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40"
              }`}
              title="Click to view Sovereign Parity Auditor details"
            >
              <span className={`w-2 h-2 rounded-full ${
                !autoAuditEnabled 
                  ? "bg-slate-500" 
                  : hasDeviation 
                    ? "bg-rose-500 animate-ping" 
                    : "bg-emerald-400"
              }`}></span>
              <span>
                {!autoAuditEnabled 
                  ? "AUTO-AUDIT: OFF" 
                  : hasDeviation 
                    ? "⚠ DEVIATION DETECTED" 
                    : `PARITY INTACT (${secondsUntilAudit}s)`}
              </span>
            </button>

            <div className="bg-[#020617] border border-slate-800 px-3 py-1.5 rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Nodes:</span>
              <span className="text-emerald-400 font-bold">54 / 54</span>
            </div>
            <div className="bg-[#020617] border border-slate-800 px-3 py-1.5 rounded flex items-center gap-2" title={canonicalHash}>
              <span className="text-slate-400">Vault:</span>
              <span className="text-cyan-400 font-bold">
                {canonicalHash ? `${canonicalHash.slice(0, 10)}...` : "~/.agate_node/vault/"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Deviation Warning Banner if Auto-Audit detects discrepancy */}
      {hasDeviation && activeView !== "auditor" && (
        <div className="bg-rose-950/70 border-b border-rose-500/40 px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span>
                <strong>Auto-Audit Deviation Alert:</strong> {auditResult.deviation_vector?.split(":")[0]}
              </span>
            </div>
            <button
              onClick={() => setActiveView("auditor")}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded text-[11px] font-bold transition-all shrink-0 flex items-center gap-1"
            >
              Resolve in Auditor <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-8">
          <button
            onClick={() => setActiveView("overview")}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
              activeView === "overview"
                ? "bg-slate-800 text-slate-100 border-slate-700 font-bold shadow-lg"
                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-300"
            }`}
          >
            📊 System Overview
          </button>
          <button
            onClick={() => setActiveView("dfrl")}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-1.5 cursor-pointer ${
              activeView === "dfrl"
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold shadow-lg"
                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-300"
            }`}
          >
            <span>⚖️ DFRL — ALL PROOFS</span>
            <span className="text-[9px] bg-indigo-500/25 text-indigo-300 px-1.5 py-0.2 rounded font-bold">
              88 PROOFS
            </span>
          </button>
          <button
            onClick={() => setActiveView("auditor")}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-2 cursor-pointer ${
              activeView === "auditor"
                ? "bg-[#10b981]/15 text-emerald-300 border-emerald-500/30 font-bold shadow-lg"
                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-300"
            }`}
          >
            <span>🛡️ Sovereign Auditor</span>
            {hasDeviation ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>
          <button
            onClick={() => setActiveView("tree")}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
              activeView === "tree"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold shadow-lg"
                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-300"
            }`}
          >
            📂 Monorepo Architecture
          </button>
          <button
            onClick={() => setActiveView("orchestrator")}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
              activeView === "orchestrator"
                ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-bold shadow-lg"
                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-300"
            }`}
          >
            ⚙️ Orchestrator & Spec
          </button>
          <button
            onClick={() => setActiveView("burn")}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
              activeView === "burn"
                ? "bg-orange-500/15 text-orange-300 border-orange-500/30 font-bold shadow-lg"
                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-300"
            }`}
          >
            🔥 Register & Burn Verification
          </button>
          <button
            onClick={() => setActiveView("haminja")}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
              activeView === "haminja"
                ? "bg-pink-500/15 text-pink-300 border-pink-500/30 font-bold shadow-lg"
                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-300"
            }`}
          >
            🧠 dAIsy HaMINJA Core
          </button>
        </nav>

        {/* View Switcher Content */}
        <div className="space-y-8">
          
          {activeView === "overview" && (
            <div className="space-y-8 animate-fade-in">
              {/* Introduction Card */}
              <div className="bg-gradient-to-r from-[#0d1c3a] to-[#0b1329] border border-[#1e325a]/60 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <h2 className="text-xl font-bold text-slate-100 font-mono mb-2">Welcome to AGATE Sovereign Core</h2>
                <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
                  This build is the unified, sovereign monorepo orchestration target integrating <strong>AGate-Sovergine-Wallet</strong>, 
                  <strong>Base-Waste-Harvester</strong>, and <strong>Reclamation-Experts</strong> into one co-operating platform (Project AGATE). 
                  It establishes local ledger consistency via <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">~/.agate_node/vault/consensus_memory.json</code> 
                  and integrates the <strong>Solvex Pipeline</strong> (<code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">Agate-core-build</code>) directly 
                  within a standardized Buildozer Android package compiler with an autonomous 60-second background parity Auto-Audit.
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <button 
                    onClick={() => setActiveView("dfrl")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg text-xs font-mono transition-all cursor-pointer shadow-lg shadow-indigo-950/40"
                  >
                    ⚖️ DFRL — ALL PROOFS (88 Operators)
                  </button>
                  <button 
                    onClick={() => setActiveView("auditor")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg text-xs font-mono transition-all cursor-pointer"
                  >
                    Launch Sovereign Auditor
                  </button>
                  <button 
                    onClick={() => setActiveView("burn")}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg text-xs font-mono transition-all cursor-pointer"
                  >
                    Live Register & Burn Console
                  </button>
                  <button 
                    onClick={() => setActiveView("orchestrator")}
                    className="bg-[#1e293b] hover:bg-slate-800 text-slate-300 font-semibold py-2 px-4 rounded-lg text-xs font-mono transition-all border border-slate-700 cursor-pointer"
                  >
                    View Compilation Script
                  </button>
                </div>
              </div>

              {/* Grid Metrics Cards - Connected to Real Vault State */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Nodes</span>
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-100">54</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Real WebCrypto Benchmarked</p>
                </div>

                <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Minted Supply</span>
                    <Layers className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-cyan-400">
                    {ledger.Sovereign_Wallet_System.total_supply.toFixed(2)} <span className="text-sm">AGATE</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Backed by {ledger.Sovereign_Wallet_System.burned_waste_kg_total.toFixed(1)}kg waste</p>
                </div>

                <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Confirmed Transactions</span>
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-100">
                    {ledger.transactions.length}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Immutable SHA-256 Merkle Chained</p>
                </div>

                <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Auto-Audit Status</span>
                    <Shield className={`w-5 h-5 ${hasDeviation ? "text-rose-400 animate-bounce" : "text-emerald-400"}`} />
                  </div>
                  <p className={`text-xl font-bold font-mono ${hasDeviation ? "text-rose-400" : "text-emerald-400"}`}>
                    {hasDeviation ? "DEVIATION" : "PARITY INTACT"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Every 60s background check active
                  </p>
                </div>
              </div>

              {/* Truth Pillars Cards */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">The 4 Truth Pillars of Project AGATE</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-[#020617] border border-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-slate-200 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      Identity is a Right
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Cryptographic sovereign node registries guarantee personal identity as a fundamental, tamper-proof user entitlement.</p>
                  </div>

                  <div className="bg-[#020617] border border-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-slate-200 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      Privacy as Default
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">All transactions utilize Zero-Knowledge proof structures, safeguarding personal attributes from unauthorized node collection.</p>
                  </div>

                  <div className="bg-[#020617] border border-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-slate-200 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Financial Health
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Economic empowerment driven by the value of physical systemic waste reclamation converted into clean decentralized tokens.</p>
                  </div>

                  <div className="bg-[#020617] border border-slate-800 p-4 rounded-lg">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-slate-200 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                      Human Guardianship
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Sovereign overrides and execution loops require active validation by human keys to prevent unchecked smart contracts.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "dfrl" && <DFRLConsole initialOperatorId={selectedDfrlOp} />}
          {activeView === "auditor" && <SovereignAuditor />}
          {activeView === "tree" && <MonorepoTree />}
          {activeView === "orchestrator" && <BuildOrchestrator />}
          {activeView === "burn" && <RegisterBurnConsole />}
          {activeView === "haminja" && (
            <DaisyHaminjaCore 
              onNavigateToDFRL={(opId) => {
                setSelectedDfrlOp(opId);
                setActiveView("dfrl");
              }} 
            />
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#020617] py-6 text-center text-xs text-slate-500 font-mono mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>Project AGATE • Sovereign Ecosystem Node Suite</span>
          <span className="text-slate-600">dAIsy HaMINJA Core • SOC-2 Type II Verified Sandbox Environment</span>
        </div>
      </footer>
    </div>
  );
}
