import Link from "next/link";
import { questionRepository } from "@/lib/repositories/question.repository";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Q&A",
  description: "Browse frequently asked questions and answers",
};

export default async function QnaPage() {
  const questions = await questionRepository.findRootQuestions("active");

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Q&A</h1>

      {questions.length === 0 ? (
        <p className="text-muted-foreground">No questions available yet.</p>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <Link key={question.id} href={`/qna/${question.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="flex-row items-center justify-between gap-4">
                  <CardTitle className="text-lg font-medium">
                    {question.rephrasedText || question.originalText}
                  </CardTitle>
                  <Badge variant="secondary">{question.status}</Badge>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
