import Link from "next/link";
import { notFound } from "next/navigation";
import { questionRepository } from "@/lib/repositories/question.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { ChevronLeft, MessageCircle, FileText } from "lucide-react";

interface QnaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: QnaDetailPageProps) {
  const { id } = await params;
  const question = await questionRepository.findByIdWithCurrentAnswer(id);

  if (!question) {
    return { title: "Question Not Found" };
  }

  return {
    title: question.rephrasedText || question.originalText,
    description: question.originalText,
  };
}

export default async function QnaDetailPage({ params }: QnaDetailPageProps) {
  const { id } = await params;
  const [question, followUps] = await Promise.all([
    questionRepository.findByIdWithCurrentAnswer(id),
    questionRepository.findFollowUps(id),
  ]);

  if (!question) {
    notFound();
  }

  const currentAnswer = question.answers[0];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/qna"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Q&A
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold">
            {question.rephrasedText || question.originalText}
          </h1>
          <Badge variant="secondary">{question.status}</Badge>
        </div>

        {question.rephrasedText && question.rephrasedText !== question.originalText && (
          <p className="text-sm text-muted-foreground">
            Original: {question.originalText}
          </p>
        )}

        {question.questionTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {question.questionTags.map(({ tag }) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {currentAnswer ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Markdown content={currentAnswer.content} />

            {currentAnswer.sources && currentAnswer.sources.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4" />
                  Sources
                </h3>
                <ul className="space-y-2">
                  {currentAnswer.sources.map((source) => (
                    <li
                      key={source.id}
                      className="text-sm text-muted-foreground"
                    >
                      {source.fileName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="py-8 text-center text-muted-foreground">
            No answer available yet.
          </CardContent>
        </Card>
      )}

      {followUps.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Follow-up Questions</h2>
          <div className="grid gap-3">
            {followUps.map((followUp) => (
              <Link key={followUp.id} href={`/qna/${followUp.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base font-medium">
                      {followUp.rephrasedText || followUp.originalText}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
