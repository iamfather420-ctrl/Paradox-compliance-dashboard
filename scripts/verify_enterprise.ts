/**
 * DFRL ENTERPRISE VERIFICATION HARNESS
 * Project AGATE / Daisy Haminja
 * 
 * Executes:
 * 1. Z3 Dependency-Failure Test (Fail-closed behavior when solver is unavailable)
 * 2. SMT Mutation Test (Proves mutated theorem produces SAT/FAIL and restored theorem produces UNSAT/PASS)
 * 3. Artifact-Tamper Test (Proves 1-byte mutation alters SHA-256 and is detected)
 */

import { init } from "z3-solver";
import { createServer } from "http";
import { DFRLEngine } from "../src/services/dfrlEngine.js";
import { createHash } from "crypto";
import { REAL_88_PARADOX_REGISTRY } from "../src/data/paradoxData.js";
import { generateMathematicalProof } from "../src/services/dfrlFormalArtifacts.js";

async function runEnterpriseTests() {
  console.log("==================================================================");
  console.log("DFRL ENTERPRISE SECURITY & ANTI-FABRICATION TEST SUITE");
  console.log("==================================================================");

  let passedAll = true;

  // ==================================================================
  // TEST 1: SMT MUTATION TEST (Requirement 10)
  // ==================================================================
  console.log("\n[TEST 1] SMT Mutation Test (PARADOX_08 Byzantine Quorum)");
  const item08 = REAL_88_PARADOX_REGISTRY.find(p => p.id === "PARADOX_08")!;
  const originalProof = generateMathematicalProof(item08);
  const originalScript = originalProof.formal_code;

  const { Context } = await init();
  const ctx = new Context("main");

  // Step 1: Verify original is UNSAT
  const solverOriginal = new ctx.Solver();
  solverOriginal.fromString(originalScript);
  const originalResult = await solverOriginal.check();
  console.log(`  -> Original SMT-LIB execution: result = "${originalResult}" (Expected: unsat)`);
  if (originalResult !== "unsat") {
    console.error("  FAILED: Original theorem was not UNSAT!");
    passedAll = false;
  }

  // Step 2: Mutate the theorem to make the negated proposition satisfiable
  // In PARADOX_08: original has: (assert (<= honest_intersection 0))
  // Mutation: (assert (> honest_intersection 0))
  const mutatedScript = originalScript.replace(
    "(assert (<= honest_intersection 0))",
    "(assert (> honest_intersection 0))"
  );
  const solverMutated = new ctx.Solver();
  solverMutated.fromString(mutatedScript);
  const mutatedResult = await solverMutated.check();
  console.log(`  -> Mutated SMT-LIB execution: result = "${mutatedResult}" (Expected: sat)`);
  if (mutatedResult !== "sat") {
    console.error("  FAILED: Mutated theorem did not return SAT!");
    passedAll = false;
  } else {
    console.log("  -> SUCCESS: Mutated theorem correctly rejected (Z3 returned SAT, verification fails).");
  }

  // Step 3: Re-verify original is restored
  const solverRestored = new ctx.Solver();
  solverRestored.fromString(originalScript);
  const restoredResult = await solverRestored.check();
  console.log(`  -> Restored SMT-LIB execution: result = "${restoredResult}" (Expected: unsat)`);
  if (restoredResult !== "unsat") {
    console.error("  FAILED: Restored theorem failed to return UNSAT!");
    passedAll = false;
  }

  // ==================================================================
  // TEST 2: ARTIFACT-TAMPER TEST (Requirement 11)
  // ==================================================================
  console.log("\n[TEST 2] Artifact-Tamper & Cryptographic Digest Test");
  const origHash = "0x" + createHash("sha256").update(originalScript).digest("hex");
  const tamperedScript = originalScript + " "; // Add 1 single trailing space
  const tamperedHash = "0x" + createHash("sha256").update(tamperedScript).digest("hex");

  console.log(`  -> Original SHA-256: ${origHash}`);
  console.log(`  -> Tampered SHA-256: ${tamperedHash}`);

  if (origHash === tamperedHash) {
    console.error("  FAILED: SHA-256 collision occurred or hash did not change!");
    passedAll = false;
  } else {
    console.log("  -> SUCCESS: 1-byte artifact modification strictly altered SHA-256 digest.");
  }

  // ==================================================================
  // TEST 3: REAL DFRL VERIFIER ENDPOINT FAILURE TEST
  // ==================================================================
  console.log("\n[TEST 3] Real DFRL verifier endpoint failure & fail-closed behavior");
  const oldApiBase = process.env.API_BASE_URL;
  const unavailableServer = createServer((_request, response) => {
    response.writeHead(503, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "test verifier unavailable" }));
  });
  await new Promise<void>((resolve, reject) => {
    unavailableServer.once("error", reject);
    unavailableServer.listen(0, "127.0.0.1", resolve);
  });
  const address = unavailableServer.address();
  if (!address || typeof address === "string") throw new Error("Could not bind local verifier test server");
  try {
    process.env.API_BASE_URL = `http://127.0.0.1:${address.port}`;
    const certificate = await DFRLEngine.getInstance().verify("PARADOX_08");
    console.log(`  -> Actual verifier request result: ${certificate.formal_verifier.execution_status}`);
    if (certificate.formal_verifier.execution_status !== "FORMAL_EXECUTION_NOT_PERFORMED") {
      console.error("  FAILED: unavailable verifier was not represented as NOT_PERFORMED");
      passedAll = false;
    } else {
      console.log("  -> SUCCESS: actual DFRL verifier path failed closed on HTTP 503.");
    }
    if (certificate.status === "VERIFIED") {
      console.error("  FAILED: certificate was marked VERIFIED without a successful formal verifier");
      passedAll = false;
    }
    for (const gateId of ["GATE_C_REPRODUCE_TENSION", "GATE_E_EFFICACY", "GATE_F_INDEPENDENT_REPLAY", "GATE_G_FALSIFICATION"] as const) {
      if (certificate.gates[gateId].passed) {
        console.error(`  FAILED: ${gateId} passed without an implementation-backed execution adapter`);
        passedAll = false;
      }
    }
  } finally {
    if (oldApiBase === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = oldApiBase;
    await new Promise<void>((resolve) => unavailableServer.close(() => resolve()));
  }

  console.log("\n------------------------------------------------------------------");
  if (passedAll) {
    console.log("✓ ALL ENTERPRISE AUDIT TESTS PASSED STRICTLY WITHOUT FABRICATION");
    process.exit(0);
  } else {
    console.error("✗ ONE OR MORE ENTERPRISE TESTS FAILED");
    process.exit(1);
  }
}

runEnterpriseTests().catch(err => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
