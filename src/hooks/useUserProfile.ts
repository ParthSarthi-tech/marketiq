import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, saveQuizResponse, updateQuizResponse } from "@/lib/db";
import type { QuizResponse } from "@/lib/supabase";

export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => (userId ? getUserProfile(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useSaveQuizResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Omit<QuizResponse, "id" | "user_id" | "created_at">;
    }) => saveQuizResponse(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", variables.userId] });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<QuizResponse>;
    }) => updateQuizResponse(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", variables.userId] });
    },
  });
}