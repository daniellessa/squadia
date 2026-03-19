import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { LlmConnection } from "@/types"
import { useAuthStore } from "@/stores/authStore"

export function useLlmConnections() {
  const { companyId } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["llm-connections", companyId],
    queryFn: async () => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from("llm_connections")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as LlmConnection[]
    },
    enabled: !!companyId,
  })

  const createConnection = useMutation({
    mutationFn: async (
      newConnection: Omit<LlmConnection, "id" | "company_id" | "created_at">
    ) => {
      if (!companyId) throw new Error("No company ID")

      const { data, error } = await supabase
        .from("llm_connections")
        .insert({
          company_id: companyId,
          ...newConnection,
        })
        .select()
        .single()

      if (error) throw error
      return data as LlmConnection
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-connections"] })
    },
  })

  const deleteConnection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("llm_connections")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-connections"] })
    },
  })

  return {
    connections,
    isLoading,
    createConnection,
    deleteConnection,
  }
}
