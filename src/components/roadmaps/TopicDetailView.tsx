"use client";

import { RoadmapBreadcrumbs } from "@/components/roadmaps/RoadmapBreadcrumbs";
import { useRoadmapProgress } from "@/components/roadmaps/useRoadmapProgress";
import { UpgradePrompt } from "@/components/access/UpgradePrompt";
import { usePlan } from "@/components/access/usePlan";
import { Badge, difficultyTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type {
  CareerRoadmap,
  RoadmapStage,
  RoadmapTopic,
} from "@/data/roadmaps/types";
import {
  ACCESS_COPY,
  canAccessRoadmapContent,
} from "@/lib/access";
import {
  codingHrefFromHint,
  skillTrackForStage,
  skillTrackHref,
  skillTrackLabel,
} from "@/lib/skillTracks";

export function TopicDetailView({
  career,
  stage,
  topic,
}: {
  career: CareerRoadmap;
  stage: RoadmapStage;
  topic: RoadmapTopic;
}) {
  const { store, setStatus } = useRoadmapProgress();
  const { plan } = usePlan();
  const allowed = canAccessRoadmapContent(plan, topic.difficulty);
  const complete = store.records.some(
    (record) =>
      record.careerId === career.id &&
      record.topicId === topic.id &&
      record.status === "completed",
  );

  const practiceHref = codingHrefFromHint(topic.practice.codingHint);
  const track = skillTrackForStage(stage);

  return (
    <div>
      <RoadmapBreadcrumbs
        items={[
          { label: "Roadmaps", href: "/roadmaps" },
          { label: career.title, href: `/roadmaps/${career.slug}` },
          { label: stage.title, href: `/roadmaps/${career.slug}/${stage.id}` },
          { label: topic.title },
        ]}
      />
      <div>
        <p className="font-mono text-xs text-teal">
          {career.title} · Stage {stage.order}
        </p>
        <h1 className="display mt-2 text-3xl font-semibold">{topic.title}</h1>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={difficultyTone(topic.difficulty)}>{topic.difficulty}</Badge>
        <Badge>{topic.estimatedTime}</Badge>
      </div>
      {!allowed ? (
        <div className="mt-8">
          <UpgradePrompt
            title="This topic is on Pro"
            description={ACCESS_COPY.roadmap}
          />
        </div>
      ) : (
        <>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
        {topic.description}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="display text-sm font-semibold">Skills learned</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topic.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="display text-sm font-semibold">Practice</h2>
          <p className="mt-2 font-mono text-[11px] text-teal uppercase">
            {topic.practice.kind}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {topic.practice.summary}
          </p>
          {practiceHref ? (
            <Button className="mt-4" size="sm" href={practiceHref}>
              Practice
            </Button>
          ) : null}
          {track ? (
            <Button
              className="mt-4 ml-2"
              size="sm"
              variant="secondary"
              href={skillTrackHref(track)}
            >
              {skillTrackLabel(track)}
            </Button>
          ) : null}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="display text-sm font-semibold">You are ready when</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {topic.completionCriteria.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          href={`/roadmaps/${career.slug}/${stage.id}`}
          variant="secondary"
        >
          Back to stage
        </Button>
        {!complete ? (
          <Button
            variant="secondary"
            onClick={() =>
              setStatus(career, { topicId: topic.id }, "in_progress")
            }
          >
            Mark in progress
          </Button>
        ) : null}
        <Button
          variant={complete ? "secondary" : "primary"}
          onClick={() =>
            setStatus(
              career,
              { topicId: topic.id },
              complete ? "not_started" : "completed",
            )
          }
        >
          {complete ? "Mark incomplete" : "Mark topic complete"}
        </Button>
      </div>
        </>
      )}
    </div>
  );
}
