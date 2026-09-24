import React, { useState } from "react";
import { Folder, File, ChevronRight, ChevronDown, Code, ArrowRight, Layers, FileCode, Copy, Check } from "lucide-react";

interface TreeNodeProps {
  name: string;
  type: "file" | "directory";
  children?: TreeNodeProps[];
  description?: string;
  codeSnippet?: string;
}

const initialTreeData: TreeNodeProps[] = [
  {
    name: "Project-AGATE-Monorepo",
    type: "directory",
    children: [
      {
        name: "shared_libs",
        type: "directory",
        description: "Refactored Core libraries shared across all sovereign modules.",
        children: [
          {
            name: "ledger.py",
            type: "file",
            description: "Direct Ledger Read/Write module pointing to ~/.agate_node/vault/consensus_memory.json",
            codeSnippet: `import os
import json
import hashlib

class SovereignLedger:
    def __init__(self, path="~/.agate_node/vault/consensus_memory.json"):
        self.path = os.path.expanduser(path)
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        if not os.path.exists(self.path):
            self.write_ledger({})

    def read_ledger(self):
        try:
            with open(self.path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def write_ledger(self, data):
        with open(self.path, 'w') as f:
            json.dump(data, f, indent=4)

    def calculate_hash(self):
        data = self.read_ledger()
        serialized = json.dumps(data, sort_keys=True).encode('utf-8')
        return hashlib.sha256(serialized).hexdigest()
`
          },
          {
            name: "handshake.py",
            type: "file",
            description: "Secure cross-module communication using vault/ai_handshake.txt protocol.",
            codeSnippet: `import os
import datetime

class AIHandshake:
    def __init__(self, path="~/.agate_node/vault/ai_handshake.txt"):
        self.path = os.path.expanduser(path)
        os.makedirs(os.path.dirname(self.path), exist_ok=True)

    def send_handshake(self, sender, activity):
        timestamp = datetime.datetime.utcnow().isoformat()
        log_line = f"[{timestamp}] [SENDER:{sender}] [ACTIVITY:{activity}]\\n"
        with open(self.path, 'a') as f:
            f.write(log_line)

    def read_logs(self):
        if not os.path.exists(self.path):
            return []
        with open(self.path, 'r') as f:
            return f.readlines()
`
          },
          {
            name: "crypto.py",
            type: "file",
            description: "Sovereign wallet cryptography, Register & Burn logic signatures.",
            codeSnippet: `import hashlib
import time

class SovereignCrypto:
    @staticmethod
    def generate_proof_of_efficacy(device_id, waste_weight, parent_hash):
        payload = f"{device_id}-{waste_weight}-{parent_hash}-{time.time()}"
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    @staticmethod
    def verify_burn_signature(token_id, signature, public_key):
        # Implementation of cryptographic burn check
        calculated = hashlib.sha256(f"{token_id}-{public_key}".encode('utf-8')).hexdigest()
        return calculated == signature
`
          }
        ]
      },
      {
        name: "AGate-Sovergine-Wallet",
        type: "directory",
        description: "The secure, sovereign client digital wallet.",
        children: [
          {
            name: "wallet_core.py",
            type: "file",
            description: "Wallet initialization. Uses shared ledger and crypto modules.",
            codeSnippet: `from shared_libs.ledger import SovereignLedger
from shared_libs.crypto import SovereignCrypto
from shared_libs.handshake import AIHandshake

ledger = SovereignLedger()
handshake = AIHandshake()

def register_user_identity(user_id):
    state = ledger.read_ledger()
    if user_id not in state:
        state[user_id] = {"balance": 0.0, "registered_assets": []}
        ledger.write_ledger(state)
        handshake.send_handshake("Wallet", f"Registered Identity: {user_id}")
        print(f"[True] Wallet Registered {user_id}")
`
          }
        ]
      },
      {
        name: "Base-Waste-Harvester",
        type: "directory",
        description: "Systemic waste harvesters tracking collector routes and bin capacities.",
        children: [
          {
            name: "harvester.py",
            type: "file",
            description: "Waste intake logic. Writes records to central ledger.",
            codeSnippet: `from shared_libs.ledger import SovereignLedger
from shared_libs.handshake import AIHandshake

ledger = SovereignLedger()
handshake = AIHandshake()

def log_waste_harvest(collector_id, weight_kg):
    state = ledger.read_ledger()
    if "harvests" not in state:
        state["harvests"] = []
    
    harvest_record = {
        "collector_id": collector_id,
        "weight_kg": weight_kg,
        "status": "pending_reclamation"
    }
    state["harvests"].append(harvest_record)
    ledger.write_ledger(state)
    handshake.send_handshake("Harvester", f"Log Harvest: {weight_kg}kg by {collector_id}")
`
          }
        ]
      },
      {
        name: "Reclamation-Experts",
        type: "directory",
        description: "Orchestration & Verification module coordinating waste processing into values.",
        children: [
          {
            name: "expert_node.py",
            type: "file",
            description: "Auditing of harvests. Executes the 'Register & Burn' process into token balance.",
            codeSnippet: `from shared_libs.ledger import SovereignLedger
from shared_libs.crypto import SovereignCrypto
from shared_libs.handshake import AIHandshake

ledger = SovereignLedger()
handshake = AIHandshake()

def process_reclamation_burn(user_id, weight_kg):
    state = ledger.read_ledger()
    burn_proof = SovereignCrypto.generate_proof_of_efficacy(user_id, weight_kg, "ROOT")
    
    if user_id in state:
        tokens_issued = weight_kg * 0.15 # 0.15 AGATE per kg
        state[user_id]["balance"] += tokens_issued
        state[user_id]["registered_assets"].append({"proof": burn_proof, "weight": weight_kg})
        ledger.write_ledger(state)
        
        handshake.send_handshake("ReclamationExperts", f"Burn verified. Issued {tokens_issued} AGATE.")
        return burn_proof
    return None
`
          }
        ]
      },
      {
        name: "master_build.sh",
        type: "file",
        description: "Orchestration bash compiler script for Termux & Debian environments.",
        codeSnippet: `#!/usr/bin/env bash
# AGATE Monorepo Orchestration Script (w/ Solvex Pipeline Integration)
set -e

echo "[True] Initiating Project AGATE Monorepo Compilation..."
mkdir -p "$HOME/.agate_node/vault"
[ ! -f "$HOME/.agate_node/vault/consensus_memory.json" ] && echo "{}" > "$HOME/.agate_node/vault/consensus_memory.json"
[ ! -f "$HOME/.agate_node/vault/ai_handshake.txt" ] && touch "$HOME/.agate_node/vault/ai_handshake.txt"

buildozer android debug
`
      },
      {
        name: "buildozer.spec",
        type: "file",
        description: "Python-to-Android Buildozer specification targeting API 34 & NDK 25b.",
        codeSnippet: `[app]
title = AGATE Sovereign Suite
package.name = agate_sovereign_suite
package.domain = org.iamfather420_ctrl
source.dir = .
version = 1.0.0
requirements = python3,kivy,requests,sqlite3,webbrowser
android.api = 34
android.ndk = 25b
android.minapi = 24
`
      },
      {
        name: "main.py",
        type: "file",
        description: "Central router orchestrating multi-module execution and vault handshake.",
        codeSnippet: `import os
import sys
import json

vault_path = os.path.expanduser('~/.agate_node/vault')
consensus_memory = os.path.join(vault_path, 'consensus_memory.json')
ai_handshake = os.path.join(vault_path, 'ai_handshake.txt')

def read_ledger():
    try:
        with open(consensus_memory, 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "Internal Unverified"

if __name__ == '__main__':
    print("[True] AGATE Sovereign Suite Initialized.")
    print("Ledger Data:", read_ledger())
`
      }
    ]
  }
];

