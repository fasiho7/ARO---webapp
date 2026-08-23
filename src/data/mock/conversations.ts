import type { Conversation } from "./types";

export const suggestedTopics = [
  "Programming Fundamentals",
  "OOP",
  "DSA",
  "Operating Systems",
  "DBMS",
  "Computer Networks",
  "Digital Logic",
] as const;

export const tutorActions = ["Explain", "Hint", "Quiz", "Practice"] as const;

export const conversations: Conversation[] = [
  {
    id: "pointers-in-c",
    title: "Pointers in C",
    updated: "2h ago",
    messages: [
      {
        id: "m1",
        role: "user",
        blocks: [{ type: "text", text: "Can you explain pointers in C?" }],
      },
      {
        id: "m2",
        role: "assistant",
        blocks: [
          {
            type: "text",
            text: "Absolutely. Think of a pointer as a variable that stores the memory address of another variable.",
          },
          {
            type: "code",
            language: "c",
            code: `int value = 42;
int *ptr = &value;

printf("%d\\n", *ptr);  /* prints 42 */
printf("%p\\n", (void*)ptr);  /* address of value */`,
          },
          {
            type: "tryThis",
            prompt: "What does *ptr do if ptr holds the address of value? Trace the two printf lines before you run them.",
          },
        ],
      },
    ],
  },
  {
    id: "oop-concepts",
    title: "OOP concepts",
    updated: "Yesterday",
    messages: [
      {
        id: "m3",
        role: "user",
        blocks: [{ type: "text", text: "What is encapsulation, in one example?" }],
      },
      {
        id: "m4",
        role: "assistant",
        blocks: [
          {
            type: "text",
            text: "Encapsulation is keeping data private and exposing only safe operations. A BankAccount hides its balance and only changes it through deposit() and withdraw().",
          },
        ],
      },
    ],
  },
  {
    id: "recursion-help",
    title: "Recursion help",
    updated: "3d ago",
    messages: [
      {
        id: "m5",
        role: "user",
        blocks: [{ type: "text", text: "I keep overflowing the stack on factorial." }],
      },
      {
        id: "m6",
        role: "assistant",
        blocks: [
          {
            type: "text",
            text: "Check the base case first. If n == 0 is missing, factorial never stops. Also make sure you return n * factorial(n - 1), not factorial(n).",
          },
        ],
      },
    ],
  },
  {
    id: "dsa-preparation",
    title: "DSA preparation",
    updated: "Last week",
    messages: [
      {
        id: "m7",
        role: "user",
        blocks: [{ type: "text", text: "What should I study this week for arrays?" }],
      },
      {
        id: "m8",
        role: "assistant",
        blocks: [
          {
            type: "text",
            text: "Two Sum, prefix sums, sliding window, and then two pointers. Solve one easy and one medium each day.",
          },
        ],
      },
    ],
  },
];

export const mockTutorReply: Conversation["messages"][number]["blocks"] = [
  {
    type: "text",
    text: "Good question. Let's break it into a smaller piece, then try a short example so it sticks.",
  },
  {
    type: "tryThis",
    prompt: "Explain the idea back to me in one sentence, then try a tiny example on paper.",
  },
];
