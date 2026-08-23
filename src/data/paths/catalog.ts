import type {
  LearningPath,
  LearningPathId,
  LearningPathNode,
  LearningPathStage,
  PathDifficulty,
} from "./types";

let order = 0;

function resetOrder() {
  order = 0;
}

function topic(
  id: string,
  title: string,
  purpose: string,
  options: {
    time: string;
    difficulty?: PathDifficulty;
    coding?: string;
    prereq?: string[];
  },
): LearningPathNode {
  order += 1;
  return {
    id,
    order,
    title,
    purpose,
    estimatedTime: options.time,
    difficulty: options.difficulty ?? "Beginner",
    prerequisites: options.prereq ?? [],
    codingTopicSlug: options.coding,
  };
}

function stage(
  id: string,
  title: string,
  purpose: string,
  nodes: LearningPathNode[],
  stageOrder: number,
): LearningPathStage {
  return { id, order: stageOrder, title, purpose, nodes };
}

function path(
  id: LearningPathId,
  meta: Omit<LearningPath, "id" | "slug" | "nodes" | "stages">,
  stages: LearningPathStage[],
): LearningPath {
  return {
    id,
    slug: id,
    ...meta,
    stages,
    nodes: stages.flatMap((item) => item.nodes),
  };
}

resetOrder();
const pf = path(
  "pf",
  {
    shortName: "PF",
    title: "Programming Fundamentals",
    shortDescription:
      "How a program stores data, makes decisions, repeats work, and solves small problems.",
    difficulty: "Beginner",
    level: "Foundation",
    stopLabel: "FOUNDATION",
    arc: "Foundation → Core Programming → Problem Solving",
  },
  [
    stage("pf-foundation", "Foundation", "The first facts of writing a program.", [
      topic("programming-basics", "Programming Basics", "What a program is, how it runs, and how you read an error without panicking.", { time: "2–3 hours" }),
      topic("variables-data-types", "Variables & Data Types", "Store values and pick the right type for numbers, text, and flags.", { time: "3–4 hours", coding: "variables-data-types", prereq: ["programming-basics"] }),
      topic("input-output", "Input / Output", "Read values in and print a clear result out.", { time: "2–4 hours", coding: "input-output", prereq: ["variables-data-types"] }),
      topic("operators", "Operators", "Arithmetic, comparison, and logic — the small tools every condition and loop uses.", { time: "2–3 hours", prereq: ["variables-data-types"] }),
    ], 1),
    stage("pf-core", "Core Programming", "Control, reuse, and the first data structures.", [
      topic("conditions", "Conditions", "Branch with if/else so the program reacts to data.", { time: "3–4 hours", coding: "conditions", prereq: ["operators"] }),
      topic("loops", "Loops", "Repeat work with for and while until a condition ends.", { time: "3–5 hours", coding: "loops", prereq: ["conditions"] }),
      topic("functions", "Functions", "Split logic into named pieces with parameters and return values.", { time: "4–6 hours", coding: "functions", prereq: ["loops"] }),
      topic("scope", "Scope", "Where a name is visible, and why a local variable is not global.", { time: "2–3 hours", prereq: ["functions"] }),
      topic("arrays", "Arrays", "Store a sequence and walk it by index.", { time: "4–6 hours", coding: "arrays", prereq: ["loops"] }),
      topic("strings", "Strings", "Length, reverse, search, and compare text.", { time: "3–5 hours", coding: "strings", prereq: ["arrays"] }),
      topic("pointers", "Pointers", "Use addresses to read and update values indirectly.", { time: "4–6 hours", difficulty: "Intermediate", coding: "pointers", prereq: ["arrays"] }),
      topic("references", "References", "Alias an existing object instead of copying it.", { time: "2–3 hours", difficulty: "Intermediate", prereq: ["pointers"] }),
      topic("structures", "Structures", "Group related fields into one record.", { time: "3–4 hours", prereq: ["variables-data-types"] }),
    ], 2),
    stage("pf-solving", "Problem Solving", "Combine the pieces on small, complete tasks.", [
      topic("recursion", "Recursion", "Solve a problem by calling the same function on a smaller input.", { time: "4–6 hours", difficulty: "Intermediate", coding: "recursion", prereq: ["functions"] }),
      topic("file-handling", "File Handling", "Read and write files so a program can keep data after it exits.", { time: "3–4 hours", difficulty: "Intermediate", prereq: ["input-output"] }),
      topic("basic-problem-solving", "Basic Problem Solving", "Combine input, conditions, and loops on short worded tasks.", { time: "4–6 hours", coding: "basic-problem-solving", prereq: ["conditions", "loops", "functions"] }),
    ], 3),
  ],
);

