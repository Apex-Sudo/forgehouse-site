import { useState, useEffect } from "react";

interface OnboardingSession {
  id: string;
  mentorName: string;
  email: string;
  currentPhase: "extraction" | "calibration" | "ingestion";
  extractionData: any;
  calibrationData: any;
  ingestionData: any;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

interface IngestionPhaseProps {
  session: OnboardingSession;
  onUpdate: (updates: Partial<OnboardingSession>) => Promise<void>;
  onAdvance: () => void;
}

export default function IngestionPhase({ session, onUpdate, onAdvance }: IngestionPhaseProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize ingestion data if not present
  useEffect(() => {
    if (!session.ingestionData) {
      onUpdate({
        ingestionData: {
          status: "pending",
          progress: 0,
          startedAt: new Date().toISOString()
        }
      });
    }
  }, [session.ingestionData, onUpdate]);

  const startIngestion = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Simulate ingestion process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress(i);
        
        // Update session progress
        await onUpdate({
          ingestionData: {
            ...session.ingestionData,
            progress: i,
            status: i < 100 ? "processing" : "complete",
            updatedAt: new Date().toISOString()
          }
        });
      }
      
      setIsComplete(true);
      
      // Mark session as complete
      await onUpdate({
        currentPhase: "complete"
      });
    } catch (error) {
      console.error("Ingestion error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusMessage = () => {
    if (isComplete) return "Knowledge base successfully created!";
    if (isProcessing) return "Creating your personalized knowledge base...";
    return "Review and confirm your knowledge base";
  };

  const getStatusDescription = () => {
    if (isComplete) return "Your mentor agent is now ready to coach.";
    if (isProcessing) return "Processing your expertise and building intelligent responses...";
    return "We're preparing to create your personalized knowledge base from the information gathered in the previous steps.";
  };

  return (
    <div className="flex flex-col min-h-[60vh] bg-[#FAFAF8]">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-xl border border-[#E5E2DC] p-8 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📚</span>
            </div>
            
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              {getStatusMessage()}
            </h2>
            
            <p className="text-[#737373] mb-8">
              {getStatusDescription()}
            </p>
            
            {!isComplete && !isProcessing && (
              <div className="mb-8 p-6 bg-blue-50 rounded-xl">
                <h3 className="font-bold text-[#1A1A1A] mb-3">What we'll include:</h3>
                <ul className="text-left space-y-2 text-[#737373]">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Your professional background and expertise areas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Your unique methodologies and frameworks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Your coaching philosophy and communication style</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Real-world examples and case studies</span>
                  </li>
                </ul>
              </div>
            )}
            
            {isProcessing && (
              <div className="mb-8">
                <div className="w-full bg-[#F5F5F5] rounded-full h-3 mb-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-[#999]">{progress}% complete</p>
              </div>
            )}
            
            {isComplete ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-100 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✅ Your mentor agent has been successfully created!
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Redirect to mentor dashboard or next step
                    window.location.href = "/mentors";
                  }}
                  className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
                >
                  View Your Mentor Agent
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={startIngestion}
                  disabled={isProcessing}
                  className={`px-8 py-3 rounded-xl font-semibold transition ${
                    isProcessing 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isProcessing ? "Processing..." : "Create Knowledge Base"}
                </button>
                
                {!isProcessing && (
                  <button
                    onClick={() => onUpdate({ currentPhase: "calibration" })}
                    className="border border-[#E5E2DC] text-[#1A1A1A] px-8 py-3 rounded-xl font-semibold hover:bg-[#F5F5F5] transition"
                  >
                    Back to Calibration
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="px-6 py-4 border-t border-[#E5E2DC] bg-white">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button
            onClick={() => onUpdate({ currentPhase: "calibration" })}
            className="text-[#999] hover:text-[#1A1A1A] border border-[#E5E2DC] px-4 py-2 rounded-lg transition"
          >
            ← Back to Calibration
          </button>
          {isComplete && (
            <button
              onClick={() => {
                // Redirect to mentor dashboard or next step
                window.location.href = "/mentors";
              }}
              className="bg-amber text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              View Your Mentor Agent →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
