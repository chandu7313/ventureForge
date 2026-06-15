"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@startupsaarthi/ui";

export interface WizardStepperProps {
  steps: string[];
  currentStep: number;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="relative w-full mb-12">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full" />
      
      {/* Progress Line */}
      <motion.div
        className="absolute top-1/2 left-0 h-1 bg-indigo-600 dark:bg-indigo-500 -translate-y-1/2 rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />

      {/* Step Indicators */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step} className="flex flex-col items-center gap-3 z-10">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isCurrent ? "rgb(79 70 229)" : "rgb(255 255 255)",
                  borderColor: isCompleted || isCurrent ? "rgb(79 70 229)" : "rgb(203 213 225)",
                  color: isCompleted || isCurrent ? "rgb(255 255 255)" : "rgb(148 163 184)",
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold shadow-sm transition-colors dark:bg-slate-900 dark:border-slate-700"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
              </motion.div>
              <span
                className={cn(
                  "absolute top-14 text-sm font-medium whitespace-nowrap transition-colors",
                  isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
