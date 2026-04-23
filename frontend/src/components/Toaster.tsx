import { CheckCircle, XCircle, X } from 'lucide-react'
import { ToastItem } from '../hooks/useToast'

interface Props {
  toasts: ToastItem[]
  onRemove: (id: number) => void
}

export default function Toaster({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium min-w-64 max-w-sm animate-fade-in ${
            toast.type === 'success'
              ? 'bg-gray-800 border-green-500/40 text-white'
              : 'bg-gray-800 border-red-500/40 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={18} className="text-green-400 shrink-0" />
          ) : (
            <XCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
