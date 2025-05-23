
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

export default function TakeQuiz() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { quiz, isLoadingQuiz, submitAttempt, isSubmitting } = useQuizzes();
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (isLoadingQuiz) {
    return (
      <div className="text-center py-10">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        <p className="mt-4">جاري تحميل الاختبار...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">لم يتم العثور على الاختبار.</p>
        <Button onClick={() => navigate("/quizzes")} className="mt-4">
          العودة إلى الاختبارات
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      const result = await submitAttempt({
        quizId: parseInt(id),
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId: parseInt(questionId),
          answer
        }))
      });
      navigate(`/quiz-results/${result.id}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {quiz.title}
        </h2>
        <Button
          variant="outline"
          onClick={() => navigate("/quizzes")}
          className="flex items-center space-x-1 space-x-reverse"
        >
          <ArrowRight className="h-4 w-4 ml-1" />
          <span>العودة للاختبارات</span>
        </Button>
      </div>

      <div className="space-y-6">
        {quiz.questions?.map((question, index) => (
          <Card key={index} className="p-6">
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            <RadioGroup
              value={answers[index]}
              onValueChange={(value) =>
                setAnswers((prev) => ({ ...prev, [index]: value }))
              }
            >
              {question.type === "truefalse" ? (
                <>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="true" id={`true-${index}`} />
                    <Label htmlFor={`true-${index}`}>صح</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="false" id={`false-${index}`} />
                    <Label htmlFor={`false-${index}`}>خطأ</Label>
                  </div>
                </>
              ) : (
                question.options?.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2 space-x-reverse"
                  >
                    <RadioGroupItem
                      value={option}
                      id={`${index}-${optionIndex}`}
                    />
                    <Label htmlFor={`${index}-${optionIndex}`}>{option}</Label>
                  </div>
                ))
              )}
            </RadioGroup>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "جاري الإرسال..." : "إرسال الإجابات"}
        </Button>
      </div>
    </div>
  );
}
