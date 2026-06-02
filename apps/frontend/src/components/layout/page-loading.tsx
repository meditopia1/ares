'use client';

interface PageLoadingProps {
  message: string;
}

export function PageLoading({ message }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        <p className="text-sm text-slate-700">{message}</p>
      </div>
    </div>
  );
}

interface InlinePageLoadingProps {
  message: string;
  title?: string;
  description?: string;
}

export function InlinePageLoading({
  message,
  title,
  description,
}: InlinePageLoadingProps) {
  return (
    <div className="space-y-6">
      {(title || description) && (
        <div>
          {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
          {description && <p className="mt-1 text-gray-600">{description}</p>}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
