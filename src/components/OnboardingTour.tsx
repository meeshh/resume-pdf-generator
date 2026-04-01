import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

interface Step {
  target: string;
  title: string;
  content: string;
  position: "bottom" | "top" | "left" | "right";
}

const steps: Step[] = [
  {
    target: "tour-ai",
    title: "Magic AI Builder",
    content:
      "THE HIGHLIGHT: Don't waste time typing! Use our Magic AI button to turn your existing resume or LinkedIn profile into a professional format in seconds using ChatGPT or Gemini.",
    position: "bottom",
  },
  {
    target: "tour-editor",
    title: "Visual Form Editor",
    content:
      "Use this user-friendly form to edit your details. You can drag and drop items to reorder them, and everything syncs instantly with the preview.",
    position: "right",
  },
  {
    target: "tour-mode-toggle",
    title: "Switch to Code",
    content:
      "Prefer working with JSON? Toggle between the Visual Form and the raw Source Code at any time. Both views stay in perfect sync.",
    position: "bottom",
  },
  {
    target: "tour-templates",
    title: "Choose Your Look",
    content:
      "Click these to instantly change how your resume looks. We have styles for every industry—from creative to corporate.",
    position: "bottom",
  },
  {
    target: "tour-preview",
    title: "Preview & Print",
    content:
      "See exactly what your resume will look like. Use the toolbar at the top of the page to download your finished PDF or MS Word file.",
    position: "left",
  },
];

const OnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const updateCoords = useCallback(() => {
    const element = document.querySelector(
      `[data-tour="${steps[currentStep].target}"]`,
    );
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [currentStep]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("resumint-tour-v2");
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("resize", updateCoords);
      return () => window.removeEventListener("resize", updateCoords);
    }
  }, [isOpen, updateCoords]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem("resumint-tour-v2", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  // Tooltip positioning logic
  const getTooltipStyle = () => {
    const gap = 12;
    const tooltipWidth = 320;
    const windowMargin = 12;

    switch (step.position) {
      case "bottom": {
        // Try to center, but cap to screen edges
        let left = coords.left + coords.width / 2 - tooltipWidth / 2;
        // If near left edge (like the mode-toggle tabs), align with target's left
        if (left < windowMargin) left = coords.left;
        // Ensure it doesn't go past right edge
        left = Math.min(
          left,
          window.innerWidth - tooltipWidth - windowMargin,
        );
        // Ensure it doesn't go past left edge
        left = Math.max(left, windowMargin);

        return {
          top: coords.top + coords.height + gap,
          left,
        };
      }
      case "top": {
        let left = coords.left + coords.width / 2 - tooltipWidth / 2;
        left = Math.max(
          windowMargin,
          Math.min(left, window.innerWidth - tooltipWidth - windowMargin),
        );
        return {
          top: coords.top - 200 - gap,
          left,
        };
      }
      case "right":
        return {
          top: coords.top + coords.height / 2 - 100,
          left: coords.left + coords.width + gap,
        };
      case "left":
        return {
          top: coords.top + coords.height / 2 - 100,
          left: coords.left - tooltipWidth - gap,
        };
      default:
        return { top: 0, left: 0 };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop Overlay with Spotlight */}
      <div
        className="absolute inset-0 bg-black/60 pointer-events-auto transition-all duration-500"
        style={{
          clipPath: `polygon(
						 0% 0%, 0% 100%, 
						 ${coords.left}px 100%, 
						 ${coords.left}px ${coords.top}px, 
						 ${coords.left + coords.width}px ${coords.top}px, 
						 ${coords.left + coords.width}px ${coords.top + coords.height}px, 
						 ${coords.left}px ${coords.top + coords.height}px, 
						 ${coords.left}px 100%, 
						 100% 100%, 100% 0%
					 )`,
        }}
      />

      {/* Spotlight highlight border */}
      <div
        className="absolute border-2 border-blue-400 rounded-lg shadow-[0_0_30px_rgba(96,165,250,0.5)] transition-all duration-300 pointer-events-none"
        style={{
          top: coords.top - 4,
          left: coords.left - 4,
          width: coords.width + 8,
          height: coords.height + 8,
        }}
      />

      {/* Tooltip Card */}
      <div
        className="absolute w-[320px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 pointer-events-auto transition-all duration-300"
        style={getTooltipStyle()}
      >
        <button
          type="button"
          onClick={completeTour}
          className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-blue-500/20 rounded-lg">
            <Sparkles size={16} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight uppercase italic">
            {step.title}
          </h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {step.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className={`h-1 rounded-full transition-all ${
                  i === currentStep ? "w-4 bg-blue-500" : "w-1 bg-slate-600"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  GET STARTED <CheckCircle2 size={14} />
                </>
              ) : (
                <>
                  NEXT <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
