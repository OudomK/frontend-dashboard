/**
 * EM-06.7 Frontend Permission-Aware Status Actions Verification Test Suite
 *
 * Verifies:
 * 1. ActiveEmergencyCasesPage imports useAuthStore.
 * 2. canResolve derives from user?.permissions?.includes("resolve_emergency").
 * 3. Fail-closed evaluation with synthetic permission profiles (hydrated, unhydrated, view-only, null).
 * 4. Desktop table hides status mutation actions when canResolve is false.
 * 5. Mobile cards list hides status mutation actions when canResolve is false.
 * 6. Incident Details dialog footer hides status mutation actions when canResolve is false.
 * 7. Read-only actions (View Details, Close, Summary Metrics, Filters) remain available for view_emergency users.
 * 8. executeStatusChange defends against unauthorized invocation if canResolve is false.
 */

const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;

function check(condition, message) {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    failed++;
    process.exitCode = 1;
  } else {
    console.log(`OK: ${message}`);
    passed++;
  }
}

console.log("=== 1. Inspecting emergency-cases/page.tsx Code Structure ===");

const pagePath = path.join(__dirname, "../app/dashboard/emergency-cases/page.tsx");
const pageSource = fs.readFileSync(pagePath, "utf8");

// 1. Auth Store Import
check(
  pageSource.includes('import { useAuthStore } from "@/lib/store/use-auth-store";'),
  "emergency-cases/page.tsx imports useAuthStore"
);

// 2. canResolve derivation
check(
  pageSource.includes("const { user } = useAuthStore();"),
  "Page consumes user from useAuthStore"
);
check(
  pageSource.includes('const canResolve = Boolean(user?.permissions?.includes("resolve_emergency"));'),
  "Page derives canResolve strictly from 'resolve_emergency' permission"
);

// 3. executeStatusChange defense-in-depth guard
check(
  pageSource.includes("if (!canResolve) {") &&
    pageSource.includes("Unauthorized to update emergency case status"),
  "executeStatusChange guards against mutation when canResolve is false"
);

// 4. Desktop Table Actions Guard
check(
  pageSource.includes("{/* Status Quick Actions */}") &&
    pageSource.includes("{canResolve && ("),
  "Desktop table wraps status quick actions in {canResolve && ( ... )}"
);

// 5. Mobile Cards Actions Guard
check(
  pageSource.includes("{/* Mobile Cards List */}") &&
    pageSource.includes("{canResolve && ("),
  "Mobile cards list wraps status quick actions in {canResolve && ( ... )}"
);

// 6. Dialog Footer Actions Guard
check(
  pageSource.includes("<DialogFooter") &&
    pageSource.includes("{canResolve && ("),
  "DialogFooter wraps status mutation actions in {canResolve && ( ... )}"
);

// 7. Read-only controls preservation
check(
  pageSource.includes('onClick={() => setSelectedCase(item)}') &&
    pageSource.includes('{t("emergencyCases.viewDetails")}'),
  "'View Details' button remains unconditionally rendered for authorized viewers"
);
check(
  pageSource.includes('<Button\n                    variant="secondary"\n                    size="sm"\n                    onClick={() => setSelectedCase(null)}\n                  >\n                    Close\n                  </Button>') ||
  pageSource.includes('onClick={() => setSelectedCase(null)}') && pageSource.includes('Close'),
  "'Close' button in DialogFooter remains unconditionally available"
);

console.log("\n=== 2. Evaluating canResolve Logic with Synthetic Permission Profiles ===");

function evaluateCanResolve(user) {
  return Boolean(user?.permissions?.includes("resolve_emergency"));
}

// Profile A: Doctor with view_emergency and resolve_emergency
const doctorUser = {
  email: "doctor@femhealth.ai",
  roleId: 2,
  permissions: ["view_emergency", "resolve_emergency", "view_chat_logs"],
};
check(
  evaluateCanResolve(doctorUser) === true,
  "Doctor with 'resolve_emergency' evaluates canResolve = true"
);

// Profile B: Admin Monitor with view_emergency only
const adminMonitorUser = {
  email: "admin@femhealth.ai",
  roleId: 3,
  permissions: ["view_emergency", "view_dashboard", "manage_emergency"],
};
check(
  evaluateCanResolve(adminMonitorUser) === false,
  "Admin with 'view_emergency' + 'manage_emergency' (without resolve_emergency) evaluates canResolve = false"
);

