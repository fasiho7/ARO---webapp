const TOPICS = [
  {
    id: "pf",
    label: "Programming Fundamentals",
    aliases: ["programming fundamentals", "pf"],
    subtopics: [
      { id: "variables", label: "Variables & Data Types" },
      { id: "conditions", label: "Conditions" },
      { id: "loops", label: "Loops" },
      { id: "functions", label: "Functions" },
      { id: "arrays", label: "Arrays" },
      { id: "strings", label: "Strings" },
    ],
  },
  {
    id: "oop",
    label: "Object-Oriented Programming",
    aliases: ["object-oriented programming", "oop"],
    subtopics: [
      { id: "classes", label: "Classes & Objects" },
      { id: "constructors", label: "Constructors" },
      { id: "encapsulation", label: "Encapsulation" },
      { id: "inheritance", label: "Inheritance" },
      { id: "polymorphism", label: "Polymorphism" },
      { id: "abstraction", label: "Abstraction" },
    ],
  },
  {
    id: "dsa",
    label: "Data Structures & Algorithms",
    aliases: ["data structures & algorithms", "data structures and algorithms", "dsa"],
    subtopics: [
      { id: "arrays", label: "Arrays" },
      { id: "linked-lists", label: "Linked Lists" },
      { id: "stacks", label: "Stacks" },
      { id: "queues", label: "Queues" },
      { id: "trees", label: "Trees" },
      { id: "searching", label: "Searching" },
      { id: "sorting", label: "Sorting" },
      { id: "complexity", label: "Complexity" },
    ],
  },
];

const ALL_TOPIC = {
  id: "all",
  label: "All Topics",
  aliases: ["all", "all topics"],
};

const FREE_COUNTS = [5, 10];
const PRO_COUNTS = [5, 10, 15, 20, 30];
const TIMERS = [5, 10, 15, 20, 30];
const FREE_DIFFICULTIES = ["easy", "mixed"];
const PRO_DIFFICULTIES = ["easy", "medium", "hard", "mixed"];

function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ");
}

function resolveTopic(value) {
  const key = normalizeKey(value);
  if (!key) {
    return null;
  }
  if (ALL_TOPIC.aliases.includes(key) || key === "all") {
    return ALL_TOPIC;
  }
  return TOPICS.find((topic) => topic.id === key || topic.aliases.includes(key)) ?? null;
}

function resolveSubtopic(topic, value) {
  if (value == null || value === "" || normalizeKey(value) === "all") {
    return { id: null, label: "All subtopics" };
  }
  if (!topic || topic.id === "all") {
    for (const item of TOPICS) {
      const found = item.subtopics.find(
        (sub) => sub.id === normalizeKey(value).replace(/\s+/g, "-") || normalizeKey(sub.label) === normalizeKey(value),
      );
      if (found) {
        return found;
      }
    }
    return null;
  }
  const key = normalizeKey(value).replace(/\s+/g, "-");
  return (
    topic.subtopics.find(
      (sub) => sub.id === key || normalizeKey(sub.label) === normalizeKey(value),
    ) ?? null
  );
}

function publicCatalog() {
  return {
    topics: [
      { id: ALL_TOPIC.id, label: ALL_TOPIC.label, subtopics: [] },
      ...TOPICS.map((topic) => ({
        id: topic.id,
        label: topic.label,
        subtopics: topic.subtopics.map((sub) => ({ id: sub.id, label: sub.label })),
      })),
    ],
  };
}

module.exports = {
  TOPICS,
  ALL_TOPIC,
  FREE_COUNTS,
  PRO_COUNTS,
  TIMERS,
  FREE_DIFFICULTIES,
  PRO_DIFFICULTIES,
  resolveTopic,
  resolveSubtopic,
  publicCatalog,
};
