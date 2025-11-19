import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/articles/${params.slug}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        title: "Bài viết không tìm thấy - NetSon",
        description: "Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.",
      };
    }

    const article = await response.json();

    const title = article.meta_title || article.title || "Blog NetSon";
    const description =
      article.meta_description ||
      article.excerpt ||
      "Khám phá blog về cúp vinh danh và chế tác chuyên nghiệp của NetSon.";
    const keywords = article.keywords || "cúp vinh danh, chế tác cúp, NetSon";
    const ogImage =
      article.og_image ||
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/og-default.jpg`;

    return {
      title,
      description,
      keywords,
      authors: [{ name: article.author || "NetSon" }],
      openGraph: {
        title,
        description,
        url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/blog/${params.slug}`,
        siteName: "NetSon Cúp Vinh Danh",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: article.title || "NetSon Blog",
          },
        ],
        locale: "vi_VN",
        type: "article",
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at || article.created_at,
        authors: [article.author || "NetSon"],
        tags: article.tags || [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
      robots: {
        index: article.is_published,
        follow: true,
        googleBot: {
          index: article.is_published,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog NetSon - Cúp Vinh Danh Chuyên Nghiệp",
      description: "Khám phá blog về cúp vinh danh và chế tác chuyên nghiệp.",
    };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/articles/${params.slug}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      notFound();
    }

    const article = await response.json();

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Structured Data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.meta_description || article.excerpt,
      image: article.og_image,
      datePublished: article.published_at || article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: {
        "@type": "Person",
        name: article.author || "NetSon",
      },
      publisher: {
        "@type": "Organization",
        name: "NetSon",
        logo: {
          "@type": "ImageObject",
          url: `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/blog/${params.slug}`,
      },
      keywords: article.keywords,
      articleSection: article.category,
      wordCount: article.content.replace(/<[^>]*>/g, "").split(/\s+/).length,
    };

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <div className="min-h-screen bg-gray-50">
          {/* Breadcrumb */}
          <div className="bg-white border-b">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link
                      href="/"
                      className="text-gray-400 hover:text-gray-500"
                    >
                      Trang chủ
                    </Link>
                  </li>
                  <li>
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="text-gray-400 hover:text-gray-500"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </li>
                  <li className="text-gray-500 truncate">{article.title}</li>
                </ol>
              </nav>
            </div>
          </div>

          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Article Header */}
            <header className="mb-8">
              {article.category && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {article.category}
                  </span>
                </div>
              )}

              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-8">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{article.author}</span>
                </div>

                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h2a2 2 0 012 2v4m-6 4V7a2 2 0 012-2h2a2 2 0 012 2v4m0 4v4a2 2 0 01-2 2H10a2 2 0 01-2-2v-4"
                    />
                  </svg>
                  <span>
                    {formatDate(article.published_at || article.created_at)}
                  </span>
                </div>

                {article.reading_time_minutes && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{article.reading_time_minutes} phút đọc</span>
                  </div>
                )}

                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{article.view_count.toLocaleString()} lượt xem</span>
                </div>

                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    {article.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {article.og_image && (
              <div className="mb-8">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={article.og_image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-blockquote:text-gray-600 prose-blockquote:border-gray-300">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-gray-500 text-sm">
                    Xuất bản vào{" "}
                    {formatDate(article.published_at || article.created_at)}
                  </p>
                  {article.updated_at &&
                    article.updated_at !== article.created_at && (
                      <p className="text-gray-500 text-sm">
                        Cập nhật lần cuối vào {formatDate(article.updated_at)}
                      </p>
                    )}
                </div>

                {/* Share links */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Chia sẻ:</span>
                  <div className="flex gap-2">
                    {/* Facebook share */}
                    <Link
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        `http://localhost:3000${
                          typeof window !== "undefined"
                            ? window.location.pathname
                            : `/blog/${params.slug}`
                        }`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </Link>
                    {/* Twitter share */}
                    <Link
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        `http://localhost:3000${
                          typeof window !== "undefined"
                            ? window.location.pathname
                            : `/blog/${params.slug}`
                        }`
                      )}&text=${encodeURIComponent(article.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </article>

          {/* Navigation */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-8 border-t border-gray-200">
              <Link
                href="/blog"
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Quay lại Blog
              </Link>

              <Link
                href="/#contact"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Liên hệ NetSon
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching article:", error);
    notFound();
  }
}
