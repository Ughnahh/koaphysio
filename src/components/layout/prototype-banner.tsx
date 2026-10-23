/** Visible reminder that this build is a prototype with placeholder data. */
export function PrototypeBanner() {
  return (
    <div className="bg-ink px-4 py-2 text-center text-xs text-sand-200">
      <span className="font-semibold text-sand-50">Prototype preview.</span> Content is placeholder and no
      information you enter is sent or stored outside your browser.
    </div>
  );
}
