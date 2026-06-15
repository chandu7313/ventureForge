"use client";

import * as React from "react";
import { WizardStepper } from "../../../components/features/WizardStepper";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function NewValidationPage() {
  const [step, setStep] = React.useState(1);
  const [idea, setIdea] = React.useState("");
  const router = useRouter();

  const validateMutation = useMutation({
    mutationFn: async (ideaData: string) => {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaData }),
      });
      if (!res.ok) throw new Error("Validation failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Idea validated successfully!");
      router.push(`/report/${data.id || 'demo-123'}`);
    },
    onError: () => {
      toast.error("Failed to validate idea. Please try again.");
      setStep(1);
    }
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    if (step === 3) {
      validateMutation.mutate(idea);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Validate New Idea</h1>
        <p className="text-muted-foreground">Describe your startup, target audience, and business model.</p>
      </div>

      <WizardStepper steps={["Basic Details", "Market Info", "Analyze"]} currentStep={step} />

      <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[300px] flex flex-col">
        {step === 1 && (
          <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Startup Name / Working Title</label>
              <input type="text" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Elevator Pitch (The Idea)</label>
              <textarea 
                rows={4}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none" 
                placeholder="Describe the problem you are solving and your solution..." 
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-4">
             <div>
              <label className="text-sm font-medium block mb-1.5">Target Audience</label>
              <input type="text" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" placeholder="e.g. B2B SaaS companies" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Monetization Strategy</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <option>SaaS Subscription</option>
                <option>Marketplace Commission</option>
                <option>E-commerce Direct</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
              <Loader2 className={cn("h-8 w-8 text-indigo-600 dark:text-indigo-400", validateMutation.isPending && "animate-spin")} />
            </div>
            <h3 className="text-lg font-bold mb-2">Ready to Analyze</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Our multi-agent system will now evaluate your market, predict risks, and build an MVP timeline. This costs 1 credit.
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t flex justify-between">
          <button
            disabled={step === 1 || validateMutation.isPending}
            onClick={() => setStep(step - 1)}
            className="rounded-md border border-input bg-background hover:bg-accent px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            Back
          </button>
          <button
            disabled={validateMutation.isPending}
            onClick={handleNext}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {validateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {step === 3 ? "Start Analysis" : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}
