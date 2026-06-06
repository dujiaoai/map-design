export function WorkspaceMapAtmosphere({ subdued = false }: { subdued?: boolean }) {
  return (
    <div
      className={subdued ? 'workspace-map-atmosphere workspace-map-atmosphere--subdued' : 'workspace-map-atmosphere'}
      aria-hidden="true"
    >
      <div className="cc-grid" />
      <div className="cc-grid-floor" />
      <div className="cc-aurora" />
      <div className="cc-scanline" />
    </div>
  )
}
