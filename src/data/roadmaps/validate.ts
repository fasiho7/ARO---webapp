import type { CareerRoadmap } from "./types";

export type RoadmapValidationIssue = {
  careerId?: string;
  message: string;
};

export type RoadmapValidationResult = {
  ok: boolean;
  issues: RoadmapValidationIssue[];
  stats: Array<{
    id: string;
    title: string;
    stages: number;
    topics: number;
    projects: number;
    milestones: number;
  }>;
};

function add(
  issues: RoadmapValidationIssue[],
  message: string,
  careerId?: string,
) {
  issues.push({ careerId, message });
}

function hasCycle(nodes: string[], edges: Array<[string, string]>): boolean {
  const incoming = new Map<string, number>(nodes.map((id) => [id, 0]));
  const outgoing = new Map<string, string[]>(nodes.map((id) => [id, []]));
  for (const [from, to] of edges) {
    if (!incoming.has(from) || !incoming.has(to)) {
      continue;
    }
    outgoing.get(from)?.push(to);
    incoming.set(to, (incoming.get(to) ?? 0) + 1);
  }
  const queue = nodes.filter((id) => (incoming.get(id) ?? 0) === 0);
  let seen = 0;
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    seen += 1;
    for (const next of outgoing.get(current) ?? []) {
      const remaining = (incoming.get(next) ?? 0) - 1;
      incoming.set(next, remaining);
      if (remaining === 0) {
        queue.push(next);
      }
    }
  }
  return seen !== nodes.length;
}

