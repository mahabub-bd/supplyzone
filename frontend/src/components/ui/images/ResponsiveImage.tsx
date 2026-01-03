import { useState } from "react";

interface ResponsiveImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ResponsiveImage({
  src,
  alt = "Image",
  className = "",
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-full w-full"></div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain border border-gray-200 rounded-sm dark:border-gray-800 transition-opacity duration-300 ${
          isLoading ? "opacity-0 absolute" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </div>
  );
}