resetOrder();
const oop = path(
  "oop",
  {
    shortName: "OOP",
    title: "Object-Oriented Programming",
    shortDescription:
      "Model programs as objects: state, behavior, reuse, and a safe public surface.",
    difficulty: "Intermediate",
    level: "Core",
    stopLabel: "CORE",
    arc: "OOP Foundations → Core OOP → Advanced OOP",
  },
  [
    stage("oop-foundations", "OOP Foundations", "Objects, lifetime, and hiding data.", [
      topic("oop-fundamentals", "OOP Fundamentals", "Why objects exist: bundle data with the operations that belong to it.", { time: "2–3 hours" }),
      topic("classes-objects", "Classes & Objects", "Define a class and create objects that hold state and behavior.", { time: "3–5 hours", coding: "classes-objects", prereq: ["oop-fundamentals"] }),
      topic("constructors", "Constructors", "Initialize an object safely when it is created.", { time: "3–4 hours", coding: "constructors", prereq: ["classes-objects"] }),
      topic("destructors", "Destructors", "Release what the object owns when it dies.", { time: "2–3 hours", coding: "destructors", prereq: ["constructors"] }),
      topic("encapsulation", "Encapsulation", "Hide internal data and expose a small, safe interface.", { time: "3–4 hours", coding: "encapsulation", prereq: ["classes-objects"] }),
      topic("access-modifiers", "Access Modifiers", "Public, private, and protected — who is allowed to touch a member.", { time: "2–3 hours", coding: "accessors-mutators", prereq: ["encapsulation"] }),
    ], 1),
    stage("oop-core", "Core OOP", "Reuse, relationships, and calling the right method.", [
      topic("static-members", "Static Members", "Data and functions that belong to the class, not one instance.", { time: "2–3 hours", prereq: ["classes-objects"] }),
      topic("composition", "Composition", "Build a type from other types instead of inheriting everything.", { time: "3–4 hours", prereq: ["classes-objects"] }),
      topic("inheritance", "Inheritance", "Reuse behavior by extending a base class — after classes and encapsulation.", { time: "4–6 hours", difficulty: "Intermediate", coding: "inheritance", prereq: ["encapsulation", "access-modifiers"] }),
      topic("function-overloading", "Function Overloading", "Same name, different parameter lists, chosen at compile time.", { time: "2–3 hours", prereq: ["classes-objects"] }),
      topic("operator-overloading", "Operator Overloading", "Give +, ==, or [] meaning for your type.", { time: "3–5 hours", difficulty: "Intermediate", coding: "operator-overloading", prereq: ["classes-objects"] }),
      topic("polymorphism", "Polymorphism", "Call the right method through a base interface.", { time: "4–6 hours", difficulty: "Intermediate", coding: "polymorphism", prereq: ["inheritance"] }),
    ], 2),
    stage("oop-advanced", "Advanced OOP", "Lifetime, copies, and design that stays honest.", [
      topic("virtual-functions", "Virtual Functions", "Dispatch to the actual object type at runtime.", { time: "4–6 hours", difficulty: "Intermediate", coding: "virtual-functions", prereq: ["polymorphism"] }),
      topic("abstract-classes", "Abstract Classes", "A base that cannot be constructed — only implemented.", { time: "3–4 hours", difficulty: "Intermediate", prereq: ["virtual-functions"] }),
      topic("interfaces-abstract-design", "Interfaces / Abstract Design", "Depend on a contract, not a concrete class.", { time: "3–5 hours", difficulty: "Intermediate", prereq: ["abstract-classes"] }),
      topic("dynamic-memory", "Dynamic Memory & Object Lifetime", "new/delete or equivalent, and who owns the pointer.", { time: "4–6 hours", difficulty: "Advanced", coding: "dynamic-memory", prereq: ["destructors"] }),
      topic("copy-constructor", "Copy Constructor", "Create an object from another object of the same type.", { time: "3–4 hours", difficulty: "Intermediate", prereq: ["constructors"] }),
      topic("deep-vs-shallow-copy", "Deep vs Shallow Copy", "Copy the pointer, or copy what it points to.", { time: "3–4 hours", difficulty: "Intermediate", prereq: ["copy-constructor", "dynamic-memory"] }),
      topic("exception-handling", "Exception Handling", "Fail in a controlled way instead of crashing mid-invariant.", { time: "3–5 hours", difficulty: "Intermediate", prereq: ["classes-objects"] }),
      topic("oop-problem-solving", "OOP Problem Solving", "Design a small model with classes, then implement it.", { time: "5–8 hours", difficulty: "Intermediate", prereq: ["inheritance", "encapsulation"] }),
    ], 3),
  ],
);

