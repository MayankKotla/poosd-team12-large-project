// Small success / error banner used across pages.
import type { ReactNode } from 'react'
type Props = { kind?: 'success' | 'error' | 'info'; children: ReactNode }

const styles = {
  success: 'bg-green-100 border-green-300 text-green-800',
  error: 'bg-red-100 border-red-300 text-red-800',
  info: 'bg-blue-100 border-blue-200 text-blue-800',
}

function Alert({ kind = 'info', children }: Props) {
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`border px-4 py-3 rounded-lg ${styles[kind]}`}>
      {children}
    </div>
  )
}

export default Alert
