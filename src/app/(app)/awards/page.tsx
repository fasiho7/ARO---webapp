import { AchievementCard } from "@/components/awards/AchievementCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { achievements } from "@/data/mock";

export default function AwardsPage() {
  const earned = achievements.filter((item) => item.earned);
  const locked = achievements.filter((item) => !item.earned);

  return (
    <div>
      <PageHeader
        title="Your Achievements"
        description="Milestones from learning, coding, and showing up."
      />
      <section>
        <h2 className="display mb-4 text-lg font-semibold">Earned</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {earned.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="display mb-4 text-lg font-semibold">Locked</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {locked.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </section>
    </div>
  );
}
