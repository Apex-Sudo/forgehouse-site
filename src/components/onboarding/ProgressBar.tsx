import React from "react";

interface ProgressBarProps {
  currentPhase: "extraction" | "calibration" | "ingestion";
  onPhaseChange: (phase: "extraction" | "calibration" | "ingestion") => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentPhase, onPhaseChange }) => {
  const phases = [
    { id: "extraction", label: "Extraction", icon: "🔧" },
    { id: "calibration", label: "Calibration", icon: "⚖️" },
    { id: "ingestion", label: "Ingestion", icon: "📚" }
  ] as const;

  const phaseLabels = {
    extraction: "Extract your expertise",
    calibration: "Calibrate your voice",
    ingestion: "Review & confirm"
  };

  const getPhaseStatus = (phaseId: string) => {
    const phaseOrder = ["extraction", "calibration", "ingestion"];
    const currentPhaseIndex = phaseOrder.indexOf(currentPhase);
    const phaseIndex = phaseOrder.indexOf(phaseId);
    
    if (phaseIndex < currentPhaseIndex) return "completed";
    if (phaseIndex === currentPhaseIndex) return "active";
    return "pending";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {phases.map((phase) => {
          const status = getPhaseStatus(phase.id);
          return (
            <div 
              key={phase.id}
              className={`flex flex-col items-center flex-1 ${
                status === "completed" ? "cursor-pointer" : ""
              }`}
              onClick={() => status === "completed" && onPhaseChange(phase.id as any)}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${status === "completed" ? "bg-green-500 text-white" : ""}
                ${status === "active" ? "bg-amber text-white" : ""}
                ${status === "pending" ? "bg-[#F5F5F5] text-[#999]" : ""}
              `}>
                {status === "completed" ? "✓" : phase.icon}
              </div>
              <span className={`
                text-xs font-medium text-center
                ${status === "active" ? "text-amber" : ""}
                ${status === "pending" ? "text-[#999]" : ""}
              `}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="relative pt-4">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#F5F5F5] rounded-full"></div>
        <div 
          className="absolute top-0 left-0 h-1 bg-amber rounded-full transition-all duration-500"
          style={{
            width: currentPhase === "extraction" ? "0%" : 
                   currentPhase === "calibration" ? "50%" : "100%"
          }}
        ></div>
      </div>
      
      <div className="mt-6 text-center">
        <h3 className="font-bold text-[#1A1A1A]">
          {phaseLabels[currentPhase]}
        </h3>
        <p className="text-sm text-[#737373] mt-1">
          {currentPhase === "extraction" && "Capture your expertise and methodologies"}
          {currentPhase === "calibration" && "Refine how your agent communicates"}
          {currentPhase === "ingestion" && "Review and confirm your knowledge base"}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
