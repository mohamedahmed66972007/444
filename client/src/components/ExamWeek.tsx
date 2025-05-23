
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExams } from "@/hooks/useExams";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { arEG } from "date-fns/locale";

interface ExamListProps {
  exams: Exam[];
}

export default function ExamList({ exams }: ExamListProps) {
  const { isAdmin } = useAuth();
  const { deleteExam } = useExams();
  const [, forceUpdate] = React.useState({});

  React.useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate({});
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDeleteExam = async (examId: number) => {
    await deleteExam(examId);
  };

  const getArabicSubject = (subject: string) => {
    const subjects: Record<string, string> = {
      'math': 'الرياضيات',
      'physics': 'الفيزياء',
      'chemistry': 'الكيمياء',
      'biology': 'الأحياء',
      'arabic': 'اللغة العربية',
      'english': 'اللغة الإنجليزية',
      'computer': 'الحاسب الآلي',
    };
    return subjects[subject.toLowerCase()] || subject;
  };

  const calculateTimeRemaining = (examDate: string) => {
    const now = new Date();
    const targetDate = parseISO(examDate);
    targetDate.setHours(3, 30, 0, 0);
    const diffMs = targetDate.getTime() - now.getTime();

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const sortedExams = [...exams].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-right text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
              <th className="px-4 py-3">المادة</th>
              <th className="px-4 py-3">اليوم</th>
              <th className="px-4 py-3">التاريخ</th>
              <th className="px-4 py-3">الأيام المتبقية</th>
              <th className="px-4 py-3">الدروس المقررة</th>
              {isAdmin && <th className="px-4 py-3">إجراءات</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {sortedExams.map((exam) => {
              const date = exam.date ? new Date(exam.date) : null;
              const timeRemaining = date ? calculateTimeRemaining(exam.date) : null;
              return (
                <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{getArabicSubject(exam.subject)}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {date && !isNaN(date.getTime()) ? format(date, 'EEEE', { locale: arEG }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {date && !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy', { locale: arEG }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {timeRemaining?.days > 1 
                      ? `باقي ${timeRemaining.days} يوم`
                      : timeRemaining?.days === 1 
                        ? `باقي يوم و ${timeRemaining.hours}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`
                        : timeRemaining
                          ? `باقي ${timeRemaining.hours}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`
                          : 'اليوم'
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    <ul className="list-disc list-inside">
                      {exam.topics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        حذف
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}