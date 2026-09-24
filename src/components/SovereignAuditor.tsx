import React, { useState, useEffect } from "react";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Layers, 
  Clock, 
  Activity, 
  ToggleLeft, 
  ToggleRight, 
  FileCheck2, 
  Fingerprint, 
  Zap,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { vaultService, AuditOutput, ContextVariables } from "../services/vaultService";

export default function SovereignAuditor() {
  const [ctx, setCtx] = useState<ContextVariables>(() => vaultService.getContextVariables());
  const [canonicalHash, setCanonicalHash] = useState<string>("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditOutput | null>(() => vaultService.getLastAuditResult());
  
  // Auto-Audit state
  const [autoAuditEnabled, setAutoAuditEnabled] = useState<boolean>(() => vaultService.isAutoAuditEnabled());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => vaultService.getSecondsUntilNextAudit());
  const [auditHistory, setAuditHistory] = useState<{ timestamp: string; status: boolean; vector?: string }[]>([]);

  // Load canonical hash and initialize
  useEffect(() => {
    let isMounted = true;
    vaultService.getCanonicalLedgerHash().then(hash => {
      if (isMounted) {
        setCanonicalHash(hash);
        if (!ctx.contextHash) {
          const updated = { ...ctx, contextHash: hash };
          setCtx(updated);
          vaultService.saveContextVariables(updated);
        }
      }
    });

    const unsubscribeVault = vaultService.subscribe(async () => {
      const newHash = await vaultService.getCanonicalLedgerHash();
      if (isMounted) {
        setCanonicalHash(newHash);
      }
    });

    const unsubscribeAutoAudit = vaultService.subscribeAutoAudit((result, seconds) => {
      if (isMounted) {
        setAuditResult(result);
        setSecondsRemaining(seconds);
        setAuditHistory(prev => {
          const entry = {
            timestamp: new Date().toLocaleTimeString(),
            status: result.parity_status,
            vector: result.deviation_vector
          };
          // Keep last 8 checks
          return [entry, ...prev.slice(0, 7)];
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribeVault();
      unsubscribeAutoAudit();
    };
  }, []);

  const handleContextChange = (field: keyof ContextVariables, value: string) => {
    const updated = { ...ctx, [field]: value };
    setCtx(updated);
    vaultService.saveContextVariables(updated);
    // Instant re-evaluation for responsive UI
    vaultService.runParityAudit(updated).then(res => setAuditResult(res));
  };

  const executeManualAudit = async () => {
    setIsAuditing(true);
    const hash = await vaultService.getCanonicalLedgerHash();
    setCanonicalHash(hash);
    const result = await vaultService.runParityAudit(ctx);
    setAuditResult(result);
    setIsAuditing(false);
  };

  const toggleAutoAudit = () => {
    const next = !autoAuditEnabled;
    setAutoAuditEnabled(next);
    vaultService.setAutoAuditEnabled(next);
  };

  const syncContextToCanonical = async () => {
    const hash = await vaultService.getCanonicalLedgerHash();
    setCanonicalHash(hash);
    const updated: ContextVariables = {
      targetIdentity: "Sovereign_Node_01_Identity_Active",
      privacyPolicy: "Zero_Knowledge_Default_Active",
      financialHealth: "Systemic_Waste_Reclamation_Funded",
      guardianSignature: "Human_Guardian_Override_Verified",
      contextHash: hash
    };
    setCtx(updated);
    vaultService.saveContextVariables(updated);
    const res = await vaultService.runParityAudit(updated);
    setAuditResult(res);
  };

  // Test triggers to let users immediately see the Auto-Audit badge react to deviations
  const triggerDeviation = async (type: "hash" | "identity" | "privacy" | "guardian") => {
    let updated = { ...ctx };
    if (type === "hash") {
      updated.contextHash = "0xdeadbeef7c9b7a4f5d6e7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f";
    } else if (type === "identity") {
      updated.targetIdentity = "Sovereign_Node_01_Revoked_Compromised";
    } else if (type === "privacy") {
      updated.privacyPolicy = "Unencrypted_Telemetry_Bypass_Exposed";
    } else if (type === "guardian") {
      updated.guardianSignature = "Unchecked_Bypass_No_Signature";
    }
    setCtx(updated);
    vaultService.saveContextVariables(updated);
    const res = await vaultService.runParityAudit(updated);
    setAuditResult(res);
  };

  return (
    <div className="bg-[#0b1329] border border-[#1e293b] rounded-xl p-6 shadow-2xl font-sans" id="sovereign-auditor-section">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-[#1e2d4a] pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-mono tracking-tight">Sovereign Parity Auditor</h2>
              {/* Prominent Auto-Audit Status Badge */}
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide border shadow-sm ${
                  !autoAuditEnabled 
                    ? "bg-slate-800 text-slate-400 border-slate-700"
                    : auditResult?.parity_status 
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 animate-pulse"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-bounce"
                }`}
                title={auditResult?.deviation_vector || "Auditor Status Badge"}
              >
                <span className={`w-2 h-2 rounded-full ${
                  !autoAuditEnabled 
                    ? "bg-slate-500" 
                    : auditResult?.parity_status 
                      ? "bg-emerald-400" 
                      : "bg-rose-500"
                }`}></span>
                <span>
                  {!autoAuditEnabled 
                    ? "AUTO-AUDIT: PAUSED" 
                    : auditResult?.parity_status 
                      ? "AUTO-AUDIT: PARITY INTACT" 
                      : "AUTO-AUDIT: DEVIATION DETECTED"}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">Autonomous 60-second background verification against the 4 Truth Pillars</p>
          </div>
        </div>

        {/* Action Controls & Auto-Audit Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto-Audit Switch */}
          <div className="flex items-center gap-2 bg-[#020617] border border-slate-800 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-left font-mono">
              <span className="text-[10px] text-slate-400 block leading-tight">Auto-Audit (60s):</span>
              <span className="text-[11px] font-bold text-slate-200">
                {autoAuditEnabled ? `Next check in ${secondsRemaining}s` : "Disabled"}
              </span>
            </div>
            <button
              onClick={toggleAutoAudit}
              className="text-cyan-400 hover:text-cyan-300 ml-1 transition-transform"
              title={autoAuditEnabled ? "Click to Pause Auto-Audit" : "Click to Enable Auto-Audit"}
            >
              {autoAuditEnabled ? (
                <ToggleRight className="w-6 h-6 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-500" />
              )}
            </button>
          </div>

          {/* Manual Run Button */}
          <button
            onClick={executeManualAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 bg-[#10b981]/15 hover:bg-[#10b981]/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all disabled:opacity-50"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Auditing...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Audit Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto-Audit Banner & Deviation Notification */}
      {auditResult && !auditResult.parity_status && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-rose-300 font-mono uppercase tracking-wider">
                  Sovereign Parity Deviation Detected by Background Auto-Audit
                </h4>
                <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 rounded font-mono">
                  ACTIVE ALERT
                </span>
              </div>
              <p className="text-xs text-rose-200/90 font-mono mt-0.5">
                {auditResult.deviation_vector}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Detected at: {new Date(auditResult.audit_timestamp).toLocaleTimeString()} • Canonical Ledger Hash: {auditResult.ledger_hash.slice(0, 16)}...
              </p>
            </div>
          </div>
          <button
            onClick={syncContextToCanonical}
            className="shrink-0 flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Canonical Parity
          </button>
        </div>
      )}

      {/* Main Grid: Variables & Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real Execution Context Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Real Context Variables (~/.agate_node/vault/consensus_memory.json)
            </h3>
            <button
              onClick={syncContextToCanonical}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Canonical
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex justify-between">
                <span>Pillar 1: Sovereign Identity</span>
                <span className={ctx.targetIdentity.toLowerCase().includes("sovereign") && !ctx.targetIdentity.toLowerCase().includes("compromised") ? "text-emerald-400 text-[10px]" : "text-rose-400 text-[10px]"}>
                  {ctx.targetIdentity.toLowerCase().includes("sovereign") && !ctx.targetIdentity.toLowerCase().includes("compromised") ? "✓ Valid Key" : "✗ Revoked"}
                </span>
              </label>
              <input
                type="text"
                value={ctx.targetIdentity}
                onChange={(e) => handleContextChange("targetIdentity", e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex justify-between">
                <span>Pillar 2: Privacy Policy State</span>
                <span className={ctx.privacyPolicy.toLowerCase().includes("zero") || ctx.privacyPolicy.toLowerCase().includes("private") ? "text-emerald-400 text-[10px]" : "text-rose-400 text-[10px]"}>
                  {ctx.privacyPolicy.toLowerCase().includes("zero") || ctx.privacyPolicy.toLowerCase().includes("private") ? "✓ ZK Active" : "✗ Exposed"}
                </span>
              </label>
              <input
                type="text"
                value={ctx.privacyPolicy}
                onChange={(e) => handleContextChange("privacyPolicy", e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex justify-between">
                <span>Pillar 3: Financial Health Status</span>
                <span className={ctx.financialHealth.toLowerCase().includes("funded") || ctx.financialHealth.toLowerCase().includes("healthy") ? "text-emerald-400 text-[10px]" : "text-rose-400 text-[10px]"}>
                  {ctx.financialHealth.toLowerCase().includes("funded") || ctx.financialHealth.toLowerCase().includes("healthy") ? "✓ Waste Backed" : "✗ Breached"}
                </span>
              </label>
              <input
                type="text"
                value={ctx.financialHealth}
                onChange={(e) => handleContextChange("financialHealth", e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex justify-between">
                <span>Pillar 4: Human Guardianship Key</span>
                <span className={ctx.guardianSignature.toLowerCase().includes("guardian") && !ctx.guardianSignature.toLowerCase().includes("bypass") ? "text-emerald-400 text-[10px]" : "text-rose-400 text-[10px]"}>
                  {ctx.guardianSignature.toLowerCase().includes("guardian") && !ctx.guardianSignature.toLowerCase().includes("bypass") ? "✓ Signed" : "✗ Unverified"}
                </span>
              </label>
              <input
                type="text"
                value={ctx.guardianSignature}
                onChange={(e) => handleContextChange("guardianSignature", e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Genuine SHA-256 Hashes */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                  Canonical Ledger SHA-256 (consensus_memory.json)
                </span>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">
                  WebCrypto Verified
                </span>
              </div>
              <input
                type="text"
                readOnly
                value={canonicalHash}
                className="w-full bg-[#020617] border border-[#1e293b] rounded p-2 text-xs font-mono text-cyan-300 focus:outline-none cursor-copy"
                title="Calculated SHA-256 hash of active consensus memory"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Live Execution Context Hash</span>
                <button 
                  onClick={() => handleContextChange("contextHash", canonicalHash)}
                  className="text-[10px] text-emerald-400/90 hover:underline hover:text-emerald-300 font-bold"
                >
                  Sync to Canonical Hash
                </button>
              </div>
              <input
                type="text"
                value={ctx.contextHash || canonicalHash}
                onChange={(e) => handleContextChange("contextHash", e.target.value)}
                className={`w-full bg-[#020617] border rounded p-2 text-xs font-mono focus:outline-none ${
                  (ctx.contextHash || canonicalHash).toLowerCase() === canonicalHash.toLowerCase()
                    ? "border-[#1e293b] text-slate-200"
                    : "border-rose-500 text-rose-300"
                }`}
              />
            </div>
          </div>

          {/* Interactive Deviation Test Trigger Panel */}
          <div className="p-3 bg-[#020617] rounded-lg border border-[#1e293b]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Test Auto-Audit Deviation Detection:
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Observe live status badge reaction</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <button
                onClick={() => triggerDeviation("hash")}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 p-1.5 rounded text-center transition-all"
              >
                Perturb Hash
              </button>
              <button
                onClick={() => triggerDeviation("identity")}
                className="bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/30 p-1.5 rounded text-center transition-all"
              >
                Revoke Identity
              </button>
              <button
                onClick={() => triggerDeviation("privacy")}
                className="bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 p-1.5 rounded text-center transition-all"
              >
                Breach Privacy
              </button>
              <button
                onClick={() => triggerDeviation("guardian")}
                className="bg-slate-900 hover:bg-slate-800 text-orange-400 border border-orange-500/30 p-1.5 rounded text-center transition-all"
              >
                Bypass Guardian
              </button>
            </div>
          </div>

          {/* Pillars Status Matrix */}
          <div className="p-3 bg-[#020617]/50 rounded-lg border border-[#1e293b]/50">
            <h4 className="text-[11px] font-mono font-semibold text-slate-300 mb-1.5">
              Current Truth Pillars Audit Matrix:
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono">
              <span className="flex items-center justify-between text-slate-400 bg-slate-900/40 px-2 py-1 rounded">
                <span>1. Sovereign Identity:</span>
                {auditResult?.checked_pillars.identity.passed ? (
                  <span className="text-emerald-400 font-bold">PASSED</span>
                ) : (
                  <span className="text-rose-400 font-bold">FAILED</span>
                )}
              </span>
              <span className="flex items-center justify-between text-slate-400 bg-slate-900/40 px-2 py-1 rounded">
                <span>2. Privacy Default:</span>
                {auditResult?.checked_pillars.privacy.passed ? (
                  <span className="text-emerald-400 font-bold">PASSED</span>
                ) : (
                  <span className="text-rose-400 font-bold">FAILED</span>
                )}
              </span>
              <span className="flex items-center justify-between text-slate-400 bg-slate-900/40 px-2 py-1 rounded">
                <span>3. Financial Health:</span>
                {auditResult?.checked_pillars.financial.passed ? (
                  <span className="text-emerald-400 font-bold">PASSED</span>
                ) : (
                  <span className="text-rose-400 font-bold">FAILED</span>
                )}
              </span>
              <span className="flex items-center justify-between text-slate-400 bg-slate-900/40 px-2 py-1 rounded">
                <span>4. Human Guardian:</span>
                {auditResult?.checked_pillars.guardianship.passed ? (
                  <span className="text-emerald-400 font-bold">PASSED</span>
                ) : (
                  <span className="text-rose-400 font-bold">FAILED</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Strict JSON Audit Output & History */}
        <div className="lg:col-span-5 flex flex-col h-full justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Strict Parity Audit Output (JSON)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {auditResult?.audit_timestamp ? new Date(auditResult.audit_timestamp).toLocaleTimeString() : "--"}
              </span>
            </div>

            <div className="relative bg-[#020617] rounded-xl border border-[#1e293b] p-4 h-64 overflow-auto font-mono text-xs">
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-[#0f172a] border border-[#1e293b] px-2 py-0.5 rounded text-[10px]">
                <span className={`w-2 h-2 rounded-full ${auditResult?.parity_status ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></span>
                <span className={auditResult?.parity_status ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {auditResult?.parity_status ? "PARITY_OK" : "DEVIATION_ALERT"}
                </span>
              </div>
              
              {isAuditing ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  <span>Computing Real SHA-256 Ledger Parity...</span>
                </div>
              ) : (
                <pre className="text-slate-200 text-[11px] leading-relaxed">
                  {JSON.stringify(auditResult, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Recent Background Auto-Audit History Log */}
          <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" /> Auto-Audit Background Trail (60s checks)
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                {autoAuditEnabled ? "Daemon Active" : "Daemon Paused"}
              </span>
            </div>
            {auditHistory.length === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono py-1 text-center">
                Waiting for scheduled 60s background ticks...
              </p>
            ) : (
              <div className="space-y-1 font-mono text-[10px] max-h-24 overflow-y-auto">
                {auditHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-900/60 last:border-0">
                    <span className="text-slate-500">{item.timestamp}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                      item.status ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                    }`}>
                      {item.status ? "PARITY CONFIRMED" : "DEVIATION"}
                    </span>
                    {item.vector && (
                      <span className="text-rose-300 text-[9px] truncate max-w-[120px]" title={item.vector}>
                        {item.vector.split(":")[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Final Parity Summary Box */}
          <div className="p-3 rounded-lg bg-[#020617]/40 border border-[#1e2d4a]/30 flex gap-3 items-start">
            {auditResult?.parity_status ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-400 font-mono">Consensus Intact</p>
                  <p className="text-[11px] text-slate-400">The execution context is in complete parity with the decentralized node state. 4 of 4 Truth Pillars verified cryptographically.</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-500 font-mono">Deviation Detected</p>
                  <p className="text-[11px] text-slate-300 font-mono">{auditResult?.deviation_vector?.split(':')[0]}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Auto-Audit notified status badge. Re-align context variables with canonical root.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
