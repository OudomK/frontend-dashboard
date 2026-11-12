// User-facing messages for errors from the document processing endpoints
// (/upload, /update, /process, /sync, /activate, /deactivate).
import { isAxiosError } from "axios";

type Translate = (key: string) => string;

type ValidationIssue = { loc?: (string | number)[]; msg?: string };
type ErrorBody = { detail?: string | ValidationIssue[]; message?: string };

function responseOf(error: unknown) {
  return isAxiosError<ErrorBody>(error) ? error.response : undefined;
}

// Raw backend message: FastAPI `detail` (string or validation-error array),
// falling back to `message` / the error's own message.
export function formatBackendError(error: unknown): string {
  const data = responseOf(error)?.data;
  const detail = data?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : "field";
        return `${field}: ${d.msg}`;
      })
      .join(", ");
  }
  if (typeof detail === "string" && detail) {
    return detail;
  }
  return data?.message || (error instanceof Error ? error.message : "") || "An error occurred";
}

// No HTTP response at all (network drop, client timeout, browser-blocked
// response) or a gateway timeout: the backend may still be working on the
// request, so retrying straight away could start a second run.
export function isUncertainOutcome(error: unknown): boolean {
  const response = responseOf(error);
  return !response || response.status === 504;
}

// Backend 400 details that have a translated message.
const DETAIL_KEYS: Record<string, string> = {
  "Document not processed yet": "docs.errNotProcessed",
  "Cannot delete the active version. Activate another version first, or deactivate this one.": "docs.errDeleteActive",
  "Document is being processed.": "docs.errBeingProcessed",
  "Cannot delete the original version while newer versions exist. Delete the newer versions first.": "docs.errDeleteRoot",
};

export function documentErrorMessage(error: unknown, t: Translate): string {
  if (isUncertainOutcome(error)) {
    return t("docs.errMayStillRun");
  }
  const response = responseOf(error)!;
  if (response.status === 429) {
    return t("docs.errQuota");
  }
  const detail = response.data?.detail;
  if (response.status === 400 && typeof detail === "string" && DETAIL_KEYS[detail]) {
    return t(DETAIL_KEYS[detail]);
  }
  return formatBackendError(error);
}
