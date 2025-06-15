"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Award,
  Calendar,
  CalendarDays,
  Lightbulb,
  Shield,
  Users,
} from "lucide-react"

interface AssessmentGuidelinesProps {
  onAccept: () => void
}

export default function AssessmentGuidelines({ onAccept }: AssessmentGuidelinesProps) {
  const [startText, setStartText] = useState("")
  const [openSections, setOpenSections] = useState({
    keyInstructions: true,
    timelines: false,
    marking: false,
    proctoring: false,
    otherInstructions: true,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }))
  }

  const handleStart = async () => {
    if (startText.toLowerCase() === "start") {
      // Enter fullscreen IMMEDIATELY when "start" is typed
      try {
        await document.documentElement.requestFullscreen()
      } catch (error) {
        console.error("Fullscreen failed:", error)
      }

      // Start exam immediately with no delays
      onAccept()
    }
  }

  // Mock assessment data
  const assessmentData = {
    title: "Assessment for opportunity",
    duration: "30 Minutes",
    questions: "10",
    marks: "10",
    startDate: "16 Jun 25, 10:19 PM IST",
    endDate: "15 Jul 25, 10:29 PM IST",
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d]">
      <div className="flex">
        {/* Left Panel */}
        <div className="w-1/2 p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold text-white">Skillment</span>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Badge className="bg-[#ff4d00]/20 text-[#ff4d00] border-[#ff4d00]/30 hover:bg-[#ff4d00]/20">
                <FileText className="w-3 h-3 mr-1" />
                Assessment
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-white mb-6">{assessmentData.title}</h1>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Duration</span>
                <span className="font-semibold text-white">{assessmentData.duration}</span>
              </div>

              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Questions</span>
                <span className="font-semibold text-white">{assessmentData.questions}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Marks</span>
                <span className="font-semibold text-white">{assessmentData.marks}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">Start Date</span>
                <span className="font-semibold text-white">{assessmentData.startDate}</span>
              </div>

              <div className="flex items-center space-x-3">
                <CalendarDays className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">End Date</span>
                <span className="font-semibold text-white">{assessmentData.endDate}</span>
              </div>
            </div>

            <div className="bg-[#1a1d21] p-6 rounded-lg border border-[#2a2d31]">
              <h2 className="text-xl font-semibold text-white mb-4">Hello,</h2>
              <p className="text-gray-300 mb-4">
                We are delighted to welcome you to this assessment process. This assessment is designed to test the
                necessary skills and knowledge that would help us make an informed decision regarding your application
                further.
              </p>
              <p className="text-gray-300 mb-4">
                Before you start the assessment, kindly go through all the instructions and guidelines carefully. If you
                encounter any technical issues or have questions, please contact our support team.
              </p>
              <p className="text-gray-300">
                We appreciate your time and effort in completing this assessment. Good Luck!
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Guidelines */}
        <div className="w-1/2 bg-[#1a1d21] p-8 border-l border-[#2a2d31]">
          <div className="flex items-center space-x-2 mb-6">
            <Lightbulb className="w-5 h-5 text-[#ff4d00]" />
            <h2 className="text-xl font-semibold text-white">Guidelines</h2>
          </div>

          <div className="space-y-4">
            {/* Key Instructions */}
            <Collapsible open={openSections.keyInstructions}>
              <CollapsibleTrigger
                onClick={() => toggleSection("keyInstructions")}
                className="flex items-center justify-between w-full p-4 bg-[#2a2d31] rounded-lg hover:bg-[#3a3d41] transition-colors"
              >
                <span className="font-medium text-white">Key Instructions</span>
                {openSections.keyInstructions ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 bg-[#0f1114] border border-[#2a2d31] rounded-b-lg">
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    • You have to <strong className="text-white">submit answers/code/solutions</strong> to all the
                    questions individually. Otherwise your response will NOT be recorded.
                  </li>
                  <li>
                    • While you are taking the assessment, your answers/code/solutions and time of their submission are
                    also tracked by the system question-wise.
                  </li>
                  <li>
                    • You will have to finish the assessment on or before{" "}
                    <strong className="text-white">25 Jun 25, 10:19 PM IST</strong>. To get the complete assessment
                    duration, you need to start the assessment latest by{" "}
                    <strong className="text-white">16 Jun 25, 10:19 PM IST</strong>. Otherwise, you'll get less time to
                    complete the assessment.
                  </li>
                  <li>
                    • You won't be able to modify your answers during the assessment. Once you have given your answer,
                    it is saved and cannot be changed.
                  </li>
                  <li>
                    • Any participant resorting to unfair practices will be directly disqualified from the challenge.
                  </li>
                  <li>
                    • All decisions in the matter of eligibility, authenticity & final judgement will be with Skillment
                    and the opportunity organizer.
                  </li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            {/* Timelines & Questions */}
            <Collapsible open={openSections.timelines}>
              <CollapsibleTrigger
                onClick={() => toggleSection("timelines")}
                className="flex items-center justify-between w-full p-4 bg-[#2a2d31] rounded-lg hover:bg-[#3a3d41] transition-colors"
              >
                <span className="font-medium text-white">Timelines & Questions</span>
                {openSections.timelines ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 bg-[#0f1114] border border-[#2a2d31] rounded-b-lg">
                <div className="text-sm text-gray-300">
                  <p>Assessment contains 10 questions to be completed in 30 minutes.</p>
                  <p>Each question carries equal weightage.</p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Marking */}
            <Collapsible open={openSections.marking}>
              <CollapsibleTrigger
                onClick={() => toggleSection("marking")}
                className="flex items-center justify-between w-full p-4 bg-[#2a2d31] rounded-lg hover:bg-[#3a3d41] transition-colors"
              >
                <span className="font-medium text-white">Marking</span>
                {openSections.marking ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 bg-[#0f1114] border border-[#2a2d31] rounded-b-lg">
                <div className="text-sm text-gray-300">
                  <p>Each correct answer: +1 mark</p>
                  <p>No negative marking for incorrect answers</p>
                  <p>Total marks: 10</p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Proctoring Guidelines */}
            <Collapsible open={openSections.proctoring}>
              <CollapsibleTrigger
                onClick={() => toggleSection("proctoring")}
                className="flex items-center justify-between w-full p-4 bg-[#2a2d31] rounded-lg hover:bg-[#3a3d41] transition-colors"
              >
                <span className="font-medium text-white">Proctoring Guidelines</span>
                {openSections.proctoring ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 bg-[#0f1114] border border-[#2a2d31] rounded-b-lg">
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    • <Shield className="w-4 h-4 inline mr-1 text-[#ff4d00]" />
                    AI-powered proctoring is enabled
                  </li>
                  <li>• Camera and microphone will be monitored throughout</li>
                  <li>• Tab switching is not allowed</li>
                  <li>• Copy-paste functions are disabled</li>
                  <li>• Any suspicious activity will be flagged</li>
                  <li>• Multiple violations may result in auto-submission</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            {/* Other Instructions */}
            <Collapsible open={openSections.otherInstructions}>
              <CollapsibleTrigger
                onClick={() => toggleSection("otherInstructions")}
                className="flex items-center justify-between w-full p-4 bg-[#2a2d31] rounded-lg hover:bg-[#3a3d41] transition-colors"
              >
                <span className="font-medium text-white">Other Instructions From The Organizers</span>
                {openSections.otherInstructions ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 bg-[#0f1114] border border-[#2a2d31] rounded-b-lg">
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    • <Users className="w-4 h-4 inline mr-1 text-[#ff4d00]" />
                    All registered Candidates can play this Assessment.
                  </li>
                  <li>
                    • All decisions in the matter of eligibility, authenticity & final judgement will be with Skillment
                    and the organizer.
                  </li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Start Section */}
          <div className="mt-8 p-6 bg-[#ff4d00]/10 border border-[#ff4d00]/30 rounded-lg">
            <p className="text-sm text-gray-300 mb-4">
              Type <strong className="text-[#ff4d00]">"start"</strong> and click start button to play
            </p>

            <div className="flex space-x-3">
              <Input
                value={startText}
                onChange={(e) => setStartText(e.target.value)}
                placeholder="start"
                className="flex-1 bg-[#2a2d31] border-[#3a3d41] text-white placeholder:text-gray-500 focus:border-[#ff4d00] focus:ring-[#ff4d00]"
              />
              <Button
                onClick={handleStart}
                disabled={startText.toLowerCase() !== "start"}
                className="px-8 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