export function validateRoadmaps(
  careers: CareerRoadmap[],
): RoadmapValidationResult {
  const issues: RoadmapValidationIssue[] = [];
  const careerIds = new Set<string>();
  const slugs = new Set<string>();
  const globalIds = new Set<string>();

  const claim = (id: string, careerId: string, label: string) => {
    if (!id.trim()) {
      add(issues, `${label} is missing an id.`, careerId);
      return;
    }
    if (globalIds.has(id)) {
      add(issues, `Duplicate id "${id}" (${label}).`, careerId);
      return;
    }
    globalIds.add(id);
  };

  for (const career of careers) {
    if (careerIds.has(career.id)) {
      add(issues, `Duplicate career id "${career.id}".`, career.id);
    }
    careerIds.add(career.id);
    if (slugs.has(career.slug)) {
      add(issues, `Duplicate career slug "${career.slug}".`, career.id);
    }
    slugs.add(career.slug);
    claim(career.id, career.id, "career");

    if (career.stages.length === 0) {
      add(issues, "Career has no stages.", career.id);
    }
    if (career.projects.length === 0) {
      add(issues, "Career has no projects.", career.id);
    }
    if (career.milestones.length === 0) {
      add(issues, "Career has no milestones.", career.id);
    }

    const stageIds = new Set(career.stages.map((stage) => stage.id));
    const topicIds = new Set(
      career.stages.flatMap((stage) => stage.topics.map((topic) => topic.id)),
    );
    const projectIds = new Set(career.projects.map((project) => project.id));
    const milestoneIds = new Set(
      career.milestones.map((milestone) => milestone.id),
    );
    const knownIds = new Set([
      ...stageIds,
      ...topicIds,
      ...projectIds,
      ...milestoneIds,
    ]);

    const orderedStages = [...career.stages].sort((a, b) => a.order - b.order);
    orderedStages.forEach((stage, index) => {
      if (stage.order !== orderedStages[index]?.order) {
        return;
      }
      if (index > 0 && stage.order <= (orderedStages[index - 1]?.order ?? -1)) {
        add(
          issues,
          `Stage order is not strictly increasing around "${stage.id}".`,
          career.id,
        );
      }
    });

    const stageEdges: Array<[string, string]> = [];
    const topicEdges: Array<[string, string]> = [];
    const seenTopicTitles = new Map<string, string>();

    for (const stage of career.stages) {
      claim(stage.id, career.id, "stage");
      if (stage.careerId !== career.id) {
        add(issues, `Stage "${stage.id}" has the wrong careerId.`, career.id);
      }
      if (stage.topics.length === 0) {
        add(issues, `Stage "${stage.id}" has no topics.`, career.id);
      }
      for (const prereq of stage.prerequisites) {
        if (!stageIds.has(prereq) && !topicIds.has(prereq)) {
          add(
            issues,
            `Stage "${stage.id}" prerequisite "${prereq}" does not exist.`,
            career.id,
          );
        } else if (stageIds.has(prereq)) {
          stageEdges.push([prereq, stage.id]);
        }
      }
      if (stage.milestoneId && !milestoneIds.has(stage.milestoneId)) {
        add(
          issues,
          `Stage "${stage.id}" milestone "${stage.milestoneId}" does not exist.`,
          career.id,
        );
      }
      for (const projectId of stage.projectIds) {
        if (!projectIds.has(projectId)) {
          add(
            issues,
            `Stage "${stage.id}" project "${projectId}" does not exist.`,
            career.id,
          );
        }
      }

      const orderedTopics = [...stage.topics].sort((a, b) => a.order - b.order);
      orderedTopics.forEach((topic, index) => {
        if (
          index > 0 &&
          topic.order <= (orderedTopics[index - 1]?.order ?? -1)
        ) {
          add(
            issues,
            `Topic order is not strictly increasing in stage "${stage.id}".`,
            career.id,
          );
        }
      });

      for (const topic of stage.topics) {
        claim(topic.id, career.id, "topic");
        if (topic.stageId !== stage.id) {
          add(
            issues,
            `Topic "${topic.id}" has the wrong stageId.`,
            career.id,
          );
        }
        const titleKey = `${stage.id}:${topic.title.trim().toLowerCase()}`;
        if (seenTopicTitles.has(titleKey)) {
          add(
            issues,
            `Duplicate topic title "${topic.title}" in stage "${stage.id}".`,
            career.id,
          );
        }
        seenTopicTitles.set(titleKey, topic.id);
        for (const prereq of topic.prerequisites) {
          if (!knownIds.has(prereq) && !stageIds.has(prereq) && !topicIds.has(prereq)) {
            add(
              issues,
              `Topic "${topic.id}" prerequisite "${prereq}" does not exist.`,
              career.id,
            );
          } else if (topicIds.has(prereq)) {
            topicEdges.push([prereq, topic.id]);
          }
        }
      }
    }

    for (const project of career.projects) {
      claim(project.id, career.id, "project");
      if (project.careerId !== career.id) {
        add(issues, `Project "${project.id}" has the wrong careerId.`, career.id);
      }
      if (project.stageId && !stageIds.has(project.stageId)) {
        add(
          issues,
          `Project "${project.id}" stage "${project.stageId}" does not exist.`,
          career.id,
        );
      }
    }

    for (const item of career.milestones) {
      claim(item.id, career.id, "milestone");
      if (item.careerId !== career.id) {
        add(issues, `Milestone "${item.id}" has the wrong careerId.`, career.id);
      }
      for (const stageId of item.stageIds) {
        if (!stageIds.has(stageId)) {
          add(
            issues,
            `Milestone "${item.id}" stage "${stageId}" does not exist.`,
            career.id,
          );
        }
      }
    }

    if (hasCycle([...stageIds], stageEdges)) {
      add(issues, "Stage prerequisites contain a cycle.", career.id);
    }
    if (hasCycle([...topicIds], topicEdges)) {
      add(issues, "Topic prerequisites contain a cycle.", career.id);
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    stats: careers.map((career) => ({
      id: career.id,
      title: career.title,
      stages: career.stages.length,
      topics: career.stages.reduce((sum, stage) => sum + stage.topics.length, 0),
      projects: career.projects.length,
      milestones: career.milestones.length,
    })),
  };
}

export function assertValidRoadmaps(careers: CareerRoadmap[]) {
  const result = validateRoadmaps(careers);
  if (!result.ok) {
    const details = result.issues
      .map((issue) => `- [${issue.careerId ?? "global"}] ${issue.message}`)
      .join("\n");
    throw new Error(`Roadmap validation failed:\n${details}`);
  }
  return result;
}
