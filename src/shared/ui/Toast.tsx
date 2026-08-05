'use client'

import { useToastStore } from '@/shared/lib/toast'

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore()
  if (!toasts.length) return null
  return (
    <div className="bj-toast-container">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`bj-toast${t.type === 'error' ? ' bj-toast--error' : ''}`}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
