export type FormIssue = { field: string; message: string };
export type FormRule = FormIssue & { valid: boolean };

export function getFormIssues(rules: FormRule[]): FormIssue[] {
  return rules.filter((rule) => !rule.valid).map(({ field, message }) => ({ field, message }));
}