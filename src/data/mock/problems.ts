import type { Problem } from "./types";

const TWO_SUM_CPP = `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int need = target - nums[i];
            if (seen.count(need)) {
                return {seen[need], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`;

const TWO_SUM_PY = `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        need = target - n
        if need in seen:
            return [seen[need], i]
        seen[n] = i
    return []`;

export const problems: Problem[] = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    solved: true,
    attempted: true,
    acceptance: "89%",
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] == 6.",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    hints: [
      "A nested loop is O(n²). Can you remember what you have already seen?",
      "A hash map from value → index lets you find the complement in O(1).",
    ],
    starterCode: {
      "C++": TWO_SUM_CPP,
      Python: TWO_SUM_PY,
      Java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // write your solution
        return new int[]{};
    }
}`,
      JavaScript: `function twoSum(nums, target) {
  const seen = new Map();
  // write your solution
  return [];
}`,
    },
  },
  {
    slug: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    topic: "Strings",
    solved: true,
    attempted: true,
    acceptance: "94%",
    description:
      "Write a function that reverses a string. The input is given as an array of characters. You must do this in-place with O(1) extra memory.",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: "Swap from both ends until the pointers meet.",
      },
    ],
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
    hints: ["Use two pointers, one at each end."],
    starterCode: {
      "C++": `void reverseString(vector<char>& s) {\n    // two pointers\n}`,
      Python: `def reverse_string(s):\n    left, right = 0, len(s) - 1\n    # swap until they meet`,
    },
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "Medium",
    topic: "Searching",
    solved: false,
    attempted: true,
    acceptance: "71%",
    description:
      "Given a sorted array of integers nums and an integer target, return the index of target or -1 if it does not exist. Your algorithm must run in O(log n) time.",
    examples: [
      {
        input: "nums = [-1, 0, 3, 5, 9, 12], target = 9",
        output: "4",
        explanation: "9 exists at index 4.",
      },
    ],
    constraints: ["1 <= nums.length <= 10^4", "All values are unique and sorted."],
    hints: ["Keep a low and high bound. Mid = low + (high - low) // 2 avoids overflow."],
    starterCode: {
      "C++": `int search(vector<int>& nums, int target) {\n    int low = 0, high = nums.size() - 1;\n    return -1;\n}`,
      Python: `def search(nums, target):\n    low, high = 0, len(nums) - 1\n    return -1`,
    },
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    topic: "Arrays",
    solved: false,
    attempted: false,
    acceptance: "64%",
    description:
      "Given an integer array nums, find the subarray with the largest sum and return its sum. This is Kadane's algorithm.",
    examples: [
      {
        input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        output: "6",
        explanation: "The subarray [4, -1, 2, 1] has the largest sum 6.",
      },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    hints: ["Track the best sum ending at the current index."],
    starterCode: {
      "C++": `int maxSubArray(vector<int>& nums) {\n    return 0;\n}`,
      Python: `def max_sub_array(nums):\n    return 0`,
    },
  },
  {
    slug: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "Easy",
    topic: "Linked Lists",
    solved: true,
    attempted: true,
    acceptance: "82%",
    description:
      "Given the head of a linked list, return true if there is a cycle in the list.",
    examples: [
      {
        input: "head = [3, 2, 0, -4], pos = 1",
        output: "true",
        explanation: "There is a cycle connecting the tail back to index 1.",
      },
    ],
    constraints: ["The number of nodes is in the range [0, 10^4]."],
    hints: ["Floyd's tortoise and hare: two pointers at different speeds."],
    starterCode: {
      "C++": `bool hasCycle(ListNode *head) {\n    return false;\n}`,
      Python: `def has_cycle(head):\n    return False`,
    },
  },
  {
    slug: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    topic: "Trees",
    solved: false,
    attempted: false,
    acceptance: "78%",
    description: "Given the root of a binary tree, invert the tree and return its root.",
    examples: [
      {
        input: "root = [4, 2, 7, 1, 3, 6, 9]",
        output: "[4, 7, 2, 9, 6, 3, 1]",
        explanation: "Every left and right child is swapped.",
      },
    ],
    constraints: ["The number of nodes is in the range [0, 100]."],
    hints: ["Recurse on both children, then swap them."],
    starterCode: {
      "C++": `TreeNode* invertTree(TreeNode* root) {\n    return root;\n}`,
      Python: `def invert_tree(root):\n    return root`,
    },
  },
  {
    slug: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Hard",
    topic: "Graphs",
    solved: false,
    attempted: false,
    acceptance: "54%",
    description:
      "Given a 2D grid of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.",
    examples: [
      {
        input: 'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]',
        output: "2",
        explanation: "Two separate land components.",
      },
    ],
    constraints: ["1 <= rows, cols <= 300"],
    hints: ["DFS or BFS from each unvisited land cell, then mark the whole island."],
    starterCode: {
      "C++": `int numIslands(vector<vector<char>>& grid) {\n    return 0;\n}`,
      Python: `def num_islands(grid):\n    return 0`,
    },
  },
  {
    slug: "fibonacci-number",
    title: "Fibonacci Number",
    difficulty: "Easy",
    topic: "Recursion",
    solved: true,
    attempted: true,
    acceptance: "91%",
    description: "The Fibonacci numbers form a sequence where F(0) = 0, F(1) = 1, and F(n) = F(n - 1) + F(n - 2). Return F(n).",
    examples: [
      {
        input: "n = 4",
        output: "3",
        explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3.",
      },
    ],
    constraints: ["0 <= n <= 30"],
    hints: ["A recursive solution is fine for n <= 30. Memoize if you want to be tidy."],
    starterCode: {
      "C++": `int fib(int n) {\n    return 0;\n}`,
      Python: `def fib(n):\n    return 0`,
    },
  },
];

export function getProblem(slug: string): Problem | undefined {
  return problems.find((problem) => problem.slug === slug);
}
