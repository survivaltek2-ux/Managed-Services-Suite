import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Loader2, Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui";
import { SchemaTag } from "@/components/SchemaTag";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.slug) {
      fetch(`/api/cms/blog/${params.slug}`)
        .then(r => r.ok ? r.json() : null)
        .then(setPost)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params?.slug]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!post) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-navy mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-4">This blog post doesn't exist or hasn't been published.</p>
        <Link href="/blog" className="text-primary hover:underline flex items-center gap-1 justify-center">
          <ArrowLeft className="w-4 h-4" />Back to Blog
        </Link>
      </div>
    </div>
  );

  return (
    <div className="py-20">
      <SchemaTag id="schema-article" type="Article"
        headline={post.title}
        datePublished={post.publishedAt || post.createdAt}
        author={post.author}
        image={post.coverImage}
        description={post.excerpt}
      />
      <SchemaTag id="schema-breadcrumb-blogpost" type="BreadcrumbList" crumbs={[
        { name: "Home", url: "https://siebertservices.com/" },
        { name: "Blog", url: "https://siebertservices.com/blog" },
        { name: post.title, url: `https://siebertservices.com/blog/${post.slug}` },
      ]} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/blog" className="text-sm text-primary hover:underline flex items-center gap-1 mb-8">
          <ArrowLeft className="w-4 h-4" />Back to Blog
        </Link>

        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} loading="lazy" className="w-full h-64 object-cover rounded-xl mb-8" />
        )}

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline">{post.category}</Badge>
          {post.featured && <Badge>Featured</Badge>}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
          <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>

        <div className="prose prose-navy max-w-none whitespace-pre-wrap">{post.content}</div>

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
