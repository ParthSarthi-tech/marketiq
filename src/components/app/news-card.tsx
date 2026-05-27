import { motion } from "framer-motion";
import { ExternalLink, Newspaper } from "lucide-react";
import { type NewsArticle, getSentimentLabel, getSentimentColor, formatNewsDate } from "@/lib/news";

interface NewsCardProps {
  article: NewsArticle;
  index?: number;
}

export function NewsCard({ article, index = 0 }: NewsCardProps) {
  const sentimentLabel = getSentimentLabel(article.sentiment);
  const sentimentColor = getSentimentColor(article.sentiment);

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group block rounded-2xl bg-gradient-card border border-border/60 overflow-hidden hover:border-primary/40 transition"
    >
      <div className="flex flex-col sm:flex-row">
        {article.image_url && (
          <div className="relative sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden bg-card/50">
            <img
              src={article.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
              {article.source}
            </span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {formatNewsDate(article.published_at)}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: sentimentColor }}
              />
              <span
                className="text-[10px] uppercase tracking-wider font-mono"
                style={{ color: sentimentColor }}
              >
                {sentimentLabel}
              </span>
            </div>
          </div>
          <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {article.snippet || article.description}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition">
            <ExternalLink className="w-3 h-3" />
            Read full article
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="rounded-2xl bg-gradient-card border border-border/60 overflow-hidden animate-pulse">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-40 sm:h-auto bg-card/50 shrink-0" />
        <div className="flex-1 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="h-3 w-16 bg-border/60 rounded" />
            <div className="h-3 w-12 bg-border/60 rounded" />
            <div className="ml-auto h-3 w-14 bg-border/60 rounded" />
          </div>
          <div className="h-4 w-3/4 bg-border/60 rounded" />
          <div className="h-3 w-full bg-border/60 rounded" />
          <div className="h-3 w-2/3 bg-border/60 rounded" />
        </div>
      </div>
    </div>
  );
}

export function NewsEmptyState({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl p-12 bg-gradient-card/50 border border-border/40 text-center">
      <div className="w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center mx-auto mb-4">
        <Newspaper className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">No news available</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {message || "Check back later for the latest market news and updates."}
      </p>
    </div>
  );
}
