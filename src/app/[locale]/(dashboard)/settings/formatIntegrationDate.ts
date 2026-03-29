/** M-D-YYYY (no leading zeros), e.g. 3-29-2026 */
export function formatIntegrationDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
}
