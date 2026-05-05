import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  title: string;
  itemName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({ title, itemName, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-red-500/30 p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-red-500" />
          </div>

          <h3 className="text-xl font-display text-white mb-2">{title}</h3>
          <p className="text-text-muted text-sm mb-1">
            Are you sure you want to permanently delete:
          </p>
          <p className="text-gold font-display text-lg mb-6">"{itemName}"</p>
          <p className="text-red-400/70 text-[10px] uppercase tracking-widest mb-8">
            This action cannot be undone
          </p>

          <div className="flex gap-4 w-full">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 text-xs uppercase tracking-widest text-text-muted hover:text-white border border-border/50 hover:border-border transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3 text-xs uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-red-400/20 border-t-red-400 rounded-full animate-spin" />
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
