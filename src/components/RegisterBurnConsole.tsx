import React, { useState, useEffect } from "react";
import { 
  Flame, 
  CheckSquare, 
  PlusCircle, 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  FileText, 
  Download, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Copy,
  Layers
} from "lucide-react";
import { vaultService, BurnTransaction, ConsensusLedger } from "../services/vaultService";

export default function RegisterBurnConsole() {
  const [harvesterId, setHarvesterId] = useState("Harvester-Node-Alpha-01");
  const [beneficiaryNode, setBeneficiaryNode] = useState("Sovereign_Node_01");
  const [wasteWeight, setWasteWeight] = useState<number>(48.5);
  const [tokenRate] = useState<number>(0.15); // Strict 0.15 AGATE per kg
  const [isBurning, setIsBurning] = useState(false);
  const [justMinted, setJustMinted] = useState<BurnTransaction | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Real Vault State
  const [ledger, setLedger] = useState<ConsensusLedger>(() => vaultService.getLedger());
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>(() => vaultService.getHandshakeLogs());

  useEffect(() => {
    const unsubscribe = vaultService.subscribe(() => {
      setLedger(vaultService.getLedger());
      setHandshakeLogs(vaultService.getHandshakeLogs());
    });
    return unsubscribe;
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const executeRealRegisterAndBurn = async () => {
    if (wasteWeight <= 0 || isBurning) return;
    setIsBurning(true);
    setJustMinted(null);

    try {
      const tx = await vaultService.recordTransaction(harvesterId, wasteWeight, beneficiaryNode);
      setJustMinted(tx);
    } catch (err) {
      console.error("Failed to execute burn transaction:", err);
    } finally {
      setIsBurning(false);
    }
  };

  const handleResetLedger = () => {
    if (window.confirm("Reset consensus ledger and ai_handshake to canonical sovereign state?")) {
      vaultService.resetLedgerToDefault();
      setJustMinted(null);
    }
  };

  const downloadConsensusMemory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ledger, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "consensus_memory.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadHandshakeTxt = () => {
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(handshakeLogs.join("\n"));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ai_handshake.txt");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-[#0b1329] border border-[#1e293b] rounded-xl p-6 shadow-2xl font-sans" id="register-burn-section">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#1e2d4a] pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 border border-orange-500/30 p-2.5 rounded-lg text-orange-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-mono">"Register & Burn" Core Verification Engine</h2>
              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono font-bold">
                REAL LEDGER ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">Real SHA-256 state updates to ~/.agate_node/vault/consensus_memory.json</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadConsensusMemory}
            className="flex items-center gap-1.5 bg-[#020617] hover:bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
            title="Download actual consensus_memory.json file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Ledger
          </button>
          <button
            onClick={handleResetLedger}
            className="flex items-center gap-1 bg-[#020617] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all"
            title="Reset to canonical state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono text-xs">
        <div className="bg-[#020617] border border-slate-800 p-3 rounded-lg">
          <span className="text-slate-500 text-[10px] uppercase block">Total Supply</span>
          <span className="text-base font-bold text-emerald-400">
            {ledger.Sovereign_Wallet_System.total_supply.toFixed(2)} AGATE
          </span>
        </div>
        <div className="bg-[#020617] border border-slate-800 p-3 rounded-lg">
          <span className="text-slate-500 text-[10px] uppercase block">Reclaimed Waste</span>
          <span className="text-base font-bold text-orange-400">
            {ledger.Sovereign_Wallet_System.burned_waste_kg_total.toFixed(2)} kg
          </span>
        </div>
        <div className="bg-[#020617] border border-slate-800 p-3 rounded-lg">
          <span className="text-slate-500 text-[10px] uppercase block">Beneficiary Balance</span>
          <span className="text-base font-bold text-cyan-400">
            {(ledger.Sovereign_Wallet_System.balances[beneficiaryNode] || 0).toFixed(2)} AGATE
          </span>
        </div>
        <div className="bg-[#020617] border border-slate-800 p-3 rounded-lg">
          <span className="text-slate-500 text-[10px] uppercase block">Merkle Root</span>
          <span className="text-xs font-bold text-slate-300 truncate block" title={ledger.merkle_root}>
            {ledger.merkle_root.slice(0, 14)}...
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real Transaction Intake Form */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-semibold text-orange-400 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" /> Intake Real Reclamation Data
          </h3>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Harvester Node Source ID
            </label>
            <input
              type="text"
              value={harvesterId}
              onChange={(e) => setHarvesterId(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Target Beneficiary Node Account
            </label>
            <select
              value={beneficiaryNode}
              onChange={(e) => setBeneficiaryNode(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500/50"
            >
              {Object.keys(ledger.Sovereign_Wallet_System.balances).map(k => (
                <option key={k} value={k}>{k} (Bal: {ledger.Sovereign_Wallet_System.balances[k]} AGATE)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Systemic Waste Intake Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={wasteWeight}
              onChange={(e) => setWasteWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#020617] border border-[#1e293b] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div className="bg-[#121c2c] border border-[#1e2d4a] rounded p-3 text-xs font-mono text-slate-300">
            <div className="flex justify-between font-bold mb-1">
              <span>Verified Token Minting:</span>
              <span className="text-emerald-400">{(wasteWeight * tokenRate).toFixed(2)} AGATE</span>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Formula: weight_kg × 0.15 = minted_tokens. Proof of efficacy generated via WebCrypto SHA-256.
            </p>
          </div>

          <button
            onClick={executeRealRegisterAndBurn}
            disabled={isBurning || wasteWeight <= 0}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5 px-4 rounded-lg text-xs font-mono transition-all disabled:opacity-50 shadow-lg shadow-orange-950/20 cursor-pointer"
          >
            {isBurning ? (
              <>
                <Flame className="w-4 h-4 animate-spin text-orange-200" />
                Computing Real SHA-256 Proof & Updating Vault...
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-orange-200" />
                Register & Burn Asset (Commit to Ledger)
              </>
            )}
          </button>

          {/* Success Banner */}
          {justMinted && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-300 space-y-1 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Transaction Committed!
              </div>
              <p className="text-[10px] text-slate-300">
                Issued +{justMinted.tokens_minted} AGATE to {beneficiaryNode}.
              </p>
              <p className="text-[9px] text-slate-400 truncate" title={justMinted.tx_id}>
                TX ID: {justMinted.tx_id}
              </p>
            </div>
          )}
        </div>

        {/* Center/Right Column: Live State Sync and Real Audit Trail */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-orange-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> consensus_memory.json
                </h3>
                <button
                  onClick={() => handleCopy(JSON.stringify(ledger, null, 2), "ledger")}
                  className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" />
                  {copiedKey === "ledger" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-3 h-44 overflow-auto font-mono text-[11px]">
                <pre className="text-slate-300">{JSON.stringify(ledger, null, 2)}</pre>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-orange-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> ai_handshake.txt Protocol
                </h3>
                <button
                  onClick={downloadHandshakeTxt}
                  className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
                >
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>
              <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-3 h-44 overflow-auto font-mono text-[10px] text-emerald-400 space-y-1.5">
                {handshakeLogs.map((handshake, i) => (
                  <div key={i} className="border-b border-slate-900 pb-1 last:border-0 leading-relaxed">
                    {handshake}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Genuine Transaction History Table */}
          <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Real Immutable Ledger Audit Chain ({ledger.transactions.length} confirmed)
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                SHA-256 Merkle Chained
              </span>
            </div>
            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-left font-mono text-[10px] border-collapse">
                <thead className="sticky top-0 bg-[#020617] z-10">
                  <tr className="text-slate-500 border-b border-slate-800 pb-2">
                    <th className="py-1">TIMESTAMP</th>
                    <th className="py-1">TX_ID</th>
                    <th className="py-1">HARVESTER</th>
                    <th className="py-1">BURNED (KG)</th>
                    <th className="py-1">MINTED (AGATE)</th>
                    <th className="py-1">PROOF OF EFFICACY (SHA-256)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {ledger.transactions.map((tx, idx) => (
                    <tr key={tx.tx_id || idx} className="hover:bg-slate-900/40">
                      <td className="py-1.5 text-slate-400">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                      <td className="py-1.5 text-orange-400 font-bold" title={tx.tx_id}>
                        {tx.tx_id.slice(0, 10)}...
                      </td>
                      <td className="py-1.5">{tx.harvester_id}</td>
                      <td className="py-1.5">{tx.waste_weight}</td>
                      <td className="py-1.5 text-emerald-400 font-bold">+{tx.tokens_minted}</td>
                      <td className="py-1.5 text-[9px] text-slate-400 font-mono" title={tx.proof_of_efficacy}>
                        {tx.proof_of_efficacy.slice(0, 20)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
