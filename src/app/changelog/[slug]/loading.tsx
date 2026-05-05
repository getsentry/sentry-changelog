import { LoadingArticle } from "@/client/components/article";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <LoadingArticle variant="light" />
      </div>
    </div>
  );
}
