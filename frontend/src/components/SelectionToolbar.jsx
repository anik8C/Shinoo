import { ArrowLeft, Trash2 } from "lucide-react";

function SelectionToolbar({ count, canDelete, isDeleting, onDelete, onCancel }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-700/50 bg-slate-800/50 px-3 py-3 text-slate-200 sm:px-6">
      <button type="button" onClick={onCancel} className="rounded-lg p-2 hover:bg-slate-700/50" aria-label="Cancel selection">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <span className="font-medium">{count}</span>
      <div className="ml-auto flex items-center gap-1">
        {canDelete && (
          <button type="button" onClick={onDelete} disabled={isDeleting} className="rounded-lg p-2 hover:bg-slate-700/50 disabled:opacity-50" aria-label="Delete messages">
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SelectionToolbar;