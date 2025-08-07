import { type LoadSpinnerProps } from "@/app/utils/types";

export function LoadSpinner({ size = "medium" }: LoadSpinnerProps) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8", 
    large: "h-12 w-12",
  };
  
  const borderClasses = {
    small: "border-2",
    medium: "border-3",
    large: "border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full border-blue-200 border-t-blue-600 ${sizeClasses[size]} ${borderClasses[size]}`}
      ></div>
    </div>
  );
}