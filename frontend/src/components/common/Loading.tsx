interface FullScreenLoaderProps {
  message?: string;
}

export default function Loading({
  message = "Loading...",
}: FullScreenLoaderProps) {
  return (
    <div className=" h-screen overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}
