import { cn } from "~/lib/utils";
import * as React from "react";

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
          variant === "default" && "border-zinc-700 bg-zinc-800 text-zinc-100",
          variant === "destructive" && "border-red-600 bg-red-600 text-white",
          className
        )}
        {...props}
      />
    );
  }
);
Toast.displayName = "Toast";

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  return <>{children}</>;
};

interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const ToastTitle = React.forwardRef<HTMLHeadingElement, ToastTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn("text-sm font-semibold", className)}
        {...props}
      />
    );
  }
);
ToastTitle.displayName = "ToastTitle";

interface ToastDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  ToastDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  );
});
ToastDescription.displayName = "ToastDescription";

export interface UseToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastActionElement {
  toastActionProps: React.ComponentPropsWithoutRef<typeof ToastAction>;
}

interface ToastAction
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastAction = React.forwardRef<HTMLButtonElement, ToastAction>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-transparent px-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
ToastAction.displayName = "ToastAction";

// Create a simple toast hook
export function useToast() {
  const [toasts, setToasts] = React.useState<UseToastOptions[]>([]);

  const toast = (options: UseToastOptions) => {
    setToasts((prev) => [...prev, options]);
    // In a real implementation, we would auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== options));
    }, 5000);
  };

  return { toast, toasts };
}

export {
  Toast,
  ToastProvider,
  ToastTitle,
  ToastDescription,
  ToastAction,
}; 