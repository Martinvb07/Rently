export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="bg-gray-200" style={{ aspectRatio: '16/11' }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3.5 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-3.5 bg-gray-100 rounded-lg w-1/3" />
        <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <div className="h-6 bg-gray-200 rounded-lg w-2/5" />
          <div className="h-10 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="flex gap-5 bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="w-52 flex-none bg-gray-200" />
      <div className="flex-1 py-5 pr-5 flex flex-col gap-3">
        <div className="h-6 bg-gray-200 rounded-lg w-2/3" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded-lg w-4/5 mt-1" />
        <div className="h-px bg-gray-100 mt-auto" />
        <div className="flex justify-between">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-100 rounded-lg w-20" />
            <div className="h-4 bg-gray-100 rounded-lg w-16" />
          </div>
          <div className="h-6 bg-gray-200 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}
