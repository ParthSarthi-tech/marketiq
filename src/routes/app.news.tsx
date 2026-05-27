import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/app/widgets";
import { NewsCard, NewsCardSkeleton, NewsEmptyState } from "@/components/app/news-card";
import { fetchNews, type NewsArticle } from "@/lib/news";
import { FILTER_CATEGORIES } from "@/lib/stockMetadata";

export const Route = createFileRoute("/app/news")({
  component: NewsPage,
  head: () => ({
    meta: [
      { title: "Market News — MarketIQ" },
      { name: "description", content: "Latest stock market news and updates." },
    ],
  }),
});

function NewsPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/app/news" });
  const [sectorFilter, setSectorFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["marketNews", sectorFilter, page],
    queryFn: () =>
      fetchNews({
        data: {
          limit: 12,
          page,
          filterEntities: true,
        },
      }),
    staleTime: 120_000,
    retry: 1,
  });

  const articles = data?.articles || [];
  const total = data?.total || 0;
  const totalPages = Math.min(Math.ceil(total / 12), 10);

  const filtered = searchQuery.trim()
    ? articles.filter(
        (a: NewsArticle) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.snippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : articles;

  return (
    <div className="relative">
      <PageHeader
        eyebrow="Stay informed"
        title={
          <>
            Market <span className="text-gradient">News</span>
          </>
        }
        subtitle="Latest headlines and analysis from across the Indian markets."
        action={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm hover:bg-card/60 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-1 flex-wrap">
          {[{ id: "all", label: "All" }, ...FILTER_CATEGORIES.slice(1)].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSectorFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                sectorFilter === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/40 text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/40 border border-border/60 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition"
          />
        </div>
      </div>

      {/* News Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <NewsEmptyState message={error?.message || "Failed to load news. Pull to refresh."} />
      ) : filtered.length === 0 ? (
        <NewsEmptyState
          message={
            searchQuery
              ? `No news matching "${searchQuery}". Try a different search term.`
              : "No news articles found for the selected filters."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((article, i) => (
              <NewsCard key={article.uuid} article={article} index={i} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card/40 border border-border/40 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/40 border border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card/40 border border-border/40 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
