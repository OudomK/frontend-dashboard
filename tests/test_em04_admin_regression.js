/**
 * EM-04.1 Dashboard Regression Tests: Real Implementation Execution
 *
 * Imports and executes the actual production functions from:
 * 1. `frontend-dashboard/app/dashboard/settings/page.tsx` (`validateSettingsUrl`)
 * 2. `frontend-dashboard/components/emergency-rules/emergency-rules.tsx` (`initRuleForm`, `buildRulePayload`)
 *
 * Uses the project's installed TypeScript compiler hook and path alias resolver.
 */

const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("typescript");

// Intercept @/ path alias to resolve to frontend-dashboard root
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    request = path.join(__dirname, "..", request.slice(2));
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

// Register in-process .tsx and .ts compilation hook using the project's installed TypeScript
require.extensions[".tsx"] = require.extensions[".ts"] = function (module, filename) {
  const code = fs.readFileSync(filename, "utf8");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  });
  module._compile(transpiled.outputText, filename);
};

// Import REAL production implementations
const { validateSettingsUrl } = require("../app/dashboard/settings/page.tsx");
const { initRuleForm, buildRulePayload, EMPTY_FORM } = require("../components/emergency-rules/emergency-rules.tsx");

function check(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`OK: ${message}`);
}

console.log("=== Running EM-04.1 Admin Settings URL Validation Tests ===");

// 1. Valid URLs
const fbUrl = "https://www.facebook.com/Bellynclinic?mibextid=wwXIfr";
const fbRes = validateSettingsUrl(fbUrl);
check(fbRes.valid === true, "Valid Facebook URL accepted");
check(fbRes.sanitized === fbUrl, "Valid Facebook URL preserved unchanged");

const tgUrl = "https://t.me/bellyn";
const tgRes = validateSettingsUrl(tgUrl);
check(tgRes.valid === true, "Valid Telegram URL accepted");
check(tgRes.sanitized === tgUrl, "Valid Telegram URL preserved unchanged");

const genericUrl = "https://example-clinic.com/contact?id=123";
const genericRes = validateSettingsUrl(genericUrl);
check(genericRes.valid === true, "Valid arbitrary HTTPS URL accepted");
check(genericRes.sanitized === genericUrl, "Valid arbitrary HTTPS URL preserved unchanged");

// 2. Empty input (supported setting clearing)
const emptyRes = validateSettingsUrl("");
check(emptyRes.valid === true, "Empty input accepted for clearing setting");
check(emptyRes.sanitized === "", "Empty input sanitized to empty string");

const whitespaceRes = validateSettingsUrl("   ");
check(whitespaceRes.valid === true, "Whitespace-only input accepted for clearing setting");
check(whitespaceRes.sanitized === "", "Whitespace input sanitized to empty string");

// 3. Malformed and invalid URLs (must be rejected)
const protoOnlyRes = validateSettingsUrl("https://");
check(protoOnlyRes.valid === false, "Protocol-only 'https://' rejected");

const noHostRes = validateSettingsUrl("https://?x=1");
check(noHostRes.valid === false, "Missing-host 'https://?x=1' rejected");

const jsRes = validateSettingsUrl("javascript:alert(1)");
check(jsRes.valid === false, "'javascript:alert(1)' rejected");

const dataRes = validateSettingsUrl("data:text/html,bad");
check(dataRes.valid === false, "'data:' protocol rejected");

const bareHandleRes = validateSettingsUrl("bellynclinic");
check(bareHandleRes.valid === false, "Bare handle 'bellynclinic' rejected (no protocol/host)");

const bareTgRes = validateSettingsUrl("t.me/bellyn");
check(bareTgRes.valid === false, "Protocol-less 't.me/bellyn' rejected");

const credRes = validateSettingsUrl("https://user:pass@facebook.com");
check(credRes.valid === false, "URL with embedded credentials rejected");

console.log("\n=== Running EM-04.1 Emergency Rules Contact Association Tests ===");

// Rule with existing non-null clinic contact (Rule 5)
const existingRuleWithContact = {
  id: 5,
  name: "ធ្លាក់ឈាមបន្ទាន់",
  category_id: null,
  keyword_pattern: "ធ្លាក់ឈាម",
  severity_level: "critical",
  advice_text: { km: "សូមប្រញាប់ទៅមន្ទីរពេទ្យ", en: "Please visit hospital" },
  clinic_contact_id: 1,
  is_active: true,
  created_by: 1,
  created_at: "2026-01-01T00:00:00Z",
};

// 1. Initialize edit form from existing rule: clinic_contact_id=1 must be preserved
const form1 = initRuleForm(existingRuleWithContact);
check(form1.clinic_contact_id === 1, "initRuleForm preserves clinic_contact_id=1");

// 2. Build payload without touching selector: clinic_contact_id=1 must be preserved in payload
const payload1 = buildRulePayload(form1);
check(payload1.clinic_contact_id === 1, "buildRulePayload preserves clinic_contact_id=1 when untouched");
check(payload1.name === "ធ្លាក់ឈាមបន្ទាន់", "Payload name preserved");

// 3. User modifies keyword_pattern only, leaving clinic contact untouched
form1.keyword_pattern = "ធ្លាក់ឈាម, ធ្លាក់ឈាមខ្លាំង";
const payloadModified = buildRulePayload(form1);
check(payloadModified.clinic_contact_id === 1, "clinic_contact_id=1 preserved after keyword modification");
check(payloadModified.keyword_pattern === "ធ្លាក់ឈាម, ធ្លាក់ឈាមខ្លាំង", "Keyword pattern updated");

// 4. Rule with existing null clinic contact (Rule without clinic)
const existingRuleWithoutContact = {
  id: 7,
  name: "Rule without contact",
  category_id: 2,
  keyword_pattern: "test",
  severity_level: "warning",
  advice_text: { km: "km", en: "en" },
  clinic_contact_id: null,
  is_active: true,
  created_by: 1,
  created_at: "2026-01-01T00:00:00Z",
};

const formNull = initRuleForm(existingRuleWithoutContact);
check(formNull.clinic_contact_id === null, "initRuleForm preserves clinic_contact_id=null");

const payloadNull = buildRulePayload(formNull);
check(payloadNull.clinic_contact_id === null, "buildRulePayload preserves clinic_contact_id=null when untouched");

// 5. User explicitly assigns clinic contact 3
formNull.clinic_contact_id = 3;
const payloadAssigned = buildRulePayload(formNull);
check(payloadAssigned.clinic_contact_id === 3, "Explicit clinic contact assignment sends selected ID");

// 6. User explicitly clears clinic contact (unassigns)
form1.clinic_contact_id = null;
const payloadCleared = buildRulePayload(form1);
check(payloadCleared.clinic_contact_id === null, "Explicit clinic contact removal sends null");

// 7. New rule initialization
const formNew = initRuleForm(null);
check(formNew.clinic_contact_id === null, "New rule form defaults clinic_contact_id to null");
formNew.name = "Brand New Rule";
formNew.keyword_pattern = "new_kw";
formNew.advice_text = { km: "khmer advice", en: "english advice" };
formNew.clinic_contact_id = 2;
const payloadNew = buildRulePayload(formNew);
check(payloadNew.clinic_contact_id === 2, "New rule payload includes explicitly selected clinic_contact_id");

console.log("\nALL EM-04.1 ADMIN DASHBOARD REGRESSION TESTS PASSED (22/22 checks)!");
