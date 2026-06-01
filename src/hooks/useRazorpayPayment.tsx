"use client";

import { useState, useCallback, useRef } from "react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldAlert, Sparkles, Receipt, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

// Load Razorpay script dynamically on demand
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface PaymentParams {
  amount: number;
  format: string;
  templateId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  currency?: string;
  couponCode?: string;
  onDownload?: (orderId: string) => void | Promise<void>;
}

export function useRazorpayPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "securing" | "verifying" | "downloading" | "download_failed">("idle");
  const [sandboxOrder, setSandboxOrder] = useState<any | null>(null);
  const [paymentIdInfo, setPaymentIdInfo] = useState<string | null>(null);

  // Keep resolve/reject promises so we can trigger them from the sandbox UI
  const paymentPromiseRef = useRef<{
    resolve: (data: any) => void;
    reject: (err: Error) => void;
    onDownload?: (orderId: string) => void | Promise<void>;
  } | null>(null);

  const paymentSuccessOrVerifyingRef = useRef(false);

  const createOrderMutation = useMutation({
    mutationFn: async (data: PaymentParams) => {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to initiate transaction");
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create payment order");
      return json;
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Payment verification failed");
      }
      return res.json();
    }
  });

  const updateDownloadStatusMutation = useMutation({
    mutationFn: async (data: { orderId: string; downloadStatus: string }) => {
      const res = await fetch("/api/razorpay/update-download-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    }
  });

  const startPayment = useCallback((params: PaymentParams): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      paymentSuccessOrVerifyingRef.current = false;

      if (process.env.NEXT_PUBLIC_IS_DEV === "true") {
        toast.info("Dev Mode Active - Bypassing payment gateway");
        setPaymentStep("downloading");
        setIsProcessing(true);
        setPaymentIdInfo("dev_bypass");
        resolve({ success: true, isDevBypass: true });
        if (params.onDownload) {
          try {
            await params.onDownload("dev_bypass");
            setIsProcessing(false);
            setPaymentStep("idle");
            toast.success("Download started successfully!");
          } catch (dlErr) {
            console.error("Auto-download failed:", dlErr);
            setPaymentStep("download_failed");
          }
        } else {
          setIsProcessing(false);
          setPaymentStep("idle");
        }
        return;
      }

      setPaymentStep("securing");
      setIsProcessing(true);
      try {
        // 1. Create order on Next.js backend
        const data = await createOrderMutation.mutateAsync(params);

        // 1.5 Handle 100% free checkout from promo code
        if (data.isFreeOrder) {
          toast.success("Promo code applied! 100% discount unlocked.");
          setPaymentStep("downloading");
          setIsProcessing(true);
          setPaymentIdInfo(data.order?.id || "free_order");
          resolve(data);
          if (params.onDownload) {
            try {
              await params.onDownload(data.order?.id || "free_order");
              setIsProcessing(false);
              setPaymentStep("idle");
            } catch (dlErr) {
              console.error("Auto-download failed:", dlErr);
              setPaymentStep("download_failed");
            }
          } else {
            setIsProcessing(false);
            setPaymentStep("idle");
          }
          return;
        }

        // 2. Check if we got a sandbox test order back
        if (data.isSandbox) {
          setSandboxOrder({
            id: data.order.id,
            amount: data.order.amount / 100,
            format: params.format,
            templateId: params.templateId,
            customerName: params.customerName || "Customer",
            currency: params.currency || "INR",
          });

          paymentPromiseRef.current = { resolve, reject, onDownload: params.onDownload };
          setIsProcessing(false);
          setPaymentStep("idle");
          return;
        }

        // 3. Real Razorpay Mode: Load Script
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Razorpay checkout SDK failed to load. Please check your internet connection.");
        }

        // 4. Open Razorpay Widget
        const options = {
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "Biodata99",
          description: `Premium download for ${params.format.toUpperCase()} format`,
          image: "./logo.svg",
          order_id: data.order.id,
          method: {
            upi: true,        // GPay, PhonePe, Paytm, BHIM, etc.
            qr: true,         // UPI QR code scanner
            card: true,       // Debit / Credit cards
            netbanking: true, // Net banking
            wallet: true,     // Paytm wallet, Amazon Pay, etc.
          },
          handler: async function (response: any) {
            paymentSuccessOrVerifyingRef.current = true;
            setIsProcessing(true);
            setPaymentStep("verifying");
            let verifyData: any;
            try {
              // Verify payment on Next.js backend
              verifyData = await verifyPaymentMutation.mutateAsync({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_contact: response.razorpay_contact || null,
                razorpay_email: response.razorpay_email || null,
                isSandbox: false,
              });

              toast.success("Payment completed successfully!");
              setPaymentStep("downloading");
              setPaymentIdInfo(response.razorpay_payment_id || response.razorpay_order_id);
              resolve(verifyData);
            } catch (err: any) {
              toast.error(err.message || "Payment verification failed");
              reject(err);
              setIsProcessing(false);
              setPaymentStep("idle");
              return;
            }

            if (params.onDownload) {
              try {
                await params.onDownload(response.razorpay_order_id);
                setIsProcessing(false);
                setPaymentStep("idle");
                toast.success("Download started successfully!");
                updateDownloadStatusMutation.mutate(
                  { orderId: response.razorpay_order_id, downloadStatus: "success" },
                  { onError: (err) => console.error("Failed to update status:", err) }
                );
              } catch (dlErr: any) {
                console.error("Auto-download failed:", dlErr?.message || String(dlErr));
                setPaymentStep("download_failed");
                updateDownloadStatusMutation.mutate(
                  { orderId: response.razorpay_order_id, downloadStatus: "failed" },
                  { onError: (err) => console.error("Failed to update status:", err) }
                );
              }
            } else {
              setIsProcessing(false);
              setPaymentStep("idle");
            }
          },
          prefill: {
            name: params.customerName || "",
            email: params.customerEmail || "",
            contact: (params.customerPhone || "").replace(/\D/g, "").slice(-10),
          },
          theme: {
            color: "#9B1B30", // Royal Crimson brand color
          },
          modal: {
            ondismiss: function () {
              if (!paymentSuccessOrVerifyingRef.current) {
                setIsProcessing(false);
                setPaymentStep("idle");
                toast.info("Payment cancelled");
                reject(new Error("Payment cancelled by user"));
              }
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          toast.error(response.error.description || "Payment transaction failed");
          setIsProcessing(false);
          setPaymentStep("idle");
          reject(new Error(response.error.description));
        });

        setIsProcessing(false);
        setPaymentStep("idle");
        rzp.open();
      } catch (err: any) {
        console.error("Razorpay payment initialization error:", err);
        toast.error(err.message || "Failed to start payment process");
        setIsProcessing(false);
        setPaymentStep("idle");
        reject(err);
      }
    });
  }, []);

  // Sandbox simulation actions
  const handleSandboxSuccess = async () => {
    if (!sandboxOrder || !paymentPromiseRef.current) return;
    setIsProcessing(true);
    setPaymentStep("verifying");
    const orderId = sandboxOrder.id;
    const mockPaymentId = `mock_pay_${Date.now()}`;

    try {
      const verifyData = await verifyPaymentMutation.mutateAsync({
        razorpay_order_id: orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: "mock_signature",
        razorpay_contact: sandboxOrder.customerPhone || null,
        isSandbox: true,
      });

      toast.success("Sandbox simulated payment successful!");
      
      setPaymentStep("downloading");
      setPaymentIdInfo(mockPaymentId);
      paymentPromiseRef.current.resolve(verifyData);
      setSandboxOrder(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to process sandbox payment");
      paymentPromiseRef.current.reject(err);
      setIsProcessing(false);
      setPaymentStep("idle");
      return;
    }

    if (paymentPromiseRef.current.onDownload) {
      try {
        await paymentPromiseRef.current.onDownload("sandbox");
        setIsProcessing(false);
        setPaymentStep("idle");
        toast.success("Download started successfully!");
        updateDownloadStatusMutation.mutate(
          { orderId: "sandbox", downloadStatus: "success" },
          { onError: (err) => console.error("Failed to update status:", err) }
        );
      } catch (dlErr: any) {
        console.error("Auto-download failed:", dlErr?.message || String(dlErr));
        setPaymentStep("download_failed");
        updateDownloadStatusMutation.mutate(
          { orderId: "sandbox", downloadStatus: "failed" },
          { onError: (err) => console.error("Failed to update status:", err) }
        );
      }
    } else {
      setIsProcessing(false);
      setPaymentStep("idle");
    }
  };

  const handleSandboxFailure = () => {
    if (!sandboxOrder || !paymentPromiseRef.current) return;
    toast.error("Sandbox simulated payment failed / cancelled");
    paymentPromiseRef.current.reject(new Error("Payment failed in sandbox"));
    setSandboxOrder(null);
  };

  // The custom Sandbox Simulator Modal (using Radix-based Dialog)
  const SandboxModal = () => {
    if (!sandboxOrder) return null;

    return (
      <Dialog open={!!sandboxOrder} onOpenChange={(open) => {
        if (!open) handleSandboxFailure();
      }}>
        <DialogContent className="max-w-[95%] sm:max-w-md p-0 flex flex-col gap-0 border-0 bg-background/95 backdrop-blur-xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden ring-1 ring-border/50">

          {/* Shine Sweep Header */}
          <div className="bg-gradient-primary py-5 px-6 text-white relative select-none flex items-center gap-4 border-b border-primary/20 shrink-0 overflow-hidden shadow-sm">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 h-full animate-shine pointer-events-none z-0" />
            <div className="w-11 h-11 bg-amber-500/20 rounded-full flex items-center justify-center backdrop-blur-md shrink-0 border border-amber-500/30">
              <ShieldAlert className="w-5.5 h-5.5 text-amber-400" />
            </div>
            <div className="text-left flex-1 min-w-0 z-10">
              <DialogTitle className="text-lg sm:text-xl font-black tracking-wide text-white leading-tight drop-shadow-sm flex items-center gap-1.5">
                Razorpay Sandbox <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold uppercase border border-amber-500/30 px-2 py-0.5 rounded-md">Simulated</span>
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-white/95 mt-1 font-semibold leading-tight">
                No active API keys found. Testing gateway transactions.
              </DialogDescription>
            </div>
          </div>

          {/* Sandbox Body Content */}
          <div className="p-5 sm:p-6 flex flex-col gap-5">
            {/* Alert Banner */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-left shadow-inner">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col">
                <span className="text-[11px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wide">Developer Sandbox Active</span>
                <span className="text-[10.5px] text-muted-foreground font-semibold leading-relaxed mt-0.5">
                  The system detected placeholder keys. You can fully test the purchase experience, database logging, and download logic using this simulator.
                </span>
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="border border-border/80 bg-card rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black uppercase text-muted-foreground tracking-wide">Order Receipt</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/80 font-mono">{sandboxOrder.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 text-left">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Template Theme</span>
                  <span className="text-xs font-bold text-foreground capitalize mt-0.5">{sandboxOrder.templateId}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Download Format</span>
                  <span className="text-xs font-black text-primary capitalize mt-0.5">{sandboxOrder.format.toUpperCase()}</span>
                </div>
                <div className="flex flex-col mt-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Total Amount</span>
                  <span className="text-base font-black text-foreground mt-0.5">₹{sandboxOrder.amount}.00</span>
                </div>
                <div className="flex flex-col text-right mt-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Customer Name</span>
                  <span className="text-xs font-semibold text-muted-foreground truncate max-w-[150px] mt-0.5">{sandboxOrder.customerName}</span>
                </div>
              </div>
            </div>

            {/* Simulated UPI & Card visual details */}
            <div className="flex items-center justify-between px-3 py-2 border border-border/40 bg-card/40 rounded-xl">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10.5px] font-bold text-muted-foreground">Pre-filled Test Payment Method</span>
              </div>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 fill-emerald-600" /> UPI / Cards Supported
              </span>
            </div>

            {/* Sandbox Operations Action Grid */}
            <div className="flex flex-col gap-3 mt-1">
              <Button
                onClick={handleSandboxSuccess}
                disabled={isProcessing}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all border-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-[0.98]"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                Simulate Successful Payment
              </Button>

              <Button
                onClick={handleSandboxFailure}
                disabled={isProcessing}
                variant="outline"
                className="w-full py-5 rounded-2xl border border-rose-200 hover:bg-rose-50/50 text-rose-600 hover:text-rose-700 font-bold tracking-wide transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <X className="w-4 h-4" />
                Simulate Cancel / Transaction Failure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return {
    isProcessing,
    paymentStep,
    paymentIdInfo,
    setPaymentStep,
    setIsProcessing,
    startPayment,
    SandboxModal,
  };
}
