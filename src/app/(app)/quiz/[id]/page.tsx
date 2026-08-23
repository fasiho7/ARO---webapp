import { QuizSession } from "@/components/quiz/QuizSession";

type QuizPlayPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuizPlayPage({ params }: QuizPlayPageProps) {
  const { id } = await params;
  return <QuizSession quizId={id} />;
}
