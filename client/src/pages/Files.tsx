
import { useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileCard from "@/components/FileCard";
import AddFileModal from "@/components/AddFileModal";
import { PlusIcon } from "lucide-react";

export default function Files() {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("all");
  const [semester, setSemester] = useState("all");

  const { files, isLoading } = useFiles({
    subject: subject,
    semester: semester
  });

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

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">الملفات الدراسية</h2>
          {isAdmin && (
            <Button onClick={() => setIsOpen(true)} className="flex items-center">
              <PlusIcon className="h-4 w-4 ml-2" />
              <span>إضافة ملف جديد</span>
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <div className="w-48">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفصل" />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>

      <AddFileModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
