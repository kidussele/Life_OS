"use client";

import { useState } from "react";
import { AlertTriangle, Clock, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface SleepWarningBannerProps {
  sleepHours?: number;
  wakeTime?: string;
  bedTime?: string;
  onDismiss?: () => void;
}

export function SleepWarningBanner({
  sleepHours = 6.0,
  wakeTime = "04:00",
  bedTime = "22:00",
  onDismiss,
}: SleepWarningBannerProps) {
  const [closed, setClosed] = useState(false);

  if (closed || sleepHours >= 7.0) return null;

  return (
    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5 sm:p-4 mb-5 text-[#92400E] shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-1.5 bg-[#FEF3C7] rounded-lg text-[#B45309] flex-shrink-0 mt-0.5">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-[14px] font-semibold text-[#78350F]">
                Sleep Duration Advisory ({sleepHours} hrs / night)
              </h4>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded-md">
                Insufficient Recovery
              </span>
            </div>
            <p className="text-[13px] text-[#92400E] mt-1 leading-relaxed">
              Your fixed preferences set bedtime at <span className="font-semibold">{bedTime}</span> and wake-up at{" "}
              <span className="font-semibold">{wakeTime}</span>, resulting in exactly <span className="font-semibold">{sleepHours} hours</span> of sleep. 
              Chronic sub-7h sleep impairs cognitive endurance, emotional stability in trading, and software engineering precision.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="text-[#78350F] font-medium">Recommended:</span>
              <span className="px-2 py-0.5 bg-[#FEF3C7] rounded border border-[#FDE68A] text-[#92400E]">
                Shift bed to 21:00 (7.0h)
              </span>
              <span className="px-2 py-0.5 bg-[#FEF3C7] rounded border border-[#FDE68A] text-[#92400E]">
                Or adjust wake to 05:00 (7.0h)
              </span>
              <Link
                href="/settings#schedule"
                className="inline-flex items-center font-semibold text-[#B45309] hover:text-[#78350F] underline ml-2"
              >
                Customize in Settings <ArrowRight size={13} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setClosed(true);
            if (onDismiss) onDismiss();
          }}
          className="text-[#B45309] hover:text-[#78350F] p-1 rounded-md"
          title="Dismiss warning for this session"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
