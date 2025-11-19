import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - NetSon Cúp Vinh Danh",
  description:
    "Khám phá blog về cúp vinh danh, giải pháp chế tác các loại cúp, huy chương chuyên nghiệp. Chia sẻ kinh nghiệm và xu hướng ngành.",
  keywords: "blog cúp vinh danh, chế tác cúp, huy chương, blog NetSon",
};

interface Article {
  id: number;
  title: string;
  excerpt?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  author: string;
  published_at?: string;
  featured: boolean;
  view_count: number;
  reading_time_minutes?: number;
  category?: string;
  tags?: string[];
  created_at: string;
}

interface BlogPageProps {
  searchParams: {
    page?: string;
    search?: string;
    category?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const category = searchParams.category || "";

  // Build API URL with query params
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "12",
  });

  if (search) {
    params.append("search", search);
  }

  // Fetch articles
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/articles?${params}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }

  const data = await response.json();
  const articles: Article[] = data.articles || [];
  const pagination = data.pagination;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog NetSon
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá thế giới cúp vinh danh và giải pháp chế tác chuyên
              nghiệp. Chia sẻ kinh nghiệm và xu hướng ngành sản xuất cúp, huy
              chương.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <form method="GET" className="flex gap-2">
              <input
                type="text"
                name="search"
                placeholder="Tìm kiếm bài viết..."
                defaultValue={search}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Articles */}
        {articles.filter((article) => article.featured).length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Bài viết nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles
                .filter((article) => article.featured)
                .slice(0, 3)
                .map((article) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {article.og_image && (
                      <div className="aspect-video relative">
                        <Image
                          src={article.og_image}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {article.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                          {article.category}
                        </span>
                      )}
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link
                          href={`/blog/${article.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{article.author}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {formatDate(
                            article.published_at || article.created_at
                          )}
                        </span>
                        {article.reading_time_minutes && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{article.reading_time_minutes} phút đọc</span>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {search ? `Kết quả cho "${search}"` : "Tất cả bài viết"}
            </h2>
            {search && (
              <Link href="/blog" className="text-blue-600 hover:text-blue-800">
                Xem tất cả
              </Link>
            )}
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {search
                  ? "Không tìm thấy bài viết nào phù hợp."
                  : "Chưa có bài viết nào."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {article.og_image && (
                    <div className="aspect-video relative">
                      <Image
                        src={article.og_image}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {article.category && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                        {article.category}
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <span>{article.author}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {formatDate(
                            article.published_at || article.created_at
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {article.reading_time_minutes && (
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
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
                            {article.reading_time_minutes}min
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
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
                          {article.view_count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              {/* Previous Button */}
              {pagination.hasPrev ? (
                <Link
                  href={{
                    pathname: "/blog",
                    query: {
                      ...searchParams,
                      page: (page - 1).toString(),
                    },
                  }}
                  className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  ‹ Trước
                </Link>
              ) : (
                <span className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
                  ‹ Trước
                </span>
              )}

              {/* Page Numbers */}
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) +
                    i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <Link
                      key={pageNum}
                      href={{
                        pathname: "/blog",
                        query: {
                          ...searchParams,
                          page: pageNum.toString(),
                        },
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pageNum === page
                          ? "bg-blue-600 text-white border border-blue-600"
                          : "border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                }
              )}

              {/* Next Button */}
              {pagination.hasNext ? (
                <Link
                  href={{
                    pathname: "/blog",
                    query: {
                      ...searchParams,
                      page: (page + 1).toString(),
                    },
                  }}
                  className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Sau ›
                </Link>
              ) : (
                <span className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
                  Sau ›
                </span>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Categories/Categories could be added here */}
    </div>
  );
}
