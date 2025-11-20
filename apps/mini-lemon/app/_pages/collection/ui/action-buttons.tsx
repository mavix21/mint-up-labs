"use client";

import type React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@mint-up/ui/components/button";
import { cn } from "@mint-up/ui/lib/utils";

interface ActionButtonsProps {
  className?: string;
}

export function ActionButtons({ className }: ActionButtonsProps) {
  return (
    <div className={cn("flex gap-4", className)}>
      <ActionButton
        icon={<ArrowDown className="h-6 w-6" />}
        label="Deposit"
        onClick={() => console.log("Deposit clicked")}
      />
      <ActionButton
        icon={<ArrowUp className="h-6 w-6" />}
        label="Withdraw"
        onClick={() => console.log("Withdraw clicked")}
      />
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="secondary"
        size="icon"
        className="bg-secondary/50 hover:bg-secondary h-14 w-14 rounded-2xl transition-colors"
        onClick={onClick}
      >
        {icon}
      </Button>
      <span className="text-primary text-xs font-medium">{label}</span>
    </div>
  );
}