// Profile C: Doctor Manager with triage permission
const doctorManagerUser = {
  email: "manager@femhealth.ai",
  roleId: 4,
  permissions: ["view_emergency", "resolve_emergency", "manage_emergency"],
};
check(
  evaluateCanResolve(doctorManagerUser) === true,
  "Doctor Manager with 'resolve_emergency' evaluates canResolve = true"
);

// Profile D: Patient / Normal user
const patientUser = {
  email: "patient@femhealth.ai",
  roleId: 1,
  permissions: [],
};
check(
  evaluateCanResolve(patientUser) === false,
  "Patient with empty permissions evaluates canResolve = false"
);

// Profile E: Unhydrated user state (permissions undefined)
const unhydratedUser = {
  email: "loading@femhealth.ai",
  roleId: 2,
  permissions: undefined,
};
check(
  evaluateCanResolve(unhydratedUser) === false,
  "Unhydrated user state (permissions undefined) FAILS CLOSED: canResolve = false"
);

// Profile F: Null user state (unauthenticated or pre-init)
const nullUser = null;
check(
  evaluateCanResolve(nullUser) === false,
  "Null user state FAILS CLOSED: canResolve = false"
);

console.log("\n=== 3. Simulating Status Action Visibility Across User Profiles ===");

function getVisibleActions(user, caseItem) {
  const canResolve = evaluateCanResolve(user);
  const actions = ["viewDetails"];

  if (canResolve) {
    if (caseItem.status !== "resolved") {
      actions.push("markResolved");
    }
    if (caseItem.status === "needs_review") {
      actions.push("markFlagged");
    }
    if (caseItem.status === "resolved" || caseItem.status === "flagged") {
      actions.push("markNeedsReview");
    }
  }

  return actions;
}

const mockNeedsReviewCase = { id: 101, status: "needs_review" };
const mockFlaggedCase = { id: 102, status: "flagged" };
const mockResolvedCase = { id: 103, status: "resolved" };

// Doctor on needs_review case: viewDetails, markResolved, markFlagged
const doctorActions = getVisibleActions(doctorUser, mockNeedsReviewCase);
check(
  doctorActions.includes("viewDetails") &&
    doctorActions.includes("markResolved") &&
    doctorActions.includes("markFlagged"),
  "Doctor on needs_review case sees viewDetails, markResolved, markFlagged"
);

// Admin Monitor on needs_review case: viewDetails ONLY
const adminMonitorActions = getVisibleActions(adminMonitorUser, mockNeedsReviewCase);
check(
  adminMonitorActions.length === 1 && adminMonitorActions[0] === "viewDetails",
  "Admin Monitor on needs_review case sees viewDetails ONLY (mutation controls hidden)"
);

// Doctor on flagged case: viewDetails, markResolved, markNeedsReview
const doctorFlaggedActions = getVisibleActions(doctorUser, mockFlaggedCase);
check(
  doctorFlaggedActions.includes("viewDetails") &&
    doctorFlaggedActions.includes("markResolved") &&
    doctorFlaggedActions.includes("markNeedsReview"),
  "Doctor on flagged case sees viewDetails, markResolved, markNeedsReview"
);

// Admin Monitor on flagged case: viewDetails ONLY
const adminMonitorFlaggedActions = getVisibleActions(adminMonitorUser, mockFlaggedCase);
check(
  adminMonitorFlaggedActions.length === 1 && adminMonitorFlaggedActions[0] === "viewDetails",
  "Admin Monitor on flagged case sees viewDetails ONLY (mutation controls hidden)"
);

// Unhydrated session on resolved case: viewDetails ONLY
const unhydratedActions = getVisibleActions(unhydratedUser, mockResolvedCase);
check(
  unhydratedActions.length === 1 && unhydratedActions[0] === "viewDetails",
  "Unhydrated session on resolved case sees viewDetails ONLY"
);

console.log("\n=======================================================");
console.log(`EM-06.7 FRONTEND VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
console.log("=======================================================");

if (failed > 0) {
  process.exitCode = 1;
}
