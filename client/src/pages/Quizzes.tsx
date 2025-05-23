import { useState, useEffect } from "react";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import QuizCard from "@/components/QuizCard";
import CreateQuizModal from "@/components/CreateQuizModal";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Quizzes() {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const { quizzes, isLoading, searchQuizByCode } = useQuizzes();
  const [subject, setSubject] = useState("all");
  const [semester, setSemester] = useState("all");
  const [filteredQuizzes, setFilteredQuizzes] = useState(quizzes);

  const subjectOptions = [
    { value: "all", label: "جميع المواد" },
    { value: "arabic", label: "عربي" },
    { value: "english", label: "انجليزي" },
    { value: "math", label: "رياضيات" },
    { value: "chemistry", label: "كيمياء" },
    { value: "physics", label: "فيزياء" },
    { value: "biology", label: "احياء" },
    { value: "constitution", label: "دستور" },
    { value: "islamic", label: "اسلامية" }
  ];

  const semesterOptions = [
    { value: "all", label: "جميع الفصول" },
    { value: "first", label: "الفصل الأول" },
    { value: "second", label: "الفصل الثاني" }
  ];

  useEffect(() => {
    if (!quizzes) return;
    
    let filtered = [...quizzes];
    
    if (subject !== "all") {
      filtered = filtered.filter((quiz) => quiz.subject === subject);
    }
    
    if (semester !== "all") {
      filtered = filtered.filter((quiz) => quiz.semester === semester);
    }
    
    setFilteredQuizzes(filtered);
  }, [subject, semester, quizzes]);

  useEffect(() => {
    setFilteredQuizzes(quizzes || []);
  }, [quizzes]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      await searchQuizByCode(searchCode.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  const subjects = [...new Set(quizzes.map((quiz) => quiz.subject))];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">الاختبارات الإلكترونية</h2>
        {isAdmin && (
          <Button onClick={() => setIsOpen(true)} className="flex items-center">
            <PlusIcon className="h-4 w-4 ml-2" />
            <span>إنشاء اختبار جديد</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="ابحث برمز الاختبار"
            className="max-w-xs"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4 ml-2" />
            بحث
          </Button>
        </form>

        <div className="flex gap-2">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر مادة" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر الفصل" />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full text-center">لا يوجد اختبارات لهذه المادة</div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))
        )}
      </div>

      <CreateQuizModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}