"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { MessageCircle, FileText, Sparkles } from "lucide-react";

interface Source {
  id: string;
  fileName: string;
}

interface Prompt {
  id: string;
  name: string;
  version: number;
  content: string;
}

interface Answer {
  id: string;
  version: number;
  content: string;
  isCurrent: boolean | null;
  createdAt: Date;
  sources: Source[] | null;
  prompt: Prompt | null;
}

interface AnswerVersionsProps {
  answers: Answer[];
}

export function AnswerVersions({ answers }: AnswerVersionsProps) {
  const currentAnswer = answers.find((a) => a.isCurrent === true);
  const [selectedVersion, setSelectedVersion] = useState<string>(
    currentAnswer?.version.toString() ?? answers[0]?.version.toString() ?? "1"
  );

  if (answers.length === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="py-8 text-center text-muted-foreground">
          No answer available yet.
        </CardContent>
      </Card>
    );
  }

  // If only one answer, show simple view without tabs
  if (answers.length === 1) {
    const answer = answers[0]!;
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Answer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Markdown content={answer.content} />

          {answer.sources && answer.sources.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" />
                Sources
              </h3>
              <ul className="space-y-2">
                {answer.sources.map((source) => (
                  <li key={source.id} className="text-sm text-muted-foreground">
                    {source.fileName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {answer.prompt && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4" />
                Prompt Used
              </h3>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {answer.prompt.name} v{answer.prompt.version}
                  </Badge>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs max-h-48 overflow-y-auto">
                  {answer.prompt.content}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Multiple answers - show tabs
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Answer
          <Badge variant="secondary" className="ml-2">
            {answers.length} versions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedVersion} onValueChange={setSelectedVersion}>
          <TabsList className="mb-4">
            {answers.map((answer) => (
              <TabsTrigger
                key={answer.id}
                value={answer.version.toString()}
                className="flex items-center gap-1"
              >
                v{answer.version}
                {answer.isCurrent && (
                  <Badge variant="default" className="ml-1 text-xs py-0 px-1">
                    current
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {answers.map((answer) => (
            <TabsContent key={answer.id} value={answer.version.toString()}>
              <Markdown content={answer.content} />

              {answer.sources && answer.sources.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4" />
                    Sources
                  </h3>
                  <ul className="space-y-2">
                    {answer.sources.map((source) => (
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

              {answer.prompt && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4" />
                    Prompt Used
                  </h3>
                  <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {answer.prompt.name} v{answer.prompt.version}
                      </Badge>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs max-h-48 overflow-y-auto">
                      {answer.prompt.content}
                    </pre>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
