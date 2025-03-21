"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, ArrowRight, Download, Clock, User, BookOpen, AlertCircle } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { useRouter } from "next/router"
import { toast } from "sonner"
import Cookies from 'js-cookie';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function TestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const router = useRouter()

  // Separate state for question status by subject
  const [physicsQuestionStatus, setPhysicsQuestionStatus] = useState({})
  const [chemistryQuestionStatus, setChemistryQuestionStatus] = useState({})
  const [mathematicsQuestionStatus, setMathematicsQuestionStatus] = useState({})

  // Separate state for selected options by subject
  const [physicsSelectedOptions, setPhysicsSelectedOptions] = useState({})
  const [chemistrySelectedOptions, setChemistrySelectedOptions] = useState({})
  const [mathematicsSelectedOptions, setMathematicsSelectedOptions] = useState({})

  // Separate state for numerical answers by subject
  const [physicsNumericalAnswers, setPhysicsNumericalAnswers] = useState({})
  const [chemistryNumericalAnswers, setChemistryNumericalAnswers] = useState({})
  const [mathematicsNumericalAnswers, setMathematicsNumericalAnswers] = useState({})

  const [timeRemaining, setTimeRemaining] = useState(10800) // 3 hours in seconds
  const [currentSubject, setCurrentSubject] = useState("Physics")
  const [isTimeUpDialogOpen, setIsTimeUpDialogOpen] = useState(false)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [questions, setQuestions] = useState([])
  const token = Cookies.get('token');
  const { id } = router.query
  const [user, setUser] = useState({})
  const [testStatus, setTestStatus] = useState(true)

  const fetchTest = async () => {
    try {
      const response = await axios.get(`/api/test/getSpecificQuestions?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuestions(response.data.data)
      setTestStatus(response.data.status)
    }
    catch (err) {
      console.log(err)
      toast.error("Something went wrong in fetching test data. Contact Admin")
    }
  }

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.data)
    }
    catch (err) {
      console.log(err)
      toast.error("Something went wrong while fetching user data. Contact Admin")
    }
  }

  const makeTestInActive = async () => {
    try {
      const res = await axios.post("/api/test/updateTestStatus", {
        testId: id,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }
    catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTest();
      fetchUser();
    }
  }, [id])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsTimeUpDialogOpen(true) // Show the dialog when time is up
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleViewResults = () => {
    makeTestInActive()
    router.push(`/result/${id}`)
  }

  // Helper function to get current subject's question status
  const getCurrentQuestionStatus = () => {
    switch (currentSubject) {
      case "Physics":
        return physicsQuestionStatus;
      case "Chemistry":
        return chemistryQuestionStatus;
      case "Mathematics":
        return mathematicsQuestionStatus;
      default:
        return physicsQuestionStatus;
    }
  }

  // Helper function to set current subject's question status
  const setCurrentQuestionStatus = (newStatus) => {
    switch (currentSubject) {
      case "Physics":
        setPhysicsQuestionStatus(newStatus);
        break;
      case "Chemistry":
        setChemistryQuestionStatus(newStatus);
        break;
      case "Mathematics":
        setMathematicsQuestionStatus(newStatus);
        break;
      default:
        setPhysicsQuestionStatus(newStatus);
    }
  }

  // Helper function to get current subject's selected options
  const getCurrentSelectedOptions = () => {
    switch (currentSubject) {
      case "Physics":
        return physicsSelectedOptions;
      case "Chemistry":
        return chemistrySelectedOptions;
      case "Mathematics":
        return mathematicsSelectedOptions;
      default:
        return physicsSelectedOptions;
    }
  }

  // Helper function to set current subject's selected options
  const setCurrentSelectedOptions = (newOptions) => {
    switch (currentSubject) {
      case "Physics":
        setPhysicsSelectedOptions(newOptions);
        break;
      case "Chemistry":
        setChemistrySelectedOptions(newOptions);
        break;
      case "Mathematics":
        setMathematicsSelectedOptions(newOptions);
        break;
      default:
        setPhysicsSelectedOptions(newOptions);
    }
  }

  // Helper function to get current subject's numerical answers
  const getCurrentNumericalAnswers = () => {
    switch (currentSubject) {
      case "Physics":
        return physicsNumericalAnswers;
      case "Chemistry":
        return chemistryNumericalAnswers;
      case "Mathematics":
        return mathematicsNumericalAnswers;
      default:
        return physicsNumericalAnswers;
    }
  }

  // Helper function to set current subject's numerical answers
  const setCurrentNumericalAnswers = (newAnswers) => {
    switch (currentSubject) {
      case "Physics":
        setPhysicsNumericalAnswers(newAnswers);
        break;
      case "Chemistry":
        setChemistryNumericalAnswers(newAnswers);
        break;
      case "Mathematics":
        setMathematicsNumericalAnswers(newAnswers);
        break;
      default:
        setPhysicsNumericalAnswers(newAnswers);
    }
  }

  // Get the currently selected option for the current question
  const getSelectedOption = () => {
    const currentOptions = getCurrentSelectedOptions();
    return currentOptions[currentQuestion] || null;
  }

  // Set the selected option for the current question
  const setSelectedOption = (optionId) => {
    const currentOptions = getCurrentSelectedOptions();
    setCurrentSelectedOptions({
      ...currentOptions,
      [currentQuestion]: optionId
    });
  }

  // Get the current numerical answer for the current question
  const getNumericalAnswer = () => {
    const currentAnswers = getCurrentNumericalAnswers();
    return currentAnswers[currentQuestion] || "";
  }

  // Set the numerical answer for the current question
  const setNumericalAnswer = (value) => {
    const currentAnswers = getCurrentNumericalAnswers();
    setCurrentNumericalAnswers({
      ...currentAnswers,
      [currentQuestion]: value
    });
  }

  // Check if current question has a valid answer (either option selected or numerical value)
  const hasValidAnswer = () => {
    const question = filteredQuestions[currentQuestion - 1];
    if (!question) return false;

    if (question.questionType === "Numerical") {
      const numericalValue = getNumericalAnswer();
      return numericalValue !== "" && numericalValue !== null;
    } else {
      return getSelectedOption() !== null;
    }
  }

  const formatTime = (seconds) => {
    const totalMinutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${totalMinutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeColor = () => {
    if (timeRemaining < 600) return "bg-red-500" // Less than 10 minutes
    if (timeRemaining < 1800) return "bg-orange-500" // Less than 30 minutes
    return "bg-blue-600"
  }

  const getQuestionsBySubject = (subject) => {
    return questions?.filter((q) => q.subject === subject)
  }

  const filteredQuestions = getQuestionsBySubject(currentSubject)

  // Get number of questions for the current subject
  const currentSubjectQuestionCount = filteredQuestions?.length || 25
  const questionNumbers = Array.from({ length: currentSubjectQuestionCount }, (_, i) => i + 1)

  const getStatusCounts = () => {
    const currentStatus = getCurrentQuestionStatus()
    const counts = {
      notVisited: currentSubjectQuestionCount,
      notAnswered: 0,
      answered: 0,
      review: 0,
      answeredReview: 0
    }

    Object.values(currentStatus).forEach(status => {
      if (status === "not-answered") {
        counts.notAnswered++
        counts.notVisited--
      } else if (status === "answered") {
        counts.answered++
        counts.notVisited--
      } else if (status === "review") {
        counts.review++
        counts.notVisited--
      } else if (status === "answered-review") {
        counts.answeredReview++
        counts.notVisited--
      }
    })

    return counts
  }

  const statusCounts = getStatusCounts()

  // Handle changing subject
  const handleSubjectChange = (newSubject) => {
    setCurrentSubject(newSubject)
    setCurrentQuestion(1)
  }

  // Handle saving answer
  const saveAnswer = async (markForReview = false, questionId, questionType) => {
    const currentStatus = getCurrentQuestionStatus()
    let isAnswered = false;

    try {
      if (questionType === "Numerical") {
        const numericalValue = getNumericalAnswer();
        isAnswered = numericalValue !== "" && numericalValue !== null;

        if (isAnswered) {
          await axios.post(`/api/test/updateScore`, {
            "userId": user._id,
            "testId": id,
            "questionId": questionId,
            "numericalValue": numericalValue,
            "isMarkedForReview": markForReview,
            "action": markForReview ? "markForReview" : "saveAndNext"
          });
        }
      } else {
        const selectedOption = getSelectedOption();
        isAnswered = selectedOption !== null;

        if (isAnswered) {
          await axios.post(`/api/test/updateScore`, {
            "userId": user._id,
            "testId": id,
            "questionId": questionId,
            "selectedOption": getSelectedOption(),
            "isMarkedForReview": markForReview,
            "action": markForReview ? "markForReview" : "saveAndNext"
          });
        }
      }

      // Update question status based on whether an answer was provided
      setCurrentQuestionStatus({
        ...currentStatus,
        [currentQuestion]: isAnswered
          ? (markForReview ? "answered-review" : "answered")
          : (markForReview ? "review" : "not-answered"),
      });

      // Move to next question if not the last one
      if (currentQuestion < filteredQuestions.length) {
        setCurrentQuestion(currentQuestion + 1);
      }

      toast.success("Saved Successfully");
    }
    catch (err) {
      console.log(err);
      toast.error("Something went wrong while submitting answers. Contact Admin");
    }
  }

  // Handle clearing response
  const clearResponse = () => {
    const question = filteredQuestions[currentQuestion - 1];
    if (!question) return;

    if (question.questionType === "Numerical") {
      // Clear the numerical answer for the current question
      const currentAnswers = getCurrentNumericalAnswers();
      const newAnswers = { ...currentAnswers };
      delete newAnswers[currentQuestion];
      setCurrentNumericalAnswers(newAnswers);
    } else {
      // Clear the selected option for the current question
      const currentOptions = getCurrentSelectedOptions();
      const newOptions = { ...currentOptions };
      delete newOptions[currentQuestion];
      setCurrentSelectedOptions(newOptions);
    }

    // Update the question status
    const currentStatus = getCurrentQuestionStatus();
    setCurrentQuestionStatus({
      ...currentStatus,
      [currentQuestion]: "not-answered",
    });
  }

  // Get status color for question number buttons
  const getStatusColor = (questionNum) => {
    const currentStatus = getCurrentQuestionStatus()
    const status = currentStatus[questionNum]

    if (!status || status === "not-visited") return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    if (status === "not-answered") return "bg-red-500 text-white hover:bg-red-600"
    if (status === "answered") return "bg-green-500 text-white hover:bg-green-600"
    if (status === "review") return "bg-purple-500 text-white hover:bg-purple-600"
    if (status === "answered-review") return "bg-blue-500 text-white hover:bg-blue-600"
    return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }

  // Get current question
  const question = filteredQuestions[currentQuestion - 1]

  if (!testStatus) {
    return (
      <div className="h-[100vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div>Test inactive. Contact Admin to reattempt.</div>
          <Button onClick={() => { router.push("/") }} className="bg-green-500 cursor-pointer hover:bg-green-600 text-white shadow-sm px-5 py-2 h-auto">Back to Test</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-white p-2 rounded-md">
                <Image src={"/logo-white.png"} width={50} height={50} />
              </div>
              <div className="font-bold text-black text-xl">JEE MAIN 2025</div>
            </div>

            <div className="flex items-center gap-6">
              <div className={`${getTimeColor()} text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md`}>
                <Clock className="h-5 w-5" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm border flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-blue-100">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Candidate" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">CN</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Candidate:</span>{" "}
                    <span className="text-blue-600 font-medium">{user.name}</span>
                  </div>
                  <div className="text-sm flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">Exam:</span>{" "}
                    <span className="text-blue-600 font-medium">JEE MAIN 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Subject Navigation */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Tabs
              defaultValue="Physics"
              className="w-full"
              value={currentSubject}
              onValueChange={handleSubjectChange}
            >
              <TabsList className="bg-blue-700/40 h-auto p-1 rounded-md gap-4">
                <TabsTrigger
                  value="Physics"
                  className="cursor-pointer data-[state=active]:bg-blue-800 data-[state=active]:text-white bg-white text-black px-8 py-2 rounded-md transition-all"
                >
                  PHYSICS
                </TabsTrigger>
                <TabsTrigger
                  value="Chemistry"
                  className="cursor-pointer data-[state=active]:bg-blue-800 data-[state=active]:text-white px-8 py-2 bg-white text-black rounded-md transition-all"
                >
                  CHEMISTRY
                </TabsTrigger>
                <TabsTrigger
                  value="Mathematics"
                  className="cursor-pointer data-[state=active]:bg-blue-800 data-[state=active]:text-white px-8 py-2 rounded-md bg-white text-black transition-all"
                >
                  MATHEMATICS
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Question Status Legend */}
      <div className="bg-white py-3 border-b shadow-sm">
        <div className="container mx-auto px-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 border border-gray-300 text-gray-800 flex items-center justify-center text-xs font-medium rounded">
              {statusCounts.notVisited}
            </div>
            <span className="text-sm text-gray-600">Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 text-white flex items-center justify-center text-xs font-medium rounded shadow-sm">
              {statusCounts.notAnswered}
            </div>
            <span className="text-sm text-gray-600">Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 text-white flex items-center justify-center text-xs font-medium rounded shadow-sm">
              {statusCounts.answered}
            </div>
            <span className="text-sm text-gray-600">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 text-white flex items-center justify-center text-xs font-medium rounded shadow-sm">
              {statusCounts.review}
            </div>
            <span className="text-sm text-gray-600">Marked for Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 text-white flex items-center justify-center text-xs font-medium rounded shadow-sm">
              {statusCounts.answeredReview}
            </div>
            <span className="text-sm text-gray-600">Answered & Marked for Review</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col-reverse md:flex-row gap-6">
        {/* Question Area (70%) */}
        <div className="w-full md:w-[70%]">
          <Card className="shadow-md border border-gray-200 overflow-hidden">
            <CardHeader className="border-b pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                  Question {currentQuestion}
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {currentSubject?.toUpperCase()}
                  </span>
                </CardTitle>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <AlertCircle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Report an issue with this question</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-lg text-gray-800">{question?.question}</p>
              </div>

              {question?.images?.map((img, i) => (
                <div key={i}>
                  <Image src={img} height={600} width={600} alt={`Question image ${i + 1}`} />
                </div>
              ))}

              {question && question.questionType !== "Numerical" && (
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <div
                      key={option._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${getSelectedOption() === option._id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                        }`}
                      onClick={() => setSelectedOption(option._id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-gray-800">{option.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {question && question.questionType === "Numerical" && (
                <div className="flex gap-2 items-center mt-5">
                  <label className="text-gray-500">Answer</label>
                  <input
                    placeholder="Type numerical answer"
                    className="border p-2 rounded w-48"
                    value={getNumericalAnswer()}
                    onChange={(e) => setNumericalAnswer(e.target.value)}
                  />
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white shadow-sm px-5 py-2 h-auto"
                  onClick={() => saveAnswer(false, question?._id, question?.questionType)}>
                  SAVE & NEXT
                </Button>
                <Button className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white shadow-sm px-5 py-2 h-auto"
                  onClick={() => saveAnswer(true, question?._id, question?.questionType)}>
                  SAVE & MARK FOR REVIEW
                </Button>
                <Button
                  variant="outline"
                  className="text-gray-700 bg-white cursor-pointer border-gray-50 hover:bg-gray-50 shadow-sm px-5 py-2 h-auto"
                  onClick={clearResponse}
                >
                  CLEAR RESPONSE
                </Button>
                <Button
                  className="bg-purple-500 hover:bg-purple-600 cursor-pointer text-white shadow-sm px-5 py-2 h-auto"
                  onClick={() => {
                    const currentStatus = getCurrentQuestionStatus()
                    setCurrentQuestionStatus({
                      ...currentStatus,
                      [currentQuestion]: "review",
                    })
                    if (currentQuestion < filteredQuestions.length) {
                      setCurrentQuestion(currentQuestion + 1)
                    }
                  }}
                >
                  MARK FOR REVIEW & NEXT
                </Button>
              </div>

              <div className="mt-8 flex justify-between border-t pt-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
                  onClick={() => {
                    if (currentQuestion > 1) {
                      setCurrentQuestion(currentQuestion - 1)
                    }
                  }}
                  disabled={currentQuestion === 1}
                >
                  <ArrowLeft className="h-4 w-4" /> PREVIOUS
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
                  onClick={() => {
                    if (currentQuestion < filteredQuestions.length) {
                      setCurrentQuestion(currentQuestion + 1)
                    }
                  }}
                  disabled={currentQuestion === filteredQuestions.length}
                >
                  NEXT <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 shadow-md"
                  onClick={() => setIsSubmitDialogOpen(true)}
                >
                  SUBMIT TEST
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Navigation (30%) */}
        <div className="w-full md:w-[30%]">
          <Card className="shadow-md border border-gray-200">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-blue-700">Question Palette</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-700">
                Click on a question number to navigate directly to that question
              </div>
              <div className="grid grid-cols-7 gap-2">
                {questionNumbers.map((num) => (
                  <TooltipProvider key={num}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className={`h-9 w-9 p-0 text-xs font-medium ${getStatusColor(num)} ${currentQuestion === num ? "ring-2 ring-offset-1 ring-blue-400" : ""
                            }`}
                          onClick={() => {
                            setCurrentQuestion(num)
                            const currentStatus = getCurrentQuestionStatus()
                            if (!currentStatus[num]) {
                              setCurrentQuestionStatus({
                                ...currentStatus,
                                [num]: "not-answered",
                              })
                            }
                          }}
                        >
                          {num.toString().padStart(2, "0")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Question {num}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white shadow-md"
                onClick={() => setIsSubmitDialogOpen(true)}>
                SUBMIT TEST
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isTimeUpDialogOpen} >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Time Up!</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex justify-center mb-4">
                <Clock className="h-16 w-16 text-blue-600" />
              </div>
              <p className="text-lg font-medium">Your test has been completed.</p>
              <p className="mt-2">Your answers have been automatically saved.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-8 py-2 shadow-md text-lg"
              onClick={handleViewResults}
            >
              View Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Submit Test</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-orange-500" />
              </div>
              <p className="text-lg font-medium">Are you sure you want to submit your test?</p>
              <p className="mt-2">
                Once submitted, you would not be able to make any changes to your answers.
              </p>

              {/* Show summary of answered questions */}
              <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex flex-col items-center">
                    <span className="font-medium text-green-600">{statusCounts.answered + statusCounts.answeredReview}</span>
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-medium text-red-600">{statusCounts.notAnswered + statusCounts.notVisited}</span>
                    <span className="text-gray-600">Unanswered</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-medium text-purple-600">{statusCounts.review}</span>
                    <span className="text-gray-600">For Review</span>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-3">
            <Button
              variant="outline"
              className="mt-4 border-gray-300 text-gray-700 px-6"
              onClick={() => setIsSubmitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 shadow-md"
              onClick={handleViewResults}
            >
              Submit Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}