import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Loader2, Calendar, User, ArrowRight, Tag } from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cms/blog")
      .then(r => r.ok ? r.json() : [])
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">Blog & News</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Latest updates, insights, and news from Siebert Services
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No blog posts published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {post.coverImage && (
                      <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-6 flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline">{post.category}</Badge>
                        {post.featured && <Badge>Featured</Badge>}
                      </div>
                      <h2 className="text-xl font-bold text-navy mb-2 hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
