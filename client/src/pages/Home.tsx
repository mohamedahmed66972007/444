
import { useFiles } from "@/hooks/useFiles";
import { useExams } from "@/hooks/useExams";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import FileCard from "@/components/FileCard";
import QuizCard from "@/components/QuizCard";

export default function Home() {
  const { files } = useFiles();
  const { exams } = useExams();
  const { quizzes } = useQuizzes();
  const [, navigate] = useLocation();

  const latestFiles = files?.slice(0, 3) || [];
  const latestExams = exams?.slice(0, 3) || [];
  const latestQuizzes = quizzes?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">مرحباً بك في نظام إدارة المواد الدراسية</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">اختر من القائمة الجانبية للوصول إلى الملفات والاختبارات</p>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">أحدث الملفات</h2>
            <Button variant="outline" onClick={() => navigate("/files")}>عرض الكل</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestFiles.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">أحدث الاختبارات</h2>
            <Button variant="outline" onClick={() => navigate("/exams")}>عرض الكل</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestExams.map(exam => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle>{exam.subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>التاريخ: {new Date(exam.date).toLocaleDateString('ar')}</p>
                  <p>المواضيع: {exam.topics.join('، ')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">أحدث الاختبارات الإلكترونية</h2>
            <Button variant="outline" onClick={() => navigate("/quizzes")}>عرض الكل</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestQuizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
