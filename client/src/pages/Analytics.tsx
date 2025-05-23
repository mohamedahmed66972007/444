import React from "react";
import { useFiles } from "@/hooks/useFiles";
import { useExams } from "@/hooks/useExams";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, BookOpen } from "lucide-react";

export default function Analytics() {
  const { files } = useFiles();
  const { exams } = useExams();
  const { quizzes } = useQuizzes();

  const userMetrics = {
    totalFiles: files?.length || 0,
    totalExams: exams?.length || 0,
    shortExams: exams?.length || 0, // These are the schedule exams, not online quizzes
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">تحليلات النظام</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              مستخدم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاختبارات المجدولة</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.shortExams}</div>
            <p className="text-xs text-muted-foreground">
              اختبار
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الملفات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              ملف
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}