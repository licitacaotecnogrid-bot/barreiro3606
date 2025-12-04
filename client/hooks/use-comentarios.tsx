import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

export interface ComentarioEvento {
  id: number;
  eventoId: number;
  usuarioId: number | null;
  autor: string;
  conteudo: string;
  criadoEm: string;
  atualizadoEm: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
}

interface ComentariosContextType {
  comentarios: ComentarioEvento[];
  loading: boolean;
  error: string | null;
  addComentario: (eventoId: number, autor: string, conteudo: string, usuarioId?: number) => Promise<void>;
  deleteComentario: (eventoId: number, comentarioId: number) => Promise<void>;
  refetchComentarios: (eventoId: number) => Promise<void>;
}

const ComentariosContext = createContext<ComentariosContextType | undefined>(undefined);

export function ComentariosProvider({ children }: { children: ReactNode }) {
  const [comentarios, setComentarios] = useState<ComentarioEvento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComentarios = async (eventoId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/eventos/${eventoId}/comentarios`);
      if (!response.ok) throw new Error("Failed to fetch comentarios");
      const data = await response.json();
      setComentarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar comentários");
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  };

  const addComentario = async (eventoId: number, autor: string, conteudo: string, usuarioId?: number) => {
    try {
      const response = await fetch(`/api/eventos/${eventoId}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autor, conteudo, usuarioId }),
      });
      if (!response.ok) throw new Error("Failed to create comentario");
      await fetchComentarios(eventoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar comentário");
      throw err;
    }
  };

  const deleteComentario = async (eventoId: number, comentarioId: number) => {
    try {
      const response = await fetch(`/api/eventos/${eventoId}/comentarios/${comentarioId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete comentario");
      await fetchComentarios(eventoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar comentário");
      throw err;
    }
  };

  return (
    <ComentariosContext.Provider value={{ comentarios, loading, error, addComentario, deleteComentario, refetchComentarios: fetchComentarios }}>
      {children}
    </ComentariosContext.Provider>
  );
}

export function useComentarios() {
  const context = useContext(ComentariosContext);
  if (context === undefined) {
    throw new Error("useComentarios must be used within ComentariosProvider");
  }
  return context;
}
