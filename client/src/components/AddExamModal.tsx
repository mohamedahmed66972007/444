import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExams } from "@/hooks/useExams";
import { useToast } from "@/hooks/use-toast";
import { subjects } from "@shared/schema";

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const subjectOptions = [
  { value: "arabic", label: "اللغة العربية" },
  { value: "english", label: "اللغة الإنجليزية" },
  { value: "math", label: "الرياضيات" },
  { value: "chemistry", label: "الكيمياء" },
  { value: "physics", label: "الفيزياء" },
  { value: "biology", label: "الأحياء" },
  { value: "constitution", label: "الدستور" },
  { value: "islamic", label: "الاسلامية" },
];

export default function AddExamModal({ isOpen, onClose }: AddExamModalProps) {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [topics, setTopics] = useState("");

  const { addExam } = useExams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !date || !topics) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(date);
    examDate.setHours(0, 0, 0, 0);

    if (examDate.getTime() === today.getTime()) {
      toast({
        title: "خطأ",
        description: "لا يمكن إضافة اختبار لليوم الحالي",
        variant: "destructive",
      });
      return;
    }

    const topicsArray = topics.split("\n").filter(topic => topic.trim());

    if (topicsArray.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الدروس المقررة",
        variant: "destructive",
      });
      return;
    }

    try {
      await addExam({
        subject,
        date,
        topics: topicsArray,
      });

      toast({
        title: "تم إضافة الاختبار بنجاح",
      });

      setSubject("");
      setDate("");
      setTopics("");
      onClose();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الاختبار",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]" description="إضافة اختبار جديد">
        <DialogHeader>
          <DialogTitle>إضافة اختبار جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(new Date(date), "dd/MM/yyyy") : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date ? new Date(date) : undefined}
                  onSelect={(newDate) => {
                    if (newDate) {
                      const adjustedDate = new Date(newDate);
                      adjustedDate.setDate(adjustedDate.getDate() + 1);
                      setDate(adjustedDate.toISOString().split('T')[0]);
                    } else {
                      setDate('');
                    }
                  }}
                  initialFocus
                  fromDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="الدروس المقررة (كل درس في سطر)"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              rows={5}
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">
              إضافة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}