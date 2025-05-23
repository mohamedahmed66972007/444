
import { useParams, useLocation } from "wouter";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";

export default function QuizResults() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { attempts, isLoadingAttempts } = useQuizzes();
  
  const attempt = attempts.find(a => a.id === parseInt(id));

  if (isLoadingAttempts) {
    return (
      <div className="text-center py-10">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        <p className="mt-4">جاري تحميل النتائج...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">لم يتم العثور على النتائج.</p>
        <Button onClick={() => navigate("/quizzes")} className="mt-4">
          العودة إلى الاختبارات
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          نتائج الاختبار
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

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">النتيجة النهائية</h3>
            <p className="text-3xl font-bold">
              {attempt.score}/{attempt.maxScore}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">النسبة المئوية</h3>
            <p className="text-3xl font-bold">
              {Math.round((attempt.score / attempt.maxScore) * 100)}%
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {attempt.answers.map((answer, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold mb-2">السؤال {index + 1}</h4>
                <p className="mb-4">{answer.question}</p>
                <p>إجابتك: {answer.answer}</p>
                {answer.isCorrect ? (
                  <div className="flex items-center text-green-600 mt-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>إجابة صحيحة</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 mt-2">
                    <XCircle className="h-4 w-4 mr-1" />
                    <span>إجابة خاطئة</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