resetOrder();
const dsa = path(
  "dsa",
  {
    shortName: "DSA",
    title: "Data Structures & Algorithms",
    shortDescription:
      "Organize data and choose algorithms so solutions stay correct as they grow.",
    difficulty: "Advanced",
    level: "Interview-ready",
    stopLabel: "INTERVIEW",
    arc: "Data Structures → Algorithms → Problem Solving → Advanced DSA",
  },
  [
    stage("dsa-foundations", "Foundations", "Cost, arrays, strings, and the first scan patterns.", [
      topic("complexity-analysis", "Complexity Analysis", "Count work and memory so two solutions can be compared honestly.", { time: "3–4 hours" }),
      topic("big-o", "Big O", "The notation for worst-case growth — and what it is not.", { time: "2–3 hours", prereq: ["complexity-analysis"] }),
      topic("arrays", "Arrays", "Index-based sequences: scan, reverse, and windows.", { time: "4–6 hours", coding: "arrays", prereq: ["big-o"] }),
      topic("strings", "Strings", "Treat text as arrays of characters with the same scan tools.", { time: "3–5 hours", coding: "strings", prereq: ["arrays"] }),
      topic("two-pointers", "Two Pointers", "Two indexes that cooperate instead of nested loops.", { time: "4–6 hours", difficulty: "Intermediate", prereq: ["arrays"] }),
      topic("sliding-window", "Sliding Window", "Maintain a range as it moves across the array.", { time: "4–6 hours", difficulty: "Intermediate", prereq: ["two-pointers"] }),
      topic("prefix-sum", "Prefix Sum", "Precompute running totals so a range query is constant time.", { time: "3–4 hours", difficulty: "Intermediate", prereq: ["arrays"] }),
    ], 1),
    stage("dsa-linear", "Linear Data Structures", "Lists and the structures built on them.", [
      topic("linked-lists", "Linked Lists", "Nodes and pointers: insert, delete, and reverse.", { time: "4–6 hours", difficulty: "Intermediate", coding: "linked-lists", prereq: ["arrays"] }),
      topic("stacks", "Stacks", "Last in, first out — matching, undo, and evaluation.", { time: "3–4 hours", coding: "stacks", prereq: ["arrays"] }),
      topic("queues", "Queues", "First in, first out — the backbone of BFS later.", { time: "3–4 hours", coding: "queues", prereq: ["arrays"] }),
      topic("deques", "Deques", "Insert and remove at both ends.", { time: "2–3 hours", difficulty: "Intermediate", prereq: ["queues"] }),
    ], 2),
    stage("dsa-search-sort", "Searching & Sorting", "Find a value, then put the collection in order.", [
      topic("linear-search", "Linear Search", "Scan until you find it — and know when that is enough.", { time: "1–2 hours", coding: "searching", prereq: ["arrays"] }),
      topic("binary-search", "Binary Search", "Halve a sorted range until the answer is pinned.", { time: "4–6 hours", difficulty: "Intermediate", coding: "searching", prereq: ["linear-search", "arrays"] }),
      topic("basic-sorting", "Basic Sorting", "Bubble, insertion, selection — slow, but you see the swaps.", { time: "3–4 hours", coding: "sorting", prereq: ["arrays"] }),
      topic("merge-sort", "Merge Sort", "Divide, sort, merge — guaranteed n log n.", { time: "4–6 hours", difficulty: "Intermediate", coding: "sorting", prereq: ["basic-sorting"] }),
      topic("quick-sort", "Quick Sort", "Partition around a pivot; average n log n.", { time: "4–6 hours", difficulty: "Intermediate", coding: "sorting", prereq: ["basic-sorting"] }),
    ], 3),
    stage("dsa-recursion", "Recursion", "Call trees, then search trees of decisions.", [
      topic("recursion", "Recursion", "Base case, smaller case, combine. Draw the call tree.", { time: "4–6 hours", difficulty: "Intermediate", coding: "recursion", prereq: ["arrays"] }),
      topic("backtracking", "Backtracking", "Try, undo, try the next choice.", { time: "5–8 hours", difficulty: "Advanced", prereq: ["recursion"] }),
    ], 4),
    stage("dsa-trees", "Trees", "Hierarchy instead of a flat list.", [
      topic("binary-trees", "Binary Trees", "A node with at most two children.", { time: "4–6 hours", difficulty: "Intermediate", coding: "trees", prereq: ["linked-lists"] }),
      topic("tree-traversal", "Tree Traversal", "Preorder, inorder, postorder, and level order.", { time: "3–5 hours", difficulty: "Intermediate", coding: "trees", prereq: ["binary-trees"] }),
      topic("bst", "BST", "Search, insert, and delete in a binary search tree.", { time: "4–6 hours", difficulty: "Intermediate", coding: "trees", prereq: ["binary-trees"] }),
      topic("heap-priority-queue", "Heap / Priority Queue", "Always extract the current min or max.", { time: "4–6 hours", difficulty: "Intermediate", prereq: ["binary-trees"] }),
    ], 5),
    stage("dsa-hashing", "Hashing", "Average-constant lookup when the key is known.", [
      topic("hash-tables", "Hash Tables", "Hash, bucket, collision — the idea behind maps.", { time: "4–6 hours", difficulty: "Intermediate", coding: "hashing", prereq: ["arrays"] }),
      topic("sets-maps", "Sets / Maps", "Membership and key-value lookup as tools, not mysteries.", { time: "3–4 hours", coding: "hashing", prereq: ["hash-tables"] }),
      topic("frequency-hashing", "Frequency / Hashing Patterns", "Count, complement, and grouping with a map.", { time: "4–6 hours", difficulty: "Intermediate", prereq: ["sets-maps"] }),
    ], 6),
    stage("dsa-graphs", "Graphs", "Nodes, edges, and walking them in order.", [
      topic("graph-representation", "Graph Representation", "Adjacency list versus matrix, and when each is honest.", { time: "3–4 hours", difficulty: "Intermediate", coding: "graphs", prereq: ["linked-lists"] }),
      topic("bfs", "BFS", "Layer by layer from a source — shortest unweighted path.", { time: "4–6 hours", difficulty: "Intermediate", coding: "graphs", prereq: ["graph-representation", "queues"] }),
      topic("dfs", "DFS", "Go deep, then backtrack. Recursion or an explicit stack.", { time: "4–6 hours", difficulty: "Intermediate", coding: "graphs", prereq: ["graph-representation"] }),
      topic("shortest-path", "Shortest Path", "Dijkstra and when weights change the story.", { time: "5–8 hours", difficulty: "Advanced", coding: "graphs", prereq: ["bfs", "heap-priority-queue"] }),
      topic("topological-sort", "Topological Sort", "Order a DAG so every edge goes forward.", { time: "3–5 hours", difficulty: "Advanced", coding: "graphs", prereq: ["dfs"] }),
    ], 7),
    stage("dsa-advanced", "Advanced", "Strategy, overlapping subproblems, and mixed problems.", [
      topic("greedy", "Greedy Algorithms", "The local best choice — and the proof it is enough, or not.", { time: "4–6 hours", difficulty: "Advanced", prereq: ["graph-representation"] }),
      topic("dynamic-programming", "Dynamic Programming", "Overlapping subproblems with a table instead of recomputation.", { time: "8–12 hours", difficulty: "Advanced", coding: "dynamic-programming", prereq: ["recursion"] }),
      topic("advanced-problem-solving", "Advanced Problem Solving", "Pick a structure and an algorithm for a worded interview task.", { time: "8–12 hours", difficulty: "Advanced", prereq: ["dynamic-programming", "shortest-path"] }),
    ], 8),
  ],
);

export const learningPaths: LearningPath[] = [pf, oop, dsa];
