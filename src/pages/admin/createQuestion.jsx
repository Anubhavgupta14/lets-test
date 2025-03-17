"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, AlertCircle, Upload, Image, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Cookies from 'js-cookie';

const QuestionForm = () => {
  const token = Cookies.get('token');
  const [questionData, setQuestionData] = useState({
    question: "",
    subject: "Physics",
    questionType: "MCQ",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    numericalAnswer: "",
  });

  const [jsonPreview, setJsonPreview] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  const handleQuestionChange = (e) => {
    setQuestionData({ ...questionData, question: e.target.value });
  };

  const handleSubjectChange = (value) => {
    setQuestionData({ ...questionData, subject: value });
  };

  const handleTypeChange = (value) => {
    setQuestionData({ ...questionData, questionType: value });
  };

  const handleOptionTextChange = (index, value) => {
    const newOptions = [...questionData.options];
    newOptions[index].text = value;
    setQuestionData({ ...questionData, options: newOptions });
  };

  const handleOptionCorrectChange = (index) => {
    const newOptions = [...questionData.options].map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setQuestionData({ ...questionData, options: newOptions });
  };

  const handleNumericalAnswerChange = (e) => {
    setQuestionData({ ...questionData, numericalAnswer: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imageFiles.length > 3) {
      setError("Maximum 3 images allowed");
      return;
    }
    
    setImageFiles(prevFiles => [...prevFiles, ...files]);
    
    // Create preview URLs for the selected images
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    setError("");

    if (!questionData.question.trim()) {
      setError("Question text is required");
      return false;
    }

    if (questionData.questionType === "MCQ") {
      // Check if at least one option is marked as correct
      const hasCorrectOption = questionData.options.some((option) => option.isCorrect);
      if (!hasCorrectOption) {
        setError("Please mark at least one option as correct");
        return false;
      }

      // Check if all options have text
      const emptyOptions = questionData.options.some((option) => !option.text.trim());
      if (emptyOptions) {
        setError("All options must have text");
        return false;
      }
    } else if (questionData.questionType === "Numerical" && !questionData.numericalAnswer) {
      setError("Numerical answer is required");
      return false;
    }

    return true;
  };

  const generateJson = () => {
    if (!validateForm()) return;

    // Create a properly formatted version of the data based on question type
    let outputData = prepareQuestionData();
    setJsonPreview(JSON.stringify(outputData, null, 2));
  };

  // Helper function to prepare question data based on type
  const prepareQuestionData = () => {
    // Create a clean copy of the question data
    const formattedData = {
      question: questionData.question,
      subject: questionData.subject,
      questionType: questionData.questionType,
    };

    // Add type-specific fields
    if (questionData.questionType === "MCQ") {
      formattedData.options = questionData.options;
    } else if (questionData.questionType === "Numerical") {
      formattedData.numericalAnswer = questionData.numericalAnswer;
    }

    return formattedData;
  };

  const submitQuestion = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // Get properly formatted data based on question type
      const formattedData = prepareQuestionData();
      
      // Create a FormData object for the multipart/form-data request
      const formData = new FormData();
      
      // Add the question data as a JSON string
      formData.append("data", JSON.stringify(formattedData));
      
      // Add any image files
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }
      
      if (!token) {
        setError("You must be logged in to create questions");
        setIsSubmitting(false);
        return;
      }
      
      // Make the API request
      const response = await fetch("/api/admin/createQuestion", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to create question");
      }
      
      // Success! Clear the form
      setQuestionData({
        question: "",
        subject: "Physics",
        questionType: "MCQ",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        numericalAnswer: "",
      });
      
      setImageFiles([]);
      setImagePreviewUrls([]);
      setJsonPreview("");
      
      // Show success message
      toast.success("Question created successfully");
      
    } catch (error) {
      console.error("Error submitting question:", error);
      setError(error.message || "Failed to create question. Please try again.");
      toast.error("Failed to create question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create JEE Mains Question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter the question text"
                value={questionData.question}
                onChange={handleQuestionChange}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={questionData.subject} onValueChange={handleSubjectChange}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select value={questionData.questionType} onValueChange={handleTypeChange}>
                  <SelectTrigger id="questionType">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value="Numerical">Numerical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="images">Question Images (Optional)</Label>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative border rounded-md overflow-hidden h-32">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-contain" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                {imagePreviewUrls.length < 3 && (
                  <div className="flex items-center gap-2">
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="images"
                      className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Images (Max 3)</span>
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {imagePreviewUrls.length}/3 images
                    </span>
                  </div>
                )}
              </div>
            </div>

            {questionData.questionType === "MCQ" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                </div>

                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <RadioGroup
                      value={option.isCorrect ? index.toString() : ""}
                      onValueChange={() => handleOptionCorrectChange(index)}
                      className="mt-2"
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    </RadioGroup>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => handleOptionTextChange(index, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="numericalAnswer">Numerical Answer</Label>
                <Input
                  id="numericalAnswer"
                  type="text"
                  placeholder="Enter the correct numerical answer"
                  value={questionData.numericalAnswer}
                  onChange={handleNumericalAnswerChange}
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex gap-4 w-full">
            <Button onClick={generateJson} variant="outline" className="flex-1">
              Preview JSON
            </Button>
            <Button 
              onClick={submitQuestion} 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Question"
              )}
            </Button>
          </div>

          {jsonPreview && (
            <div className="w-full">
              <Label>JSON Preview</Label>
              <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto text-sm">{jsonPreview}</pre>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuestionForm;