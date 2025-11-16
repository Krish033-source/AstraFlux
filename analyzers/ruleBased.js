export function analyzeLog(log) {
  const msg = (log.message || "").toLowerCase();

  let result = {
    root_cause: "Unknown",
    why: "No matching rule found.",
    fix: "Add error handling and validate inputs.",
    severity: "low",
    snippet: `try { /* code */ } catch (err) { console.error(err); }`
  };

  const set = (root_cause, why, fix, severity = "med", snippet = "") => {
    result = { root_cause, why, fix, severity, snippet: snippet || result.snippet };
  };

  if (msg.includes("cannot read properties of undefined") || msg.includes("reading '")) {
    set(
      "Null/Undefined Access",
      "A variable or API response is undefined; property access crashes.",
      "Guard with null checks and ensure data exists before access.",
      "high",
      `// defensive check
if (!data) return;
const len = Array.isArray(data) ? data.length : 0;`
    );
  } else if (msg.includes("referenceerror")) {
    set("Reference Not Defined", "Using a symbol before definition/import.", "Import/define before use; enable ESLint no-undef.", "med");
  } else if (msg.includes("syntaxerror")) {
    set("Syntax Error", "Likely missing bracket/paren or invalid token.", "Fix syntax; run \`node --check file.js\` or rely on editor diagnostics.", "high");
  } else if (msg.includes("econnrefused") || msg.includes("connect econntimeout")) {
    set("Service Connectivity Failure", "Downstream service/DB unreachable.", "Verify URL/port/network; add retry with backoff.", "high",
`// retry helper
async function withRetry(fn, retries=3){
  for(let i=0;i<retries;i++){
    try { return await fn(); }
    catch(e){ if(i===retries-1) throw e; await new Promise(r=>setTimeout(r, 500*(i+1))); }
  }
}`);
  } else if (msg.includes("unexpected token") && msg.includes("json")) {
    set("Invalid JSON", "Attempting to parse malformed JSON.", "Wrap JSON.parse in try/catch and validate input first.", "med");
  } else if (msg.includes("permission") || msg.includes("eacces")) {
    set("Permission Error", "Process lacks permission for resource.", "Fix file perms or run with correct user.", "med");
  }

  return result;
}
