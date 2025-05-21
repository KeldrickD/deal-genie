import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <h1 className="text-3xl font-bold mb-3">Blog Post Not Found</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        The blog post you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/blog" 
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
      >
        Browse All Blog Posts
      </Link>
    </div>
  );
} 