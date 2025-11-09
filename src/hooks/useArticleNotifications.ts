import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useArticleNotifications = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("article-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "articles",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const article = payload.new;
          toast.success("Artigo gerado com sucesso!", {
            description: `"${article.title}" foi criado e salvo.`,
            duration: 5000,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "articles",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const article = payload.new;
          if (article.status === "published") {
            toast.success("Artigo publicado!", {
              description: `"${article.title}" foi publicado no WordPress.`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
};

export const notifyArticleGenerated = (title: string) => {
  toast.success("Artigo gerado com sucesso!", {
    description: `"${title}" foi criado e salvo.`,
    duration: 5000,
  });
};

export const notifyArticlePublished = (title: string) => {
  toast.success("Artigo publicado!", {
    description: `"${title}" foi publicado no WordPress.`,
    duration: 5000,
  });
};

export const notifyArticleError = (message: string) => {
  toast.error("Erro ao gerar artigo", {
    description: message,
    duration: 5000,
  });
};
