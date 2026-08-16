import { notFound } from "next/navigation";

import { TheoryPage } from "@/components/theory/theory-page";
import { TopicPage } from "@/components/theory/topic/topic-page";
import { requireClientSession } from "@/lib/server/client-session";
import { getTheoryOverviewData } from "@/lib/server/theory/theory-overview-service";
import { getGermanTheoryTopicPageData } from "@/lib/server/theory/theory-topic-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TheoryTopicRoute({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: rawTopic } = await params;
  const topicSlug = decodeURIComponent(rawTopic).trim();

  if (!topicSlug) notFound();

  const overview = await getTheoryOverviewData();

  if (overview.status !== "ready") {
    return <TheoryPage data={overview} />;
  }

  const session = await requireClientSession();
  const topic = await getGermanTheoryTopicPageData({
    userId: session.user.id,
    locale: session.user.preferredLocale,
    topicSlug,
  });

  if (!topic) notFound();

  return <TopicPage topic={topic} />;
}
