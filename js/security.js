/**
 * Escape untrusted text before inserting it into an HTML template.
 * Prefer textContent for DOM updates; use this only where the existing
 * renderer builds HTML strings.
 */
export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character]);
}
