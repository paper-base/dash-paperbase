/**
 * Selectors for elements that should not trigger table/list row navigation
 * when clicked or activated from within their subtree.
 */
const NESTED_INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "[data-row-nav-ignore]",
  // Note: do NOT include [role="link"] or [role="button"] here — ClickableTableRow /
  // ClickableListItem set those roles on the row root, and closest() would match the
  // row itself and block all navigation. Real links use <a href>; real buttons use <button>.
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
].join(",")

/**
 * Returns true if the event target lies inside a nested interactive control
 * (native or ARIA) or a subtree marked with `data-row-nav-ignore`.
 */
export function isNestedInteractiveTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false
  return Boolean(target.closest(NESTED_INTERACTIVE_SELECTOR))
}
