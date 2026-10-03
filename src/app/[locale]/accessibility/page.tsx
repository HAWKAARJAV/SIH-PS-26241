export default function AccessibilityPage() {
  return (
    <article className="space-y-3 prose-measure">
      <h1 className="font-display text-4xl">Accessibility</h1>
      <p>Nourish aims for WCAG 2.2 AA in light mode: visible focus, 48px targets, text that can zoom, and a polite live region in chat.</p>
      <p>High contrast stays light. Lite mode hides decoration. Motion stops when the device asks for reduced motion.</p>
      <p>Known limit: a full assistive-technology user test with families is not claimed. See the field-test section in the low-literacy note.</p>
    </article>
  );
}
