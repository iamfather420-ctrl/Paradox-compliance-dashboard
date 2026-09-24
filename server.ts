import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { init } from 'z3-solver';
import { REAL_88_PARADOX_REGISTRY, ParadoxItem } from './src/data/paradoxData';
import { generateMathematicalProof, extractProvenance } from './src/services/dfrlFormalArtifacts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Initialize Real Z3 Theorem Prover instance in Node
  let z3Context: any = null;
  let z3InitPromise: Promise<any> | null = null;

  async function getZ3() {
    if (z3Context) return z3Context;
    if (!z3InitPromise) {
      z3InitPromise = (async () => {
        const { Context } = await init();
        z3Context = new Context('main');
        console.log('[Z3] Real Z3 Theorem Prover initialized successfully');
        return z3Context;
      })();
    }
    return z3InitPromise;
  }

  // Pre-warm Z3
  getZ3().catch(err => console.error('[Z3 Init Error]', err));

  // ==========================================
  // REAL DFRL VERIFICATION ENDPOINT
  // ==========================================
  app.post('/api/dfrl/verify', async (req, res) => {
    try {
      const { operatorId } = req.body;
      const item = REAL_88_PARADOX_REGISTRY.find(p => p.id === operatorId);

      if (!item) {
        return res.status(404).json({ error: `Operator ${operatorId} not found in canonical registry` });
      }

      const ctx = await getZ3();
      const mathProof = generateMathematicalProof(item);
      const provenance = extractProvenance(item);
      const startTime = performance.now();

      // Execute Real Z3 Theorem Prover on the SMT-LIB script
      const solver = new ctx.Solver();
      let z3Status = 'FORMAL_EXECUTION_NOT_PERFORMED';
      let rawOutput = '';
      let executionError = null;

      try {
        solver.fromString(mathProof.formal_code);
        const checkResult = await solver.check();
        const durationMs = (performance.now() - startTime).toFixed(3);

        if (checkResult === 'unsat') {
          z3Status = 'UNSAT';
          rawOutput = `unsat\n(\n  (solver "Z3 Theorem Prover (WebAssembly Node Kernel)")\n  (version "4.12.2")\n  (status "unsat")\n  (execution-time-ms ${durationMs})\n  (proof-result "UNSATISFIABLE (Negated conjecture has no models; safety invariant holds)")\n  (logic "${mathProof.formal_representation_type}")\n  (checks 1)\n)`;
        } else if (checkResult === 'sat') {
          z3Status = 'SAT';
          rawOutput = `sat\n(\n  (solver "Z3 Theorem Prover")\n  (status "sat")\n  (error "Model found for negated conjecture; invariant violated")\n)`;
        } else {
          z3Status = 'UNKNOWN';
          rawOutput = `unknown\n(status "unknown")`;
        }
      } catch (err: any) {
        executionError = err.message;
        z3Status = 'FORMAL_EXECUTION_NOT_PERFORMED';
        rawOutput = `ERROR: Z3 execution failed: ${err.message}`;
      }

      res.json({
        operatorId: item.id,
        z3Status,
        durationMs: (performance.now() - startTime).toFixed(3),
        rawOutput,
        mathProof,
        provenance,
        executionError
      });
    } catch (err: any) {
      console.error('[Verify API Error]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Batch verify all 88 against real Z3
  app.post('/api/dfrl/verify-all', async (req, res) => {
    try {
      const ctx = await getZ3();
      const results: Record<string, any> = {};
      const startAll = performance.now();

      for (const item of REAL_88_PARADOX_REGISTRY) {
        const mathProof = generateMathematicalProof(item);
        const solver = new ctx.Solver();
        const start = performance.now();
        let status = 'FORMAL_EXECUTION_NOT_PERFORMED';
        try {
          solver.fromString(mathProof.formal_code);
          const r = await solver.check();
          status = r === 'unsat' ? 'UNSAT' : (r === 'sat' ? 'SAT' : 'UNKNOWN');
        } catch (e: any) {
          status = 'ERROR';
        }
        results[item.id] = {
          status,
          timeMs: (performance.now() - start).toFixed(2)
        };
      }

      res.json({
        total: REAL_88_PARADOX_REGISTRY.length,
        totalTimeMs: (performance.now() - startAll).toFixed(2),
        results
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Health check endpoint
  app.get('/api/dfrl/health', async (req, res) => {
    try {
      const ctx = await getZ3();
      const solver = new ctx.Solver();
      const x = ctx.Int.const('x');
      solver.add(x.gt(0));
      solver.add(x.lt(0));
      const r = await solver.check();
      res.json({ z3: 'ONLINE', check: r });
    } catch (e: any) {
      res.status(500).json({ z3: 'OFFLINE', error: e.message });
    }
  });

  // In development, mount Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
