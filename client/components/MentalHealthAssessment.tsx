import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Phone,
  MessageCircle,
  Heart,
  Shield,
} from "lucide-react";
import assessmentData from "@/data/mentalHealthAssessment.json";

interface AssessmentResponse {
  questionId: string;
  value: number;
  timestamp: number;
}

interface AssessmentResults {
  gadScore: number;
  phqScore: number;
  gadLevel: string;
  phqLevel: string;
  confidenceScore: number;
  riskLevel: "low" | "moderate" | "high";
  recommendations: string[];
  completedAt: string;
  isPartial?: boolean;
  answeredQuestions?: number;
  totalQuestions?: number;
}

interface MentalHealthAssessmentProps {
  onComplete?: (results: AssessmentResults) => void;
  onClose?: () => void;
}

export default function MentalHealthAssessment({
  onComplete,
  onClose,
}: MentalHealthAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const questions = assessmentData.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleResponse = (value: number) => {
    const response: AssessmentResponse = {
      questionId: currentQuestion.id,
      value,
      timestamp: Date.now() - questionStartTime,
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults(newResponses);
    }
  };

  const calculatePartialResults = (allResponses: AssessmentResponse[], isPartial: boolean = false) => {
    // Calculate GAD-7 score (partial or complete)
    const gadResponses = allResponses.filter((r) =>
      r.questionId.startsWith("GAD")
    );
    const gadTotalQuestions = 7;
    const gadAnsweredQuestions = gadResponses.length;
    const gadRawScore = gadResponses.reduce((sum, r) => sum + r.value, 0);
    
    // Extrapolate GAD score if partial
    const gadScore = isPartial && gadAnsweredQuestions > 0 
      ? Math.round((gadRawScore / gadAnsweredQuestions) * gadTotalQuestions)
      : gadRawScore;

    // Calculate PHQ-9 score (partial or complete)
    const phqResponses = allResponses.filter((r) =>
      r.questionId.startsWith("PHQ")
    );
    const phqTotalQuestions = 9;
    const phqAnsweredQuestions = phqResponses.length;
    const phqRawScore = phqResponses.reduce((sum, r) => sum + r.value, 0);
    
    // Extrapolate PHQ score if partial
    const phqScore = isPartial && phqAnsweredQuestions > 0
      ? Math.round((phqRawScore / phqAnsweredQuestions) * phqTotalQuestions)
      : phqRawScore;

    // Determine levels
    const gadLevel = getScoreLevel(gadScore, "GAD-7");
    const phqLevel = getScoreLevel(phqScore, "PHQ-9");

    // Calculate confidence score (reduced for partial assessments)
    let confidenceScore = calculateConfidenceScore(allResponses);
    if (isPartial) {
      const completionRate = allResponses.length / questions.length;
      confidenceScore = Math.round(confidenceScore * completionRate * 0.8); // Reduce confidence for partial
    }

    // Determine risk level
    const riskLevel = determineRiskLevel(gadScore, phqScore);

    // Get recommendations
    const recommendations = getRecommendations(riskLevel);

    const assessmentResults: AssessmentResults = {
      gadScore,
      phqScore,
      gadLevel: isPartial ? `${gadLevel} (Partial)` : gadLevel,
      phqLevel: isPartial ? `${phqLevel} (Partial)` : phqLevel,
      confidenceScore,
      riskLevel,
      recommendations,
      completedAt: new Date().toISOString(),
      isPartial,
      answeredQuestions: allResponses.length,
      totalQuestions: questions.length,
    };

    return assessmentResults;
  };

  const calculateResults = (allResponses: AssessmentResponse[]) => {
    const assessmentResults = calculatePartialResults(allResponses, false);
    
    setResults(assessmentResults);
    setShowResults(true);

    // Save to localStorage
    localStorage.setItem(
      "mindspace-assessment-results",
      JSON.stringify(assessmentResults)
    );

    if (onComplete) {
      onComplete(assessmentResults);
    }
  };

  const handleEarlyExit = () => {
    if (responses.length === 0) {
      // No responses yet, just close
      if (onClose) onClose();
      return;
    }
    
    setShowExitConfirmation(true);
  };

  const confirmEarlyExit = () => {
    const partialResults = calculatePartialResults(responses, true);
    
    setResults(partialResults);
    setShowResults(true);
    setShowExitConfirmation(false);

    // Save partial results to localStorage
    localStorage.setItem(
      "mindspace-assessment-results",
      JSON.stringify(partialResults)
    );

    if (onComplete) {
      onComplete(partialResults);
    }
  };

  const getScoreLevel = (score: number, type: "GAD-7" | "PHQ-9") => {
    const interpretation = assessmentData.interpretation[type];
    
    if (type === "GAD-7") {
      if (score <= 4) return interpretation["0-4"].level;
      if (score <= 9) return interpretation["5-9"].level;
      if (score <= 14) return interpretation["10-14"].level;
      return interpretation["15-21"].level;
    } else {
      if (score <= 4) return interpretation["0-4"].level;
      if (score <= 9) return interpretation["5-9"].level;
      if (score <= 14) return interpretation["10-14"].level;
      if (score <= 19) return interpretation["15-19"].level;
      return interpretation["20-27"].level;
    }
  };

  const calculateConfidenceScore = (allResponses: AssessmentResponse[]) => {
    let confidence = assessmentData.confidence_logic.base_score;

    // Completion bonus
    if (allResponses.length === questions.length) {
      confidence += assessmentData.confidence_logic.completion_bonus;
    }

    // Check consistency between control questions and main questions
    const gad5Response = allResponses.find((r) => r.questionId === "GAD5");
    const ctrl1Response = allResponses.find((r) => r.questionId === "CTRL1");
    const phq3Response = allResponses.find((r) => r.questionId === "PHQ3");
    const ctrl2Response = allResponses.find((r) => r.questionId === "CTRL2");

    let consistencyCount = 0;
    if (gad5Response && ctrl1Response) {
      if (Math.abs(gad5Response.value - ctrl1Response.value) <= 1) {
        consistencyCount++;
      }
    }
    if (phq3Response && ctrl2Response) {
      if (Math.abs(phq3Response.value - ctrl2Response.value) <= 1) {
        consistencyCount++;
      }
    }

    if (consistencyCount === 2) {
      confidence += assessmentData.confidence_logic.consistency_bonus;
    }

    // Check for rushed responses
    const totalTime = Date.now() - startTime;
    if (totalTime < assessmentData.confidence_logic.time_threshold_seconds * 1000) {
      confidence -= assessmentData.confidence_logic.rushed_penalty;
    }

    return Math.max(0, Math.min(100, confidence));
  };

  const determineRiskLevel = (gadScore: number, phqScore: number) => {
    if (gadScore >= 15 || phqScore >= 15) return "high";
    if (gadScore >= 10 || phqScore >= 10) return "moderate";
    return "low";
  };

  const getRecommendations = (riskLevel: "low" | "moderate" | "high") => {
    return assessmentData.recommendations[`${riskLevel}_risk`];
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setResponses(responses.slice(0, -1));
    }
  };

  const getScoreColor = (score: number, type: "GAD-7" | "PHQ-9") => {
    if (type === "GAD-7") {
      if (score <= 4) return "text-green-600";
      if (score <= 9) return "text-yellow-600";
      if (score <= 14) return "text-orange-600";
      return "text-red-600";
    } else {
      if (score <= 4) return "text-green-600";
      if (score <= 9) return "text-yellow-600";
      if (score <= 14) return "text-orange-600";
      return "text-red-600";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "moderate":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  if (showDisclaimer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-white/90 backdrop-blur border-white/60 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Brain className="w-12 h-12 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Mental Health Self-Assessment
              </CardTitle>
              <CardDescription className="text-lg">
                {assessmentData.assessment.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <strong>Important Disclaimer:</strong>{" "}
                    {assessmentData.assessment.disclaimer}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">
                  This assessment includes:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assessmentData.assessment.categories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {category}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <strong>Estimated time:</strong> 5-10 minutes
                  <br />
                  <strong>Questions:</strong> {questions.length} total
                  <br />
                  <strong>Privacy:</strong> All responses are stored locally on
                  your device
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={() => setShowDisclaimer(false)}
                  className="px-6 bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Header */}
          <Card className="bg-white/90 backdrop-blur border-white/60 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Heart className="w-12 h-12 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Your Mental Health Assessment Results
                {results.isPartial && (
                  <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                    Partial Assessment
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {results.isPartial 
                  ? `Partial assessment completed on ${new Date(results.completedAt).toLocaleDateString()} (${results.answeredQuestions}/${results.totalQuestions} questions)`
                  : `Completed on ${new Date(results.completedAt).toLocaleDateString()}`
                }
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur border-white/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Anxiety Assessment (GAD-7)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className={`text-4xl font-bold ${getScoreColor(results.gadScore, "GAD-7")}`}>
                    {results.gadScore}/21
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${getScoreColor(results.gadScore, "GAD-7")} bg-opacity-10`}
                  >
                    {results.gadLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur border-white/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Depression Assessment (PHQ-9)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className={`text-4xl font-bold ${getScoreColor(results.phqScore, "PHQ-9")}`}>
                    {results.phqScore}/27
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${getScoreColor(results.phqScore, "PHQ-9")} bg-opacity-10`}
                  >
                    {results.phqLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Level & Confidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur border-white/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getRiskIcon(results.riskLevel)}
                  Overall Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge
                    variant="secondary"
                    className={`text-lg px-4 py-2 ${
                      results.riskLevel === "low"
                        ? "bg-green-100 text-green-800"
                        : results.riskLevel === "moderate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {results.riskLevel.charAt(0).toUpperCase() + results.riskLevel.slice(1)} Risk
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur border-white/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Confidence Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold text-blue-600">
                    {results.confidenceScore}%
                  </div>
                  <Progress value={results.confidenceScore} className="w-full" />
                  <p className="text-sm text-gray-600">
                    Based on response consistency and completion
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="bg-white/90 backdrop-blur border-white/60 shadow-xl">
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Based on your assessment results, here are some suggestions for your wellbeing:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Crisis Resources (if high risk) */}
          {results.riskLevel === "high" && (
            <Card className="bg-red-50 border-red-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {assessmentData.crisis_resources.title}
                </CardTitle>
                <CardDescription className="text-red-700">
                  {assessmentData.crisis_resources.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessmentData.crisis_resources.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                      {resource.name.includes("Text") ? (
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Phone className="w-6 h-6 text-red-600" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{resource.name}</div>
                        <div className="text-sm text-gray-600">{resource.description}</div>
                      </div>
                      <div className="font-mono font-bold text-lg text-gray-800">
                        {resource.contact}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setResponses([]);
                setShowDisclaimer(true);
              }}
              className="px-6"
            >
              Retake Assessment
            </Button>
            <Button onClick={onClose} className="px-6 bg-indigo-600 hover:bg-indigo-700">
              Return to MindSpace
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Progress Header */}
        <Card className="mb-6 bg-white/90 backdrop-blur border-white/60 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-800">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                {currentQuestion.category}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/90 backdrop-blur border-white/60 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                  {currentQuestion.text}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Response Options */}
                <div className="space-y-3">
                  {(currentQuestion.type === "scale" 
                    ? assessmentData.assessment.scoring_scale.options 
                    : currentQuestion.options || assessmentData.assessment.scoring_scale.options
                  ).map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleResponse(option.value)}
                      className="w-full p-4 text-left rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 group-hover:text-indigo-700">
                          {option.label}
                        </span>
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-indigo-500 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={goBack}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button variant="ghost" onClick={handleEarlyExit}>
                    Exit Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Exit Confirmation Modal */}
        <AnimatePresence>
          {showExitConfirmation && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full mx-4"
              >
                <Card className="bg-white shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="w-5 h-5" />
                      End Assessment Early?
                    </CardTitle>
                    <CardDescription>
                      You've answered {responses.length} out of {questions.length} questions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">
                      Do you want to end this assessment now? We'll calculate your results based on the questions you've answered so far.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-amber-800 text-sm">
                        <strong>Note:</strong> Partial results will have lower confidence scores and may be less accurate than a complete assessment.
                      </p>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowExitConfirmation(false)}
                      >
                        Continue Assessment
                      </Button>
                      <Button
                        onClick={confirmEarlyExit}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Yes, Calculate Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
