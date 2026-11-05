import type { ReactNode } from 'react'
import { showSetupHints } from '../data/organization'

/** Development-only reminder for organization details that still need real values. */
export default function SetupHint({ field, children }: { field: string; children: ReactNode }) {
  if (!showSetupHints) return null
  return (
    <p className="setup-hint">
      <strong>Setup needed (dev only):</strong> {children} Add it in <code>src/data/organization.ts</code> → <code>{field}</code>.
    </p>
  )
}
