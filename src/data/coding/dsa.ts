import { makeProblem } from "./build";
import type { CodingTrack } from "./types";

export const dsaTrack: CodingTrack = {
  id: "dsa",
  slug: "dsa",
  shortName: "DSA",
  title: "Data Structures & Algorithms",
  description: "Learn algorithms and data structures through practical problems.",
  topics: [
    {
      slug: "arrays",
      title: "Arrays",
      description: "Index-based sequences: scan, reverse, and sliding windows.",
      difficulty: "Beginner",
      problems: [
        makeProblem(
          1,
          "find-maximum",
          "Find Maximum Element",
          "Easy",
          "Return the largest value in an array of integers.",
          [
            "Think about how you can keep track of the largest value.",
            "Start with the first element as the current max, then scan the rest.",
          ],
          {
            description:
              "Given n integers, print the maximum value. The list is not empty.",
            ioFormat:
              "Input:\nFirst line: n\nSecond line: n integers\n\nOutput:\nThe maximum integer.",
            sampleStdin: "5\n1 4 2 9 3",
            examples: [
              {
                input: "5\n1 4 2 9 3",
                output: "9",
                explanation: "9 is the largest value in the list.",
              },
              {
                input: "3\n-5 -1 -8",
                output: "-1",
                explanation: "Among negatives, -1 is the largest.",
              },
            ],
            constraints: [
              "1 <= n <= 10^5",
              "-10^9 <= each value <= 10^9",
              "Read from stdin and write the answer to stdout.",
            ],
          },
        ),
        makeProblem(
          2,
          "reverse-an-array",
          "Reverse an Array",
          "Easy",
          "Reverse the array in place and return it.",
          ["Use two pointers, one at each end.", "Swap until the pointers meet."],
          {
            ioFormat:
              "Input:\nFirst line: n\nSecond line: n integers\n\nOutput:\nThe reversed values on one line.",
            sampleStdin: "4\n1 2 3 4",
            examples: [
              {
                input: "4\n1 2 3 4",
                output: "4 3 2 1",
              },
            ],
            constraints: [
              "1 <= n <= 10^5",
              "Read from stdin and write the answer to stdout.",
            ],
          },
        ),
        makeProblem(
          3,
          "remove-duplicates",
          "Remove Duplicates",
          "Easy",
          "From a sorted array, remove duplicates in place and return the new length.",
          ["Because it is sorted, duplicates sit next to each other.", "A slow pointer can write unique values."],
          {
            ioFormat:
              "Input:\nFirst line: n\nSecond line: n sorted integers\n\nOutput:\nThe count of unique values.",
            sampleStdin: "5\n1 1 2 2 3",
            examples: [
              {
                input: "5\n1 1 2 2 3",
                output: "3",
              },
            ],
            constraints: [
              "1 <= n <= 10^4",
              "The array is sorted in non-decreasing order.",
              "Read from stdin and write the answer to stdout.",
            ],
          },
        ),
        makeProblem(
          4,
          "two-sum",
          "Two Sum",
          "Easy",
          "Return the indices of two numbers that add up to target.",
          ["A nested loop is O(n²).", "A hash map from value to index finds the complement in one pass."],
          {
            description:
              "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Each input has exactly one solution. You may not use the same element twice.",
            ioFormat:
              "Input:\nFirst line: n target\nSecond line: n integers\n\nOutput:\nTwo indices on one line.",
            sampleStdin: "4 9\n2 7 11 15",
            examples: [
              {
                input: "4 9\n2 7 11 15",
                output: "0 1",
                explanation: "nums[0] + nums[1] == 9.",
              },
            ],
            constraints: [
              "2 <= n <= 10^4",
              "Only one valid answer exists.",
              "Read from stdin and write the answer to stdout.",
            ],
          },
        ),
        makeProblem(
          5,
          "maximum-subarray",
          "Maximum Subarray",
          "Medium",
          "Find the contiguous subarray with the largest sum (Kadane).",
          ["Track the best sum ending at the current index.", "If the running sum goes negative, reset."],
          {
            ioFormat:
              "Input:\nFirst line: n\nSecond line: n integers\n\nOutput:\nThe maximum subarray sum.",
            sampleStdin: "9\n-2 1 -3 4 -1 2 1 -5 4",
            examples: [
              {
                input: "9\n-2 1 -3 4 -1 2 1 -5 4",
                output: "6",
                explanation: "The subarray [4, -1, 2, 1] sums to 6.",
              },
            ],
            constraints: [
              "1 <= n <= 10^5",
              "Read from stdin and write the answer to stdout.",
            ],
          },
        ),
      ],
    },
    {
      slug: "strings",
      title: "Strings",
      description: "Search, reverse, and count patterns in text.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "valid-anagram", "Valid Anagram", "Easy", "Check if two strings are anagrams.", ["Count character frequencies.", "Lengths must match first."]),
        makeProblem(2, "first-unique-char", "First Unique Character", "Easy", "Return the index of the first non-repeating character.", ["Count, then scan again.", "Return -1 if none."]),
        makeProblem(3, "longest-common-prefix", "Longest Common Prefix", "Easy", "Find the longest prefix shared by all strings.", ["Compare against the first string.", "Stop at the first mismatch."]),
        makeProblem(4, "valid-palindrome-phrase", "Valid Palindrome Phrase", "Easy", "Ignore non-letters and case when checking a palindrome.", ["Two pointers skip junk characters.", "Normalize case."]),
        makeProblem(5, "compress-string", "Compress String", "Medium", "Run-length encode a string like aabccc → a2bc3.", ["Count consecutive groups.", "If compression is not smaller, you can still return the encoded form here."]),
      ],
    },
    {
      slug: "linked-lists",
      title: "Linked Lists",
      description: "Nodes and pointers: traverse, reverse, and detect cycles.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "list-length", "List Length", "Easy", "Count nodes in a singly linked list.", ["Walk until null.", "Empty list has length 0."]),
        makeProblem(2, "reverse-list", "Reverse List", "Easy", "Reverse a singly linked list.", ["Keep prev, current, next.", "The old head becomes the tail."]),
        makeProblem(3, "middle-node", "Middle Node", "Easy", "Return the middle node (second middle if even).", ["Slow and fast pointers.", "Fast moves twice as far."]),
        makeProblem(4, "merge-two-sorted", "Merge Two Sorted Lists", "Medium", "Merge two sorted lists into one sorted list.", ["Pick the smaller head each time.", "Attach leftovers at the end."]),
        makeProblem(5, "has-cycle", "Has Cycle", "Medium", "Detect whether the list contains a cycle.", ["Floyd: tortoise and hare.", "If they meet, there is a cycle."]),
      ],
    },
    {
      slug: "stacks",
      title: "Stacks",
      description: "Last-in first-out: matching, undo, and evaluation.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "valid-parentheses", "Valid Parentheses", "Easy", "Check whether brackets are correctly matched.", ["Push opening brackets.", "Pop on closing and compare."]),
        makeProblem(2, "min-stack", "Min Stack", "Medium", "Support push, pop, top, and getMin in O(1).", ["Store a parallel min history.", "Or store pairs of (value, minSoFar)."]),
        makeProblem(3, "next-greater", "Next Greater Element", "Medium", "For each value, find the next greater to its right.", ["Scan from the right with a decreasing stack.", "If the stack is empty, answer is -1."]),
        makeProblem(4, "stack-using-array", "Stack Using Array", "Easy", "Implement push/pop/peek on a fixed array.", ["Track the top index.", "Reject overflow and underflow."]),
        makeProblem(5, "reverse-with-stack", "Reverse with Stack", "Easy", "Reverse a string using a stack.", ["Push every character.", "Pop to build the reverse."]),
      ],
    },
    {
      slug: "queues",
      title: "Queues",
      description: "First-in first-out for order-preserving processing.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "implement-queue", "Implement Queue", "Easy", "Implement enqueue, dequeue, and front.", ["Use an array or linked list.", "Track front and rear."]),
        makeProblem(2, "queue-with-stacks", "Queue with Stacks", "Medium", "Implement a queue using two stacks.", ["One stack for in, one for out.", "Pour when out is empty."]),
        makeProblem(3, "generate-binary", "Generate Binary Numbers", "Medium", "Generate binary strings from 1 to N with a queue.", ["Start with \"1\".", "Enqueue s+0 and s+1."]),
        makeProblem(4, "hot-potato", "Hot Potato", "Easy", "Simulate counting-out: dequeue and enqueue k-1 times, then drop.", ["A circular queue models the circle.", "The last remaining is the winner."]),
        makeProblem(5, "time-to-buy", "Time Needed to Buy Tickets", "Easy", "People in a queue buy one ticket per turn.", ["A simple simulation is enough for small n.", "Stop when the target person is done."]),
      ],
    },
    {
      slug: "searching",
      title: "Searching",
      description: "Linear and binary search on sorted data.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "linear-search", "Linear Search", "Easy", "Return the index of target or -1.", ["Scan left to right.", "Stop at the first match."]),
        makeProblem(2, "binary-search", "Binary Search", "Easy", "Search a sorted array in O(log n).", ["Keep low and high.", "mid = low + (high-low)/2 avoids overflow."]),
        makeProblem(3, "first-occurrence", "First Occurrence", "Medium", "Find the first index of target in a sorted array with duplicates.", ["When you find target, look left.", "A biased binary search works."]),
        makeProblem(4, "sqrt-integer", "Integer Square Root", "Medium", "Compute floor(sqrt(x)) without a float sqrt.", ["Binary search the answer.", "Be careful with mid*mid overflow."]),
        makeProblem(5, "search-insert", "Search Insert Position", "Easy", "Return the index where target should be inserted in a sorted array.", ["Binary search for the lower bound.", "If all values are smaller, return n."]),
      ],
    },
    {
      slug: "sorting",
      title: "Sorting",
      description: "Order data with classic comparison sorts.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "bubble-sort", "Bubble Sort", "Easy", "Sort an array with bubble sort.", ["Swap adjacent inversions.", "After pass i, the last i items are sorted."]),
        makeProblem(2, "selection-sort", "Selection Sort", "Easy", "Repeatedly select the minimum remaining value.", ["Swap it to the front of the unsorted region.", "N-1 passes are enough."]),
        makeProblem(3, "insertion-sort", "Insertion Sort", "Easy", "Insert each item into the sorted prefix.", ["Shift larger items right.", "Good on nearly sorted data."]),
        makeProblem(4, "merge-sorted-arrays", "Merge Sorted Arrays", "Medium", "Merge two sorted arrays into one sorted array.", ["Two pointers from the start.", "Copy leftovers."]),
        makeProblem(5, "kth-largest", "Kth Largest", "Medium", "Find the kth largest element.", ["Sort and index, or use a heap later.", "k=1 is the maximum."]),
      ],
    },
    {
      slug: "recursion",
      title: "Recursion",
      description: "Divide problems until a base case is obvious.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "print-n-to-1", "Print N to 1", "Easy", "Print N, N-1, …, 1 using recursion.", ["Print then recurse, or recurse then print.", "Base case n == 0."]),
        makeProblem(2, "subset-sum-exists", "Subset Sum Exists", "Medium", "Decide if a subset sums to target.", ["For each item, take it or skip it.", "Base: target 0 is true; negative is false."]),
        makeProblem(3, "tower-of-hanoi", "Tower of Hanoi", "Medium", "Print moves to move N disks from A to C using B.", ["Move n-1 aside, move largest, move n-1 on top.", "2^n - 1 moves."]),
        makeProblem(4, "count-paths", "Count Grid Paths", "Medium", "Count paths from top-left to bottom-right moving only right or down.", ["paths(r,c) = paths(r-1,c)+paths(r,c-1).", "A 1-row or 1-col grid has 1 path."]),
        makeProblem(5, "binary-strings", "Binary Strings", "Easy", "Print all binary strings of length N.", ["Append 0 or 1 at each position.", "Base: length N, print."]),
      ],
    },
    {
      slug: "trees",
      title: "Trees",
      description: "Binary trees: traversals, height, and search trees.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "tree-height", "Tree Height", "Easy", "Return the height of a binary tree.", ["Height is 1 + max of children.", "Empty tree height is -1 or 0; pick one and stay consistent."]),
        makeProblem(2, "inorder-traversal", "Inorder Traversal", "Easy", "Return the inorder list of values.", ["Left, node, right.", "Recursion is the simplest version."]),
        makeProblem(3, "invert-tree", "Invert Tree", "Easy", "Swap every left and right child.", ["Recurse on both sides, then swap.", "The root stays the same."]),
        makeProblem(4, "same-tree", "Same Tree", "Easy", "Check whether two trees are identical.", ["Compare values and both subtrees.", "Two empties are equal."]),
        makeProblem(5, "bst-search", "BST Search", "Easy", "Search for a value in a binary search tree.", ["Go left if target is smaller.", "Go right if larger."]),
      ],
    },
    {
      slug: "graphs",
      title: "Graphs",
      description: "BFS, DFS, and connected components.",
      difficulty: "Advanced",
      problems: [
        makeProblem(1, "adjacency-list", "Adjacency List", "Easy", "Build an adjacency list from an edge list.", ["Undirected edges go both ways.", "Nodes may be isolated."]),
        makeProblem(2, "bfs-order", "BFS Order", "Easy", "Return BFS visit order from a source.", ["Use a queue.", "Mark visited when you enqueue."]),
        makeProblem(3, "dfs-order", "DFS Order", "Easy", "Return DFS visit order from a source.", ["Use a stack or recursion.", "Skip already visited nodes."]),
        makeProblem(4, "connected-components", "Connected Components", "Medium", "Count connected components in an undirected graph.", ["Each unvisited node starts a new component.", "DFS or BFS the whole component."]),
        makeProblem(5, "number-of-islands", "Number of Islands", "Medium", "Count islands of 1s in a grid.", ["DFS/BFS flood fill each island.", "Mark visited land as 0 or seen."]),
      ],
    },
    {
      slug: "hashing",
      title: "Hashing",
      description: "Maps and sets for counting and lookup.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "two-sum-hash", "Two Sum (Hash)", "Easy", "Solve two sum with a hash map.", ["Store value → index as you go.", "Look up target - nums[i]."]),
        makeProblem(2, "contains-duplicate", "Contains Duplicate", "Easy", "Return true if any value appears twice.", ["A set of seen values.", "If insert fails, it was a duplicate."]),
        makeProblem(3, "majority-element", "Majority Element", "Easy", "Find the element that appears more than n/2 times.", ["Count with a map, or Boyer-Moore.", "It is guaranteed to exist here."]),
        makeProblem(4, "group-anagrams-lite", "Group Anagrams Lite", "Medium", "Group words that are anagrams of each other.", ["Sort each word as a key.", "Map key → list of words."]),
        makeProblem(5, "first-missing-positive-lite", "Missing Number", "Easy", "Find the missing number in 0..n given n numbers.", ["Sum formula or a set.", "XOR of indexes and values also works."]),
      ],
    },
    {
      slug: "dynamic-programming",
      title: "Dynamic Programming",
      description: "Remember subproblem answers instead of recomputing them.",
      difficulty: "Advanced",
      problems: [
        makeProblem(1, "climbing-stairs", "Climbing Stairs", "Easy", "You can take 1 or 2 steps. How many ways to reach N?", ["ways(n) = ways(n-1)+ways(n-2).", "This is Fibonacci in disguise."]),
        makeProblem(2, "house-robber", "House Robber", "Medium", "Max money without robbing adjacent houses.", ["dp[i] = max(dp[i-1], dp[i-2]+nums[i]).", "Empty street is 0."]),
        makeProblem(3, "coin-change-count", "Coin Change Count", "Medium", "Number of combinations to make amount.", ["Unbounded knapsack on coins.", "dp[0] = 1."]),
        makeProblem(4, "longest-increasing", "Longest Increasing Subsequence (n²)", "Medium", "Length of the longest increasing subsequence.", ["dp[i] = 1 + max of dp[j] for j < i if nums[j] < nums[i].", "Answer is max(dp)."]),
        makeProblem(5, "unique-paths", "Unique Paths", "Easy", "Count paths in an m×n grid moving right or down.", ["dp[i][j] = dp[i-1][j] + dp[i][j-1].", "First row and column are 1."]),
      ],
    },
    {
      slug: "two-pointers",
      title: "Two Pointers",
      description: "Move two indexes toward a goal instead of nested brute force.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "pair-sum-sorted", "Pair Sum in Sorted Array", "Easy", "Given a sorted array and target, print two 0-based indexes that sum to target, or -1 -1.", ["Start at both ends.", "Move the left pointer up if the sum is too small."], {
          sampleStdin: "4 9\n2 7 11 15",
          examples: [
            { input: "4 9\n2 7 11 15", output: "0 1" },
            { input: "3 10\n1 2 3", output: "-1 -1" },
          ],
        }),
        makeProblem(2, "remove-val-inplace", "Remove Value In Place", "Medium", "Remove all occurrences of val from the array and print the new length, then the kept prefix.", ["Slow pointer writes kept values.", "Order of remaining values must stay stable."], {
          ioFormat: "Input:\nn val\nn integers\n\nOutput:\nThe new length, then the kept prefix on the next line if length > 0.",
          sampleStdin: "4 3\n3 2 2 3",
          examples: [
            { input: "4 3\n3 2 2 3", output: "2\n2 2" },
            { input: "1 1\n1", output: "0" },
          ],
        }),
        makeProblem(3, "container-water", "Container With Most Water", "Medium", "Heights of n vertical lines. Print the max area of water between two lines.", ["Area is min(h[i],h[j]) * (j-i).", "Move the shorter side inward."], {
          sampleStdin: "9\n1 8 6 2 5 4 8 3 7",
          examples: [
            { input: "9\n1 8 6 2 5 4 8 3 7", output: "49" },
            { input: "2\n1 1", output: "1" },
          ],
        }),
        makeProblem(4, "trapping-rain", "Trapping Rain Water", "Hard", "Given heights, print how much rain water can be trapped.", ["Water on i is min(maxLeft, maxRight) - h[i].", "Two pointers or prefix/suffix maxima."], {
          sampleStdin: "12\n0 1 0 2 1 0 1 3 2 1 2 1",
          examples: [
            { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" },
            { input: "3\n4 2 3", output: "1" },
          ],
        }),
        makeProblem(5, "three-sum-zero", "Three Sum Zero Count", "Hard", "Count unique triplets i<j<k with a[i]+a[j]+a[k]=0. Values may repeat; count distinct value triples.", ["Sort first.", "Fix one number and two-pointer the rest; skip duplicates."], {
          sampleStdin: "6\n-1 0 1 2 -1 -4",
          examples: [
            { input: "6\n-1 0 1 2 -1 -4", output: "2", explanation: "(-1,-1,2) and (-1,0,1)." },
            { input: "3\n0 1 1", output: "0" },
          ],
        }),
      ],
    },
    {
      slug: "sliding-window",
      title: "Sliding Window",
      description: "Maintain a moving range and update its answer in linear time.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "max-sum-window", "Max Sum of Size K", "Easy", "Print the maximum sum of any contiguous subarray of length k.", ["Compute the first window, then slide.", "Add the entering value and drop the leaving value."], {
          sampleStdin: "5 2\n1 4 2 10 2",
          examples: [
            { input: "5 2\n1 4 2 10 2", output: "12", explanation: "2+10=12." },
            { input: "3 3\n1 2 3", output: "6" },
          ],
        }),
        makeProblem(2, "longest-unique", "Longest Unique Substring", "Medium", "Print the length of the longest substring without repeating characters.", ["Grow a window with a last-seen index map.", "When a repeat enters, move left past the previous copy."], {
          sampleStdin: "abcabcbb",
          examples: [
            { input: "abcabcbb", output: "3" },
            { input: "bbbbb", output: "1" },
          ],
        }),
        makeProblem(3, "min-subarray-sum", "Minimum Size Subarray Sum", "Medium", "Smallest length of a contiguous subarray with sum >= target. Print 0 if none.", ["Expand right, shrink left while valid.", "All values are positive here."], {
          sampleStdin: "7 6\n2 3 1 2 4 3",
          ioFormat: "Input:\ntarget n\nn positive integers",
          examples: [
            { input: "7 6\n2 3 1 2 4 3", output: "2", explanation: "4+3." },
            { input: "100 3\n1 1 1", output: "0" },
          ],
        }),
        makeProblem(4, "longest-ones-flip", "Longest Ones After K Flips", "Hard", "Binary array and k. Max consecutive 1s if you may flip at most k zeros.", ["Window may contain at most k zeros.", "Track zero count while sliding."], {
          sampleStdin: "11 2\n1 1 1 0 0 0 1 1 1 1 0",
          examples: [
            { input: "11 2\n1 1 1 0 0 0 1 1 1 1 0", output: "6" },
            { input: "4 0\n1 0 1 0", output: "1" },
          ],
        }),
        makeProblem(5, "min-window-cover", "Minimum Window Cover", "Hard", "Strings s and t. Print the smallest substring of s that covers every character in t (with counts). Print - if none.", ["Need a missing-count and a freq map.", "Shrink from the left when the window is valid."], {
          sampleStdin: "ADOBECODEBANC\nABC",
          examples: [
            { input: "ADOBECODEBANC\nABC", output: "BANC" },
            { input: "a\naa", output: "-" },
          ],
        }),
      ],
    },
    {
      slug: "prefix-sums",
      title: "Prefix Sums",
      description: "Precompute running totals so range queries are fast.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "range-sum", "Range Sum", "Easy", "Build prefix sums, then answer one query l r (1-based inclusive) as the sum of that slice.", ["pref[0]=0, pref[i]=pref[i-1]+a[i-1].", "Sum l..r is pref[r]-pref[l-1]."], {
          sampleStdin: "5 2 4\n1 2 3 4 5",
          ioFormat: "Input:\nn l r\nn integers",
          examples: [
            { input: "5 2 4\n1 2 3 4 5", output: "9", explanation: "2+3+4." },
            { input: "3 1 1\n9 8 7", output: "9" },
          ],
        }),
        makeProblem(2, "equilibrium-index", "Equilibrium Index", "Easy", "Print the smallest 0-based index where left sum equals right sum, or -1.", ["Total sum minus prefix helps.", "Left of 0 is 0."], {
          sampleStdin: "6\n1 7 3 6 5 6",
          examples: [
            { input: "6\n1 7 3 6 5 6", output: "3", explanation: "Left of index 3 sums to 11; right sums to 11." },
            { input: "3\n1 2 3", output: "-1" },
          ],
        }),
        makeProblem(3, "subarray-sum-k", "Subarray Sum Equals K", "Medium", "Count contiguous subarrays whose sum is k (values may be negative).", ["Map prefix → how many times seen.", "For each prefix p, add count of p-k."], {
          sampleStdin: "4 2\n1 1 1 1",
          examples: [
            { input: "4 2\n1 1 1 1", output: "3" },
            { input: "3 0\n1 -1 0", output: "3" },
          ],
        }),
        makeProblem(4, "product-except-self", "Product Except Self", "Medium", "Print an array where ans[i] is the product of all values except nums[i]. Do not use division.", ["Prefix products from the left, suffix from the right.", "n >= 2."], {
          sampleStdin: "4\n1 2 3 4",
          examples: [
            { input: "4\n1 2 3 4", output: "24 12 8 6" },
            { input: "2\n2 5", output: "5 2" },
          ],
        }),
        makeProblem(5, "contiguous-array", "Contiguous 0-1 Equal Count", "Hard", "Array of 0s and 1s. Print the maximum length of a contiguous subarray with equal 0s and 1s.", ["Treat 0 as -1.", "First time a prefix sum appears, store its index."], {
          sampleStdin: "6\n0 1 0 0 1 1",
          examples: [
            { input: "6\n0 1 0 0 1 1", output: "6" },
            { input: "2\n0 0", output: "0" },
          ],
        }),
      ],
    },
    {
      slug: "heaps",
      title: "Heaps",
      description: "Priority queues: always extract the current min or max.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "last-stone-weight", "Last Stone Weight", "Easy", "Smash the two heaviest stones; if they differ, push the difference back. Print the last stone or 0.", ["A max-heap models the pile.", "Sorting each time is OK for tiny n."], {
          sampleStdin: "6\n2 7 4 1 8 1",
          examples: [
            { input: "6\n2 7 4 1 8 1", output: "1" },
            { input: "1\n5", output: "5" },
          ],
        }),
        makeProblem(2, "k-closest", "K Closest Origins", "Medium", "Points on a plane. Print the k closest to (0,0), one point per line as x y, sorted by x then y. Distance is Euclidean.", ["Compare x*x+y*y to avoid floats.", "Sort the k answers for a stable output."], {
          sampleStdin: "3 1\n0 1\n5 0\n4 4",
          examples: [
            { input: "3 1\n0 1\n5 0\n4 4", output: "0 1" },
            { input: "3 2\n1 3\n-2 2\n2 2", output: "-2 2\n2 2" },
          ],
        }),
        makeProblem(3, "top-k-frequent", "Top K Frequent", "Medium", "Print the k most frequent numbers in descending frequency (break ties by larger value).", ["Count with a map, then a heap.", "k is at most the number of distinct values."], {
          sampleStdin: "6 2\n1 1 1 2 2 3",
          examples: [
            { input: "6 2\n1 1 1 2 2 3", output: "1 2" },
            { input: "4 1\n4 4 4 4", output: "4" },
          ],
        }),
        makeProblem(4, "kth-in-stream", "Kth Largest in Stream", "Hard", "Start with n numbers and k. Then q operations: each is a new value. After each, print the kth largest in the multiset so far.", ["Min-heap of size k holds the k largest.", "If the heap is smaller than k, print the current min of the heap only when size==k, else print -1."], {
          ioFormat: "Input:\nn k\nn integers (initial)\nq\nq integers (stream)\nOutput:\nq lines, kth largest after each insertion (initial array already inserted).",
          sampleStdin: "3 3\n4 5 8\n3\n2 3 5",
          examples: [
            { input: "3 3\n4 5 8\n3\n2 3 5", output: "4\n4\n5", explanation: "After 2: {4,5,8,2} kth=4; after 3: still 4; after 5: {8,5,5,4,3,2} kth=5." },
          ],
        }),
        makeProblem(5, "median-stream", "Median of Stream", "Hard", "Read n then n integers arriving one by one. After each, print the median (lower median if even count).", ["Two heaps: max-heap left, min-heap right.", "Rebalance so sizes differ by at most 1."], {
          sampleStdin: "5\n1 2 3 4 5",
          examples: [
            { input: "5\n1 2 3 4 5", output: "1\n1\n2\n2\n3" },
            { input: "1\n7", output: "7" },
          ],
        }),
      ],
    },
    {
      slug: "backtracking",
      title: "Backtracking",
      description: "Try a choice, recurse, then undo.",
      difficulty: "Advanced",
      problems: [
        makeProblem(1, "permutations", "Permutations", "Medium", "Print all permutations of n distinct integers, one per line, in lexicographic order.", ["Swap-based or used[] backtracking.", "Sort the input first so output is lex."], {
          sampleStdin: "3\n1 2 3",
          examples: [
            { input: "2\n1 2", output: "1 2\n2 1" },
          ],
        }),
        makeProblem(2, "combinations", "Combinations", "Medium", "Print all combinations of n choose k from 1..n in lex order, one per line.", ["Start the next pick after the previous.", "Stop when the combination length is k."], {
          sampleStdin: "4 2",
          examples: [
            { input: "4 2", output: "1 2\n1 3\n1 4\n2 3\n2 4\n3 4" },
          ],
        }),
        makeProblem(3, "letter-phone", "Letter Combinations", "Medium", "Phone digits 2-9 mapped like a keypad. Print all letter strings in lex order, space-separated on one line. Digit 1 is ignored if present.", ["2:abc 3:def 4:ghi 5:jkl 6:mno 7:pqrs 8:tuv 9:wxyz", "Empty digits → empty output."], {
          sampleStdin: "23",
          examples: [
            { input: "23", output: "ad ae af bd be bf cd ce cf" },
            { input: "2", output: "a b c" },
          ],
        }),
        makeProblem(4, "n-queens-count", "N Queens Count", "Hard", "Print how many ways to place n queens on an n×n board so none attack.", ["Track columns and both diagonals.", "n is small (1..10)."], {
          sampleStdin: "4",
          examples: [
            { input: "4", output: "2" },
            { input: "1", output: "1" },
          ],
        }),
        makeProblem(5, "word-search", "Word Search", "Hard", "n m grid of letters, then a word. Print Yes if the word can be formed by adjacent cells (no reuse).", ["DFS from each starting cell.", "Mark visited and unmark on return."], {
          sampleStdin: "3 4\nABCE\nSFCS\nADEE\nABCCED",
          examples: [
            { input: "3 4\nABCE\nSFCS\nADEE\nABCCED", output: "Yes" },
            { input: "3 4\nABCE\nSFCS\nADEE\nABCB", output: "No" },
          ],
        }),
      ],
    },
    {
      slug: "greedy",
      title: "Greedy",
      description: "Commit to a locally best choice with a proof it is enough.",
      difficulty: "Advanced",
      problems: [
        makeProblem(1, "assign-cookies", "Assign Cookies", "Easy", "Children with greed g[i], cookies with size s[j]. Max number of content children (each cookie used once, s[j] >= g[i]).", ["Sort both arrays.", "Give the smallest cookie that works."], {
          sampleStdin: "3 2\n1 2 3\n1 1",
          ioFormat: "Input:\nn m\nn greeds\nm cookie sizes",
          examples: [
            { input: "3 2\n1 2 3\n1 1", output: "1" },
            { input: "2 3\n1 2\n1 2 3", output: "2" },
          ],
        }),
        makeProblem(2, "jump-game", "Jump Game", "Medium", "From index 0, a[i] is max jump length. Print Yes if you can reach the last index.", ["Track the farthest reachable index.", "If i exceeds farthest, fail."], {
          sampleStdin: "5\n2 3 1 1 4",
          examples: [
            { input: "5\n2 3 1 1 4", output: "Yes" },
            { input: "5\n3 2 1 0 4", output: "No" },
          ],
        }),
        makeProblem(3, "activity-selection", "Activity Selection", "Medium", "n activities with start and end. Print the maximum number you can attend (no overlap; end == next start is allowed).", ["Sort by ending time.", "Take the next that starts at or after the last end."], {
          sampleStdin: "3\n1 2\n3 4\n0 6",
          examples: [
            { input: "3\n1 2\n3 4\n0 6", output: "2" },
            { input: "1\n5 9", output: "1" },
          ],
        }),
        makeProblem(4, "gas-station", "Gas Station Circuit", "Hard", "gas[i] and cost[i] on a circular route. Print the unique start index that can complete the loop, or -1.", ["If total gas < total cost, answer is -1.", "Otherwise the unique start is after the worst prefix."], {
          sampleStdin: "5\n1 2 3 4 5\n3 4 5 1 2",
          examples: [
            { input: "5\n1 2 3 4 5\n3 4 5 1 2", output: "3" },
            { input: "3\n2 3 4\n3 4 3", output: "-1" },
          ],
        }),
        makeProblem(5, "jump-game-two", "Jump Game II", "Hard", "Minimum jumps to reach the last index (it is always possible).", ["Greedy BFS levels: current end and farthest.", "When i hits current end, jump++."], {
          sampleStdin: "5\n2 3 1 1 4",
          examples: [
            { input: "5\n2 3 1 1 4", output: "2" },
            { input: "1\n0", output: "0" },
          ],
        }),
      ],
    },
    {
      slug: "bst",
      title: "Binary Search Trees",
      description: "Search, insert, validate, and order statistics on BSTs.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "bst-insert-print", "BST Insert then Inorder", "Easy", "Start empty. Insert n values in order. Print the inorder traversal (sorted if unique).", ["Go left if smaller, right otherwise.", "Duplicates go right in this problem."], {
          sampleStdin: "5\n4 2 6 1 3",
          examples: [
            { input: "5\n4 2 6 1 3", output: "1 2 3 4 6" },
            { input: "1\n7", output: "7" },
          ],
        }),
        makeProblem(2, "lca-bst", "LCA in BST", "Easy", "BST inorder-built from n values inserted in given order, then two values p q that exist. Print their LCA.", ["If both smaller, go left; both larger, go right; else current is LCA.", "p and q may not be in sorted order."], {
          sampleStdin: "7 2 8\n6 2 8 0 4 7 9",
          ioFormat: "Input:\nn p q\nn insert values",
          examples: [
            { input: "7 2 8\n6 2 8 0 4 7 9", output: "6" },
            { input: "7 2 4\n6 2 8 0 4 7 9", output: "2" },
          ],
        }),
        makeProblem(3, "validate-bst", "Validate BST", "Medium", "n then n values as a complete-tree array (-1 means missing, 0-based heap layout). Print Yes if it is a valid BST.", ["Each node must lie in (low, high).", "Left child 2i+1, right 2i+2."], {
          sampleStdin: "3\n2 1 3",
          examples: [
            { input: "3\n2 1 3", output: "Yes" },
            { input: "3\n5 1 4", output: "No", explanation: "4 is in the right of 5." },
          ],
        }),
        makeProblem(4, "kth-smallest-bst", "Kth Smallest in BST", "Medium", "Insert n values into a BST in given order, then k. Print the kth smallest (1-based).", ["Inorder yields sorted unique-with-duplicates-right.", "Stop after k visits."], {
          sampleStdin: "4 1\n3 1 4 2",
          ioFormat: "Input:\nn k\nn insert values",
          examples: [
            { input: "4 1\n3 1 4 2", output: "1" },
            { input: "4 3\n3 1 4 2", output: "3" },
          ],
        }),
        makeProblem(5, "delete-bst", "Delete in BST", "Hard", "Insert n values, then delete key (it exists). Print inorder after deletion. If two children, replace with inorder successor.", ["Successor is min of the right subtree.", "Duplicates were inserted to the right."], {
          sampleStdin: "5 3\n5 3 6 2 4",
          ioFormat: "Input:\nn key\nn insert values",
          examples: [
            { input: "5 3\n5 3 6 2 4", output: "2 4 5 6" },
            { input: "3 2\n2 1 3", output: "1 3" },
          ],
        }),
      ],
    },
    {
      slug: "dp-advanced",
      title: "DP II",
      description: "Classic tables: knapsack, strings, and paths.",
      difficulty: "Advanced",
      problems: [
        makeProblem(1, "zero-one-knapsack", "0/1 Knapsack", "Medium", "n items with weight and value, capacity W. Print max value.", ["dp[w] = max(dp[w], dp[w-wt]+val) looping w from W down.", "Each item at most once."], {
          sampleStdin: "3 4\n1 2\n3 4\n4 5",
          ioFormat: "Input:\nn W\nthen n lines weight value",
          examples: [
            { input: "3 4\n1 2\n3 4\n4 5", output: "6", explanation: "items 1 and 2: weights 1+3 values 2+4." },
          ],
        }),
        makeProblem(2, "lcs-length", "LCS Length", "Medium", "Two strings. Print the length of their longest common subsequence.", ["dp[i][j] from prefixes.", "If chars match, 1+dp[i-1][j-1]."], {
          sampleStdin: "abcde\nace",
          examples: [
            { input: "abcde\nace", output: "3" },
            { input: "abc\ndef", output: "0" },
          ],
        }),
        makeProblem(3, "edit-distance", "Edit Distance", "Hard", "Minimum insertions, deletions, and replacements to turn s into t.", ["Last-row DP.", "Mismatch costs 1 plus three neighbors."], {
          sampleStdin: "horse\nros",
          examples: [
            { input: "horse\nros", output: "3" },
            { input: "a\na", output: "0" },
          ],
        }),
        makeProblem(4, "longest-palindrome-subseq", "Longest Palindromic Subsequence", "Hard", "Print the LPS length of s.", ["LCS of s and reverse(s).", "Or 2D interval DP."], {
          sampleStdin: "bbbab",
          examples: [
            { input: "bbbab", output: "4" },
            { input: "cbbd", output: "2" },
          ],
        }),
        makeProblem(5, "partition-equal", "Partition Equal Subset Sum", "Hard", "Print Yes if the array can split into two subsets with equal sum.", ["Target is total/2; 0/1 knapsack on sums.", "Odd total is No."], {
          sampleStdin: "4\n1 5 11 5",
          examples: [
            { input: "4\n1 5 11 5", output: "Yes" },
            { input: "3\n1 2 3", output: "Yes" },
            { input: "3\n1 2 5", output: "No" },
          ],
        }),
      ],
    },
  ],
};