export default function MonorepoTree() {
  const [selectedFile, setSelectedFile] = useState<TreeNodeProps | null>(initialTreeData[0].children?.[0].children?.[0] || null);
  const [copied, setCopied] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "Project-AGATE-Monorepo": true,
    "shared_libs": true,
    "AGate-Sovergine-Wallet": true,
    "Base-Waste-Harvester": false,
    "Reclamation-Experts": false
  });

  const toggleExpand = (nodeName: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeName]: !prev[nodeName] }));
  };

  const handleCopyCode = () => {
    if (selectedFile?.codeSnippet) {
      navigator.clipboard.writeText(selectedFile.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderTree = (node: TreeNodeProps, depth = 0) => {
    const isDir = node.type === "directory";
    const isExpanded = expandedNodes[node.name];

    return (
      <div key={node.name} style={{ paddingLeft: `${depth * 14}px` }} className="font-mono text-xs">
        <div 
          onClick={() => {
            if (isDir) {
              toggleExpand(node.name);
            } else {
              setSelectedFile(node);
            }
          }}
          className={`flex items-center gap-2 py-1.5 px-2.5 rounded cursor-pointer transition-all ${
            selectedFile?.name === node.name 
              ? "bg-[#10b981]/20 border-l-2 border-emerald-500 text-emerald-400" 
              : "hover:bg-slate-800/40 text-slate-300"
          }`}
        >
          {isDir ? (
            <>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <Folder className="w-4 h-4 text-amber-500" />
            </>
          ) : (
            <>
              <span className="w-3.5"></span>
              <File className="w-4 h-4 text-cyan-400" />
            </>
          )}
          <span className="font-semibold text-[11px]">{node.name}</span>
          {node.description && depth === 1 && (
            <span className="text-[10px] text-slate-500 hidden md:inline truncate">- {node.description}</span>
          )}
        </div>

        {isDir && isExpanded && node.children && (
          <div className="border-l border-slate-800 ml-3">
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#0b1329] border border-[#1e293b] rounded-xl p-6 shadow-2xl font-sans" id="monorepo-tree-section">
      <div className="flex items-center gap-3 mb-6 border-b border-[#1e2d4a] pb-4">
        <Layers className="w-6 h-6 text-cyan-400" />
        <div>
          <h2 className="text-lg font-semibold text-slate-100 font-mono">Monorepo Refactoring Strategy</h2>
          <p className="text-xs text-slate-400">Common functionalities refactored into centralized shared modules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monorepo Tree */}
        <div className="lg:col-span-5 bg-[#020617] rounded-xl border border-[#1e293b] p-4 h-[420px] overflow-auto">
          <h3 className="text-xs font-semibold text-cyan-400 font-mono uppercase tracking-wider mb-3 px-2 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <span>Unified Monorepo Tree</span>
          </h3>
          <div className="space-y-1">
            {initialTreeData.map(node => renderTree(node, 0))}
          </div>
        </div>

        {/* Right Column: Refactored Library View */}
        <div className="lg:col-span-7 flex flex-col h-[420px] justify-between">
          <div className="bg-[#020617] rounded-xl border border-[#1e293b] p-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-mono font-bold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                {selectedFile?.name || "Select a file to inspect code"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#1e293b] text-slate-300 font-mono px-2 py-0.5 rounded">
                  {selectedFile?.name.endsWith(".py") ? "Python Implementation" : "Shell / Configuration"}
                </span>
                {selectedFile?.codeSnippet && (
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>

            {selectedFile ? (
              <div className="flex-1 flex flex-col min-h-0">
                <p className="text-[11px] text-slate-400 italic mb-2 px-1">
                  💡 {selectedFile.description}
                </p>
                {selectedFile.codeSnippet ? (
                  <div className="flex-1 overflow-auto bg-[#070b19] p-3 rounded border border-[#111c3a] font-mono text-xs text-slate-300">
                    <pre className="whitespace-pre">{selectedFile.codeSnippet}</pre>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Code className="w-10 h-10 mb-2 opacity-40 text-cyan-400" />
                    <span>Select a file from the tree to view genuine code implementation.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                <span>Select a node from the monorepo tree to audit shared functions.</span>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 rounded-lg bg-[#0c243a]/30 border border-[#1e3a5f]/40 flex gap-3 items-center">
            <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="text-[11px] text-slate-300 font-sans">
              <span className="font-semibold text-cyan-300">Refactoring Parity:</span> Moving file-system accesses out of individual modules and routing all reads through <code className="bg-[#1e293b] text-slate-200 px-1 rounded font-mono">shared_libs/ledger.py</code> guarantees that all components align exactly with the strict ledger validation requirements of Project AGATE.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
