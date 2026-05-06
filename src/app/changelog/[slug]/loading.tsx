export default function Loading() {
  const sk = "bg-gray-200 animate-pulse rounded";

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link + share row */}
        <div className="flex items-center justify-between mb-6">
          <div className={`h-4 ${sk} w-24`} />
          <div className="flex sm:hidden items-center gap-2">
            <div className={`h-4 ${sk} w-10`} />
            <div className={`h-7 ${sk} w-7`} />
            <div className={`h-7 ${sk} w-7`} />
            <div className={`h-7 ${sk} w-7`} />
            <div className={`h-7 ${sk} w-7`} />
          </div>
        </div>

        {/* Title */}
        <div className={`h-9 ${sk} w-3/4 mb-2`} />
        <div className={`h-9 ${sk} w-1/2 mb-4`} />

        {/* Metadata strip */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200 mb-6">
          <div className={`h-4 ${sk} w-24`} />
          <div className={`h-4 ${sk} w-20`} />
          <div className={`ml-auto h-8 ${sk} w-32`} />
        </div>

        {/* Body content */}
        <div className="space-y-3">
          <div className={`h-4 ${sk} w-full`} />
          <div className={`h-4 ${sk} w-full`} />
          <div className={`h-4 ${sk} w-5/6`} />
          <div className={`h-4 ${sk} w-full`} />
          <div className={`h-4 ${sk} w-4/6`} />
        </div>
      </div>
    </div>
  );
}
