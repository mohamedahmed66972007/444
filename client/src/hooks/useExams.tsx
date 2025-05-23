import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Exam } from "@shared/schema";

interface AddExamData {
  subject: string;
  date: string;
  topics: string[];
}

export const useExams = () => {
  // Fetch exams
  const {
    data: exams,
    isLoading,
    error,
  } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  // Add exam mutation
  const addExamMutation = useMutation({
    mutationFn: async (data: AddExamData) => {
      const examResponse = await apiRequest("POST", "/api/exams", data);

      if (!examResponse.ok) {
        const errorText = await examResponse.text();
        throw new Error(`Failed to add exam: ${errorText}`);
      }

      return examResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
    },
  });

  // Delete exam mutation
  const deleteExamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
    },
  });

  return {
    exams: exams || [],
    isLoading,
    error,
    addExam: addExamMutation.mutateAsync,
    deleteExam: deleteExamMutation.mutateAsync,
  };
};