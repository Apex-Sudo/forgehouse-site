"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { IconCircleCheck } from "@tabler/icons-react";

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
              <div className="p-6 bg-amber/10 rounded-lg border border-amber/20">
                <div className="flex items-start gap-3 mb-4">
                  <IconCircleCheck size={28} stroke={1.5} className="text-amber shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Link generated successfully</h2>
                    <p className="text-[#737373]">
                      Share this link with {mentorName} to begin their onboarding process.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E2DC] rounded-lg p-4 mb-4">
                  <p className="text-sm text-[#737373] break-all">{generatedLink}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => copyToClipboard(generatedLink)}
                    className="flex-1 bg-amber text-white border border-transparent px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
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

              <div className="p-4 bg-[#F5F3F0] rounded-lg border border-[#E5E2DC]">
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
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber"
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
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber"
                  placeholder="Enter mentor's email address"
                />
              </div>

              <div className="bg-[#F5F3F0] rounded-lg p-4 border border-[#E5E2DC]">
                <h3 className="font-bold text-[#1A1A1A] mb-2">Onboarding Process</h3>
                <ul className="list-disc pl-5 space-y-1 text-[#737373] text-sm">
                  <li>Mentor completes contribution (~1-2 hours)</li>
                  <li>Mentor calibrates their agent&apos;s voice and responses</li>
                  <li>System builds the knowledge base and goes live</li>
                  <li>Mentor agent becomes available for coaching</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-amber text-white hover:opacity-90"
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
