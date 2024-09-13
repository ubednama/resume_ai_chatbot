import { forwardRef } from "react";

const ScrollArea = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

ScrollArea.displayName = "ScrollArea";

export default ScrollArea;
