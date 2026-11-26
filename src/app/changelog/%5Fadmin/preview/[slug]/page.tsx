import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/authOptions";
import { getChangelog } from "@/server/utils";
import { ChangelogArticle } from "../../../[slug]/changelogArticle";

// Admins preview entries here, including unpublished ones. Public entry pages
// on changelog.sentry.dev redirect to sentry.io, where the admin session
// cookie doesn't exist.
export default async function ChangelogPreview(props: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await getServerSession(authOptions))) {
    notFound();
  }
  const { slug } = await props.params;
  const changelog = await getChangelog(slug);
  if (!changelog) {
    notFound();
  }
  return <ChangelogArticle changelog={changelog} />;
}
