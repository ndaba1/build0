import { useAuth } from "@/components/authenticator";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import { handle } from "typed-handlers";

export function useProject() {
  const { idToken } = useAuth();
  const { slug } = useParams() as { slug: string };
  const { error, isLoading, data } = useQuery({
    queryKey: ["project-layout", slug],
    queryFn: async () => {
      const cfg = handle("/api/v1/projects/[slug]", {
        params: { slug },
      });

      const { status, data } = await axios.get<{
        project: {
          id: string;
          name: string;
          slug: string;
          memberId: string;
          isAdmin: boolean;
        };
      }>(cfg.url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (status !== 200) {
        throw new Error((data as unknown as { message: string }).message);
      }

      return data.project;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  return { error, isLoading, slug, ...data };
}
