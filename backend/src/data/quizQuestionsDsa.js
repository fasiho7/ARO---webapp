function q(id, topic, subtopic, difficulty, question, options, correctAnswer, explanation) {
  return { id, topic, subtopic, difficulty, question, options, correctAnswer, explanation };
}

const dsaQuestions = [
  q("dsa-arr-1", "dsa", "arrays", "easy", "Random access to index i in an array is typically:", ["O(n)", "O(1)", "O(log n)", "O(n²)"], 1, "Arrays store elements in contiguous (or directly indexable) storage."),
  q("dsa-arr-2", "dsa", "arrays", "easy", "Inserting at the front of an unsorted dynamic array (shifting) is:", ["O(1)", "O(n)", "O(log n)", "O(n log n)"], 1, "Existing elements must move over."),
  q("dsa-arr-3", "dsa", "arrays", "easy", "Kadane's algorithm finds:", ["A sorted permutation", "Maximum subarray sum", "The median in O(1)", "A spanning tree"], 1, "It tracks the best contiguous sum."),
  q("dsa-arr-4", "dsa", "arrays", "medium", "Two-sum on an unsorted array with a hash map is typically:", ["O(n²) time always", "O(n) expected time", "O(1) time", "O(n!) time"], 1, "One pass with value-to-index lookups."),
  q("dsa-arr-5", "dsa", "arrays", "medium", "A sliding window is a good fit when:", ["You need a contiguous segment with a running property", "The graph is disconnected", "You only have a linked list without arrays", "You sort in O(1)"], 0, "Windows move across contiguous indices."),
  q("dsa-arr-6", "dsa", "arrays", "hard", "Prefix sums let you compute subarray sum from l to r in:", ["O(n)", "O(1) after O(n) preprocess", "O(n log n) always", "O(r-l) necessarily each time"], 1, "sum = pref[r] - pref[l-1]."),

  q("dsa-ll-1", "dsa", "linked-lists", "easy", "A singly linked list node typically stores:", ["Left and right child", "Value and next pointer", "A parent only", "A hash code only"], 1, "Singly linked nodes point forward."),
  q("dsa-ll-2", "dsa", "linked-lists", "easy", "Accessing the k-th element in a singly linked list is:", ["O(1)", "O(k)", "O(log n)", "O(1) with binary search"], 1, "You must walk k steps."),
  q("dsa-ll-3", "dsa", "linked-lists", "easy", "Reversing a singly linked list iteratively uses pointers usually named:", ["root, left, right", "prev, current, next", "low, high, mid", "front, rear only"], 1, "You rewire next while walking."),
  q("dsa-ll-4", "dsa", "linked-lists", "medium", "Floyd's cycle detection uses:", ["A stack of size n", "Two pointers at different speeds", "Three heaps", "DFS coloring of graphs"], 1, "Tortoise and hare meet if a cycle exists."),
  q("dsa-ll-5", "dsa", "linked-lists", "medium", "Merging two sorted lists into one sorted list is:", ["O(1) extra nodes if you reuse nodes, O(n+m) time", "O((n+m) log(n+m)) required", "Impossible", "O(n²) always"], 0, "You splice the smaller head each time."),
  q("dsa-ll-6", "dsa", "linked-lists", "hard", "The middle node of a list of even length (second middle) is found by:", ["fast/slow pointers where fast moves twice as far", "Hashing values", "Sorting the list first", "A queue of size n²"], 0, "When fast hits the end, slow is at the middle."),

  q("dsa-st-1", "dsa", "stacks", "easy", "A stack is:", ["FIFO", "LIFO", "Priority by value only", "A complete binary tree"], 1, "Last in, first out."),
  q("dsa-st-2", "dsa", "stacks", "easy", "Valid parentheses algorithms commonly use a stack to:", ["Sort characters", "Match the most recent unmatched opener", "Count vowels", "Build a heap"], 1, "Closing brackets must match the top opener."),
  q("dsa-st-3", "dsa", "stacks", "easy", "Push and pop at the top of a well-implemented stack are:", ["O(n)", "O(1)", "O(log n)", "O(n log n)"], 1, "They touch one end only."),
  q("dsa-st-4", "dsa", "stacks", "medium", "Next Greater Element to the right is often solved with:", ["BFS", "A monotonic stack", "Dijkstra", "Union-Find"], 1, "Maintain decreasing (or increasing) candidates."),
  q("dsa-st-5", "dsa", "stacks", "medium", "A min-stack supports getMin in O(1) by:", ["Scanning the whole stack each time", "Storing a parallel history of minima", "Sorting after each push", "Using a queue"], 1, "Each push records the min so far."),
  q("dsa-st-6", "dsa", "stacks", "hard", "Evaluating a postfix expression uses a stack of:", ["Operators only", "Operands, applying an operator to the top values", "Graph edges", "Function pointers only"], 1, "Numbers are pushed; operators pop and combine."),

  q("dsa-qu-1", "dsa", "queues", "easy", "A queue is:", ["LIFO", "FIFO", "Random access tree", "A hash set"], 1, "First in, first out."),
  q("dsa-qu-2", "dsa", "queues", "easy", "BFS on a graph uses a queue because:", ["It explores by increasing distance / level", "It always finds the longest path", "It sorts edges", "It needs LIFO"], 0, "Nodes are processed in the order discovered."),
  q("dsa-qu-3", "dsa", "queues", "easy", "Enqueue happens at the:", ["Front only in a standard queue", "Rear / back", "Middle", "Heap root"], 1, "New items enter at the back."),
  q("dsa-qu-4", "dsa", "queues", "medium", "A queue implemented with two stacks amortizes to O(1) if:", ["You reverse only when the output stack is empty", "You reverse on every operation", "You sort both stacks", "You use DFS"], 0, "Pouring from in-stack to out-stack happens rarely per element."),
  q("dsa-qu-5", "dsa", "queues", "medium", "A circular buffer queue of fixed capacity detects full vs empty using:", ["A visited array of nodes", "Size count or a reserved slot / flags", "A binary search tree", "Quicksort"], 1, "You must distinguish wrap-around full from empty."),
  q("dsa-qu-6", "dsa", "queues", "hard", "A deque supports:", ["Insert/delete at both ends efficiently", "Only stack operations", "O(1) search of arbitrary keys", "Union of disjoint sets"], 0, "Double-ended queue."),

  q("dsa-tr-1", "dsa", "trees", "easy", "A binary tree node has at most:", ["1 child", "2 children", "3 children", "n children"], 1, "Binary means two child pointers."),
  q("dsa-tr-2", "dsa", "trees", "easy", "Inorder of a BST visits keys in:", ["Random order", "Sorted order", "Level order only", "Reverse heap order"], 1, "Left, node, right yields sorted keys."),
  q("dsa-tr-3", "dsa", "trees", "easy", "The height of a tree is often defined as:", ["Number of nodes", "Longest root-to-leaf path in edges or nodes (be consistent)", "The degree of the root only", "Always log n"], 1, "Height measures depth of the deepest leaf."),
  q("dsa-tr-4", "dsa", "trees", "medium", "A balanced BST (e.g. AVL) search is:", ["O(n) worst case like a linked list still", "O(log n) when height is logarithmic", "O(1)", "O(n²)"], 1, "Balance keeps height logarithmic."),
  q("dsa-tr-5", "dsa", "trees", "medium", "BFS tree level order uses:", ["A stack only", "A queue", "Dijkstra on negatives", "Three pointers like list reverse"], 1, "Level by level is a queue."),
  q("dsa-tr-6", "dsa", "trees", "hard", "Lowest common ancestor of two nodes in a binary tree (general, not BST) can be found by:", ["Always hashing all paths to arrays of size n²", "Recursing: if nodes are in different subtrees, current is LCA", "Sorting the tree", "A stack of operators"], 1, "Divide and conquer on left/right presence."),

  q("dsa-se-1", "dsa", "searching", "easy", "Linear search on n unsorted items is:", ["O(1)", "O(n)", "O(log n)", "O(n log n)"], 1, "You may scan every element."),
  q("dsa-se-2", "dsa", "searching", "easy", "Binary search requires the array to be:", ["A linked list", "Sorted", "A graph", "A hash map"], 1, "Halving only works on ordered data."),
  q("dsa-se-3", "dsa", "searching", "easy", "Binary search time on a sorted array is:", ["O(n)", "O(log n)", "O(n²)", "O(1) always"], 1, "Each step discards half."),
  q("dsa-se-4", "dsa", "searching", "medium", "To find the first occurrence of a duplicate target in a sorted array you:", ["Stop at any match", "Keep searching the left side after a match", "Sort descending first", "Use BFS"], 1, "Bias the binary search toward the lower bound."),
  q("dsa-se-5", "dsa", "searching", "medium", "Integer square root via binary search looks for:", ["A random pivot", "The largest mid with mid*mid <= x", "A hash of x", "DFS on digits"], 1, "The answer is monotonic in mid."),
  q("dsa-se-6", "dsa", "searching", "hard", "Binary search on the answer (parametric search) applies when:", ["The feasibility of a candidate is monotonic", "The array is unsorted and non-comparable", "You need DFS coloring", "Hash collisions occur"], 0, "You can discard a half of the candidate space."),

  q("dsa-so-1", "dsa", "sorting", "easy", "Bubble sort's typical worst-case time is:", ["O(n)", "O(n log n)", "O(n²)", "O(1)"], 2, "Nested passes over inversions."),
  q("dsa-so-2", "dsa", "sorting", "easy", "A stable sort preserves:", ["Memory addresses", "Relative order of equal keys", "The maximum value", "Tree height"], 1, "Equal keys stay in original order."),
  q("dsa-so-3", "dsa", "sorting", "easy", "Merge sort worst-case time is:", ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], 1, "Divide and merge are logarithmic layers of linear work."),
  q("dsa-so-4", "dsa", "sorting", "medium", "Quicksort average time is O(n log n); worst case is:", ["O(n) with bad pivots", "O(n²) with consistently bad pivots", "O(log n)", "O(1)"], 1, "Unbalanced partitions degrade to quadratic."),
  q("dsa-so-5", "dsa", "sorting", "medium", "Heap sort uses a binary heap to get:", ["O(n²) guaranteed", "O(n log n) worst case, not stable typically", "O(n) worst case comparison sort", "Linear extra merge arrays only"], 1, "Each of n extracts is O(log n)."),
  q("dsa-so-6", "dsa", "sorting", "hard", "Comparison-based sorting in the worst case needs:", ["Ω(n log n) comparisons", "O(n) comparisons always", "O(1) comparisons", "Ω(n²) always"], 0, "There are n! permutations; the decision tree is logarithmic in that."),

  q("dsa-cx-1", "dsa", "complexity", "easy", "Big-O describes:", ["Exact runtime in milliseconds", "An upper bound on growth as n grows", "Memory brand", "CPU temperature"], 1, "Asymptotic upper bound."),
  q("dsa-cx-2", "dsa", "complexity", "easy", "Which grows fastest as n → ∞?", ["O(log n)", "O(n)", "O(n log n)", "O(n²)"], 3, "Quadratic dominates the others listed."),
  q("dsa-cx-3", "dsa", "complexity", "easy", "O(1) means:", ["The algorithm never runs", "Work does not grow with n (constant)", "Linear in n", "Exponential"], 1, "Constant time."),
  q("dsa-cx-4", "dsa", "complexity", "medium", "Two nested loops each from 1 to n are:", ["O(n)", "O(n²)", "O(log n)", "O(1)"], 1, "n * n iterations."),
  q("dsa-cx-5", "dsa", "complexity", "medium", "Space complexity of merge sort is typically:", ["O(1)", "O(n) extra for merging", "O(n²)", "O(log log n) only"], 1, "It needs auxiliary arrays (or equivalent) for the merge."),
  q("dsa-cx-6", "dsa", "complexity", "hard", "Amortized O(1) append on a dynamic array comes from:", ["Never copying", "Geometric resizing so copies are rare per element", "Hashing keys", "A balanced BST"], 1, "Doubling means each element is copied O(1) times amortized."),
];

module.exports = { dsaQuestions };
