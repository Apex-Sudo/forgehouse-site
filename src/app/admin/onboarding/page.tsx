"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminOnboardingPage() {
  const { data: session } = useSession();
  const [mentorName, setMentorName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedLink(null);

    try {
      const res = await fetch("/api/onboarding/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mentorName, email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate link");
      }

      const data = await res.json();
      setGeneratedLink(data.onboardingLink);
    } catch (err) {
      console.error("Error generating link:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Authentication Required</h2>
          <p className="text-[#737373]">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-[#E5E2DC] p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Generate Onboarding Link</h1>
            <p className="text-[#737373]">
              Create a unique onboarding link for a new mentor
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          {generatedLink ? (
            <div className="space-y-6">
              <div className="p-6 bg-green-100 rounded-lg">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">✅ Link Generated Successfully!</h2>
                <p className="text-[#737373] mb-4">
                  Share this link with {mentorName} to begin their onboarding process.
                </p>
                
                <div className="bg-white border border-[#E5E2DC] rounded-lg p-4 mb-4">
                  <p className="text-sm text-[#737373] break-all">{generatedLink}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => copyToClipboard(generatedLink)}
                    className="flex-1 bg-blue-500 border border-[#E5E2DC] px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedLink(null);
                      setMentorName("");
                      setEmail("");
                    }}
                    className="flex-1 border border-[#E5E2DC] text-[#1A1A1A] px-4 py-2 rounded-lg font-semibold hover:bg-[#F5F5F5] transition"
                  >
                    Generate Another
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-[#1A1A1A] mb-2">Next Steps:</h3>
                <ul className="list-disc pl-5 space-y-1 text-[#737373]">
                  <li>Send the link to the mentor via email</li>
                  <li>The link will expire in 7 days</li>
                  <li>Mentor progress will be saved automatically</li>
                  <li>You can track progress in the admin dashboard</li>
                </ul>
              </div>
            </div>
          ) : (
            <form onSubmit={generateLink} className="space-y-6">
              <div>
                <label htmlFor="mentorName" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Mentor Name
                </label>
                <input
                  type="text"
                  id="mentorName"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter mentor's full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Mentor Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter mentor's email address"
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-[#1A1A1A] mb-2">Onboarding Process</h3>
                <ul className="list-disc pl-5 space-y-1 text-[#737373] text-sm">
                  <li>Mentor completes expertise extraction (~1-2 hours)</li>
                  <li>Mentor calibrates their agent's voice and responses</li>
                  <li>System ingests all data to create knowledge base</li>
                  <li>Mentor agent becomes available for coaching</li>
                </ul>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isLoading ? "Generating Link..." : "Generate Onboarding Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
