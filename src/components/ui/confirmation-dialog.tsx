import * as React from "react";
import { AlertTriangle, Trash2, LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "danger" | "warning" | "info";
  icon?: LucideIcon;
}

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "danger",
  icon: CustomIcon
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          bar: "bg-amber-500",
          iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
          button: "bg-amber-600 hover:bg-amber-500 text-white border-none shadow-sm"
        };
      case "info":
        return {
          bar: "bg-blue-500",
          iconBg: "bg-blue-500/10 border-blue-500/20 text-blue-500",
          button: "bg-blue-600 hover:bg-blue-500 text-white border-none shadow-sm"
        };
      case "danger":
      default:
        return {
          bar: "bg-rose-500",
          iconBg: "bg-rose-500/10 border-rose-500/20 text-rose-500",
          button: "bg-rose-600 hover:bg-rose-500 text-white border-none shadow-sm"
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = CustomIcon || AlertTriangle;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 relative overflow-hidden">
        {/* Subtle top indicator bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.bar}`} />
        
        <div className="flex items-start gap-4 mt-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${styles.iconBg}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          
          <div className="flex-1 space-y-1.5 text-left">
            <DialogTitle className="text-base font-extrabold text-foreground tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed font-sans">
              {description}
            </DialogDescription>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/60">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-9 px-4 text-xs font-bold cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`font-bold text-xs px-5 h-9 cursor-pointer flex items-center gap-1.5 ${styles.button}`}
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : variant === "danger" ? (
              <Trash2 className="w-3.5 h-3.5" />
            ) : null}
            <span>{isLoading ? "Processing..." : confirmText}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
