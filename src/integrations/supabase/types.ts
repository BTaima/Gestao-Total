export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string
          confirmado: boolean | null
          created_at: string | null
          data_hora: string
          duracao: number
          estabelecimento_id: string
          id: string
          lembrete_enviado: boolean | null
          observacoes: string | null
          profissional_id: string
          servico_id: string
          status: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          cliente_id: string
          confirmado?: boolean | null
          created_at?: string | null
          data_hora: string
          duracao: number
          estabelecimento_id: string
          id?: string
          lembrete_enviado?: boolean | null
          observacoes?: string | null
          profissional_id: string
          servico_id: string
          status?: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          cliente_id?: string
          confirmado?: boolean | null
          created_at?: string | null
          data_hora?: string
          duracao?: number
          estabelecimento_id?: string
          id?: string
          lembrete_enviado?: boolean | null
          observacoes?: string | null
          profissional_id?: string
          servico_id?: string
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          agendamento_id: string | null
          cliente_id: string
          comentario: string | null
          created_at: string | null
          data: string | null
          estabelecimento_id: string
          id: string
          nota: number
          profissional_id: string | null
          resposta: string | null
          servico_id: string | null
          updated_at: string | null
          visivel: boolean | null
        }
        Insert: {
          agendamento_id?: string | null
          cliente_id: string
          comentario?: string | null
          created_at?: string | null
          data?: string | null
          estabelecimento_id: string
          id?: string
          nota: number
          profissional_id?: string | null
          resposta?: string | null
          servico_id?: string | null
          updated_at?: string | null
          visivel?: boolean | null
        }
        Update: {
          agendamento_id?: string | null
          cliente_id?: string
          comentario?: string | null
          created_at?: string | null
          data?: string | null
          estabelecimento_id?: string
          id?: string
          nota?: number
          profissional_id?: string | null
          resposta?: string | null
          servico_id?: string | null
          updated_at?: string | null
          visivel?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      bloqueios: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          estabelecimento_id: string
          id: string
          motivo: string | null
          profissional_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          estabelecimento_id: string
          id?: string
          motivo?: string | null
          profissional_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          estabelecimento_id?: string
          id?: string
          motivo?: string | null
          profissional_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bloqueios_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bloqueios_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean | null
          cpf: string | null
          created_at: string | null
          data_cadastro: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estabelecimento_id: string
          id: string
          nome: string
          numero_visitas: number | null
          observacoes: string | null
          telefone: string
          total_gasto: number | null
          ultima_visita: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cpf?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estabelecimento_id: string
          id?: string
          nome: string
          numero_visitas?: number | null
          observacoes?: string | null
          telefone: string
          total_gasto?: number | null
          ultima_visita?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cpf?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estabelecimento_id?: string
          id?: string
          nome?: string
          numero_visitas?: number | null
          observacoes?: string | null
          telefone?: string
          total_gasto?: number | null
          ultima_visita?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      estabelecimentos: {
        Row: {
          cidade: string | null
          cnpj: string | null
          configuracoes: Json | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          horario_funcionamento: Json | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cidade?: string | null
          cnpj?: string | null
          configuracoes?: Json | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cidade?: string | null
          cnpj?: string | null
          configuracoes?: Json | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lembretes: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          dados: Json | null
          data_lembrete: string
          descricao: string | null
          enviado: boolean | null
          estabelecimento_id: string
          id: string
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          dados?: Json | null
          data_lembrete: string
          descricao?: string | null
          enviado?: boolean | null
          estabelecimento_id: string
          id?: string
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          dados?: Json | null
          data_lembrete?: string
          descricao?: string | null
          enviado?: boolean | null
          estabelecimento_id?: string
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lembretes_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_espera: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_preferencia: string | null
          estabelecimento_id: string
          id: string
          observacoes: string | null
          periodo_preferencia: string | null
          profissional_id: string | null
          servico_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_preferencia?: string | null
          estabelecimento_id: string
          id?: string
          observacoes?: string | null
          periodo_preferencia?: string | null
          profissional_id?: string | null
          servico_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_preferencia?: string | null
          estabelecimento_id?: string
          id?: string
          observacoes?: string | null
          periodo_preferencia?: string | null
          profissional_id?: string | null
          servico_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_espera_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_espera_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_espera_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_espera_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          dados: Json | null
          data: string | null
          id: string
          lida: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dados?: Json | null
          data?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          dados?: Json | null
          data?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          data_cadastro: string | null
          id: string
          nome_completo: string
          nome_estabelecimento: string | null
          telefone: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          id: string
          nome_completo: string
          nome_estabelecimento?: string | null
          telefone: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          id?: string
          nome_completo?: string
          nome_estabelecimento?: string | null
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          ativo: boolean | null
          comissao: number | null
          created_at: string | null
          email: string | null
          especialidade: string | null
          estabelecimento_id: string
          horario_trabalho: Json | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          comissao?: number | null
          created_at?: string | null
          email?: string | null
          especialidade?: string | null
          estabelecimento_id: string
          horario_trabalho?: Json | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          comissao?: number | null
          created_at?: string | null
          email?: string | null
          especialidade?: string | null
          estabelecimento_id?: string
          horario_trabalho?: Json | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          duracao: number
          estabelecimento_id: string
          id: string
          nome: string
          profissionais_ids: string[] | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao: number
          estabelecimento_id: string
          id?: string
          nome: string
          profissionais_ids?: string[] | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao?: number
          estabelecimento_id?: string
          id?: string
          nome?: string
          profissionais_ids?: string[] | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "servicos_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes: {
        Row: {
          agendamento_id: string | null
          categoria: string
          created_at: string | null
          data: string
          descricao: string
          estabelecimento_id: string
          forma_pagamento: string | null
          id: string
          profissional_id: string | null
          tipo: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          agendamento_id?: string | null
          categoria: string
          created_at?: string | null
          data: string
          descricao: string
          estabelecimento_id: string
          forma_pagamento?: string | null
          id?: string
          profissional_id?: string | null
          tipo: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          agendamento_id?: string | null
          categoria?: string
          created_at?: string | null
          data?: string
          descricao?: string
          estabelecimento_id?: string
          forma_pagamento?: string | null
          id?: string
          profissional_id?: string | null
          tipo?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "administrador" | "profissional" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrador", "profissional", "cliente"],
    },
  },
} as const
