function tc(input, expectedOutput) {
  return { input, expectedOutput };
}

const catalog = {
  "pf/variables-data-types/swap-two-variables": [
    tc("3 7", "7 3"),
    tc("0 1", "1 0"),
  ],
  "pf/variables-data-types/sum-of-two-numbers": [
    tc("3 5", "8"),
    tc("-2 10", "8"),
  ],
  "pf/variables-data-types/type-conversion": [
    tc("3.9", "3"),
    tc("10.1", "10"),
  ],
  "pf/variables-data-types/ascii-of-character": [
    tc("A", "65"),
    tc("a", "97"),
  ],
  "pf/variables-data-types/min-and-max-of-three": [
    tc("3 1 2", "1 3"),
    tc("5 5 5", "5 5"),
  ],
  "pf/input-output/echo-a-line": [
    tc("hello world", "hello world"),
    tc("Aro", "Aro"),
  ],
  "pf/input-output/formatted-greeting": [
    tc("Aro", "Hello, Aro!"),
    tc("Ali", "Hello, Ali!"),
  ],
  "pf/input-output/average-of-three": [
    tc("3 6 9", "6"),
    tc("2 2 2", "2"),
  ],
  "pf/input-output/rectangle-area": [
    tc("4 5", "20"),
    tc("3 3", "9"),
  ],
  "pf/input-output/seconds-to-hms": [
    tc("3661", "1 1 1"),
    tc("60", "0 1 0"),
  ],
  "pf/conditions/even-or-odd": [
    tc("4", "Even"),
    tc("7", "Odd"),
  ],
  "pf/conditions/grade-from-score": [
    tc("95", "A"),
    tc("72", "C"),
  ],
  "pf/conditions/largest-of-two": [
    tc("3 8", "8"),
    tc("5 5", "Equal"),
  ],
  "pf/conditions/leap-year": [
    tc("2000", "Yes"),
    tc("1900", "No"),
  ],
  "pf/conditions/positive-negative-zero": [
    tc("4", "Positive"),
    tc("0", "Zero"),
    tc("-3", "Negative"),
  ],
  "pf/loops/print-1-to-n": [
    tc("5", "1 2 3 4 5"),
    tc("1", "1"),
  ],
  "pf/loops/sum-1-to-n": [
    tc("5", "15"),
    tc("1", "1"),
  ],
  "pf/loops/factorial": [
    tc("5", "120"),
    tc("0", "1"),
  ],
  "pf/loops/multiplication-table": [
    tc(
      "2",
      "2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n2 x 4 = 8\n2 x 5 = 10\n2 x 6 = 12\n2 x 7 = 14\n2 x 8 = 16\n2 x 9 = 18\n2 x 10 = 20",
    ),
  ],
  "pf/loops/count-digits": [
    tc("12345", "5"),
    tc("0", "1"),
  ],
  "pf/functions/is-prime": [
    tc("7", "Yes"),
    tc("1", "No"),
    tc("9", "No"),
  ],
  "pf/functions/gcd": [
    tc("12 18", "6"),
    tc("7 1", "1"),
  ],
  "pf/functions/power": [
    tc("2 10", "1024"),
    tc("5 0", "1"),
  ],
  "pf/functions/ncr": [
    tc("5 2", "10"),
    tc("6 0", "1"),
  ],
  "pf/functions/temperature-convert": [
    tc("C 0", "32"),
    tc("F 32", "0"),
  ],
  "pf/arrays/array-sum": [
    tc("5\n1 2 3 4 5", "15"),
    tc("3\n-1 0 1", "0"),
  ],
  "pf/arrays/array-average": [
    tc("4\n2 4 6 8", "5"),
    tc("3\n3 3 3", "3"),
  ],
  "pf/arrays/count-occurrences": [
    tc("5 2\n1 2 2 3 2", "3"),
    tc("4 9\n1 2 3 4", "0"),
  ],
  "pf/arrays/second-largest": [
    tc("5\n1 4 2 9 3", "4"),
    tc("4\n10 10 7 5", "7"),
  ],
  "pf/arrays/reverse-in-place": [
    tc("4\n1 2 3 4", "4 3 2 1"),
    tc("1\n8", "8"),
  ],
  "pf/strings/string-length": [
    tc("hello", "5"),
    tc("a b", "3"),
  ],
  "pf/strings/reverse-string": [
    tc("abc", "cba"),
    tc("Aro", "orA"),
  ],
  "pf/strings/palindrome-string": [
    tc("aba", "Yes"),
    tc("abc", "No"),
  ],
  "pf/strings/count-vowels": [
    tc("hello", "2"),
    tc("why", "0"),
  ],
  "pf/strings/remove-spaces": [
    tc("a b c", "abc"),
    tc("hello world", "helloworld"),
  ],
  "pf/pointers/swap-with-pointers": [
    tc("3 7", "7 3"),
    tc("1 1", "1 1"),
  ],
  "pf/pointers/print-via-pointer": [
    tc("42", "42"),
    tc("0", "0"),
  ],
  "pf/pointers/array-with-pointer": [
    tc("4\n1 2 3 4", "10"),
    tc("2\n5 5", "10"),
  ],
  "pf/pointers/pointer-to-max": [
    tc("5\n1 4 2 9 3", "9"),
    tc("3\n-5 -1 -8", "-1"),
  ],
  "pf/pointers/null-check": [
    tc("1 8", "8"),
    tc("0", "NULL"),
  ],
  "pf/recursion/recursive-factorial": [
    tc("5", "120"),
    tc("1", "1"),
  ],
  "pf/recursion/recursive-fibonacci": [
    tc("6", "8"),
    tc("1", "1"),
  ],
  "pf/recursion/sum-to-n-recursive": [
    tc("5", "15"),
    tc("0", "0"),
  ],
  "pf/recursion/reverse-digits": [
    tc("1234", "4321"),
    tc("100", "001"),
  ],
  "pf/recursion/power-recursive": [
    tc("2 8", "256"),
    tc("3 0", "1"),
  ],
  "pf/basic-problem-solving/fizzbuzz": [
    tc(
      "15",
      "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
    ),
  ],
  "pf/basic-problem-solving/palindrome-number": [
    tc("121", "Yes"),
    tc("123", "No"),
  ],
  "pf/basic-problem-solving/armstrong-number": [
    tc("153", "Yes"),
    tc("123", "No"),
  ],
  "pf/basic-problem-solving/pattern-triangle": [
    tc("3", "*\n**\n***"),
    tc("1", "*"),
  ],
  "pf/basic-problem-solving/simple-calculator": [
    tc("8 2 +", "10"),
    tc("8 2 /", "4"),
  ],

  "oop/classes-objects/student-class": [
    tc("Ali 21", "Ali 21"),
    tc("Sara 7", "Sara 7"),
  ],
  "oop/classes-objects/bank-account": [
    tc("100", "100"),
    tc("0", "0"),
  ],
  "oop/classes-objects/rectangle-class": [
    tc("4 5", "20"),
    tc("3 2", "6"),
  ],
  "oop/classes-objects/counter-objects": [
    tc("3 2", "3 2"),
    tc("1 0", "1 0"),
  ],
  "oop/classes-objects/book-catalog": [
    tc("Dune\nHerbert", "Dune by Herbert"),
    tc("Aro\nFasih", "Aro by Fasih"),
  ],
  "oop/constructors/default-constructor": [
    tc("", "Unknown"),
  ],
  "oop/constructors/parameterized-constructor": [
    tc("3 4", "3 4"),
    tc("0 1", "0 1"),
  ],
  "oop/constructors/constructor-overloading": [
    tc("0", "0 0"),
    tc("1 8 30", "8 30"),
  ],
  "oop/constructors/copy-constructor": [
    tc("5", "5 5"),
  ],
  "oop/constructors/initializer-list": [
    tc("9", "9"),
  ],
  "oop/encapsulation/private-balance": [
    tc("50 20", "70"),
    tc("50 -10", "50"),
  ],
  "oop/encapsulation/validate-age": [
    tc("20", "20"),
    tc("-3", "0"),
  ],
  "oop/encapsulation/read-only-id": [
    tc("42", "42"),
  ],
  "oop/encapsulation/invariant-rectangle": [
    tc("4 5", "20"),
    tc("0 5", "1 5"),
  ],
  "oop/encapsulation/temperature-capsule": [
    tc("0", "32"),
    tc("100", "212"),
  ],
  "oop/accessors-mutators/get-set-name": [
    tc("Aro", "Aro"),
  ],
  "oop/accessors-mutators/clamped-volume": [
    tc("150", "100"),
    tc("-4", "0"),
    tc("40", "40"),
  ],
  "oop/accessors-mutators/boolean-flag": [
    tc("1", "true"),
    tc("0", "false"),
  ],
  "oop/accessors-mutators/derived-getter": [
    tc("Fasih Zeeshan", "Fasih Zeeshan"),
  ],
  "oop/accessors-mutators/chainable-setters": [
    tc("2 8", "2 8"),
  ],
  "oop/inheritance/vehicle-car": [
    tc("4", "4"),
  ],
  "oop/inheritance/employee-manager": [
    tc("Ali Sales", "Ali Sales"),
  ],
  "oop/inheritance/shape-hierarchy": [
    tc("2", "12.56"),
  ],
  "oop/inheritance/protected-members": [
    tc("7", "7"),
  ],
  "oop/inheritance/multilevel": [
    tc("Ali 21 CS", "Ali 21 CS"),
  ],
  "oop/polymorphism/speak-animals": [
    tc("", "Woof\nMeow"),
  ],
  "oop/polymorphism/pay-employees": [
    tc("10 8 2000", "80 2000"),
  ],
  "oop/polymorphism/draw-shapes": [
    tc("", "Circle\nRectangle"),
  ],
  "oop/polymorphism/notify-channels": [
    tc("hi", "Email: hi\nSMS: hi"),
  ],
  "oop/polymorphism/plugin-greeting": [
    tc("Ali", "Dear Ali\nHey Ali"),
  ],
  "oop/virtual-functions/virtual-area": [
    tc("2", "12.56"),
  ],
  "oop/virtual-functions/virtual-destructor": [
    tc("", "Base"),
  ],
  "oop/virtual-functions/pure-virtual": [
    tc("3 4", "12"),
  ],
  "oop/virtual-functions/override-keyword": [
    tc("", "Meow"),
  ],
  "oop/virtual-functions/vcall-loop": [
    tc("2 3 4", "12.56 12"),
  ],
  "oop/operator-overloading/add-complex": [
    tc("1 2 3 4", "4 6"),
  ],
  "oop/operator-overloading/compare-points": [
    tc("1 2 1 2", "Yes"),
    tc("1 2 3 4", "No"),
  ],
  "oop/operator-overloading/stream-print": [
    tc("3 4", "3 4"),
  ],
  "oop/operator-overloading/index-operator": [
    tc("1 2 3", "1 2 3"),
  ],
  "oop/operator-overloading/plus-equals": [
    tc("3 4", "7"),
  ],
  "oop/dynamic-memory/new-integer": [
    tc("9", "9"),
  ],
  "oop/dynamic-memory/dynamic-array": [
    tc("4\n1 2 3 4", "10"),
  ],
  "oop/dynamic-memory/resize-buffer": [
    tc("2 4\n1 2", "1 2 0 0"),
  ],
  "oop/dynamic-memory/null-after-free": [
    tc("", "NULL"),
  ],
  "oop/dynamic-memory/shallow-vs-deep": [
    tc("3\n1 2 3", "1 2 3"),
  ],
  "oop/destructors/log-destructor": [
    tc("", "destroyed"),
  ],
  "oop/destructors/free-in-destructor": [
    tc("3\n1 2 3", "6"),
  ],
  "oop/destructors/rule-of-three": [
    tc("2\n4 5", "4 5"),
  ],
  "oop/destructors/order-of-destruction": [
    tc("", "B\nA"),
  ],
  "oop/destructors/file-handle": [
    tc("notes.txt", "closed"),
  ],

  "dsa/arrays/find-maximum": [
    tc("5\n1 4 2 9 3", "9"),
    tc("4\n10 2 7 5", "10"),
    tc("3\n-5 -1 -8", "-1"),
  ],
  "dsa/arrays/reverse-an-array": [
    tc("4\n1 2 3 4", "4 3 2 1"),
    tc("5\n9 8 7 6 5", "5 6 7 8 9"),
  ],
  "dsa/arrays/remove-duplicates": [
    tc("5\n1 1 2 2 3", "3"),
    tc("4\n2 2 2 2", "1"),
  ],
  "dsa/arrays/two-sum": [
    tc("4 9\n2 7 11 15", "0 1"),
    tc("3 6\n3 2 4", "1 2"),
  ],
  "dsa/arrays/maximum-subarray": [
    tc("9\n-2 1 -3 4 -1 2 1 -5 4", "6"),
    tc("1\n-3", "-3"),
  ],
  "dsa/strings/valid-anagram": [
    tc("listen\nsilent", "Yes"),
    tc("rat\ncar", "No"),
  ],
  "dsa/strings/first-unique-char": [
    tc("leetcode", "0"),
    tc("aabb", "-1"),
  ],
  "dsa/strings/longest-common-prefix": [
    tc("3\nflower\nflow\nflight", "fl"),
    tc("2\ndog\nracecar", ""),
  ],
  "dsa/strings/valid-palindrome-phrase": [
    tc("A man, a plan, a canal: Panama", "Yes"),
    tc("hello", "No"),
  ],
  "dsa/strings/compress-string": [
    tc("aabccc", "a2bc3"),
    tc("abc", "abc"),
  ],
  "dsa/linked-lists/list-length": [
    tc("3\n1 2 3", "3"),
    tc("0", "0"),
  ],
  "dsa/linked-lists/reverse-list": [
    tc("3\n1 2 3", "3 2 1"),
    tc("1\n8", "8"),
  ],
  "dsa/linked-lists/middle-node": [
    tc("5\n1 2 3 4 5", "3"),
    tc("4\n1 2 3 4", "3"),
  ],
  "dsa/linked-lists/merge-two-sorted": [
    tc("3 3\n1 2 4\n1 3 4", "1 1 2 3 4 4"),
    tc("0 1\n\n0", "0"),
  ],
  "dsa/linked-lists/has-cycle": [
    tc("4 1\n3 2 0 -4", "Yes"),
    tc("2 -1\n1 2", "No"),
  ],
  "dsa/stacks/valid-parentheses": [
    tc("()", "Yes"),
    tc("([)]", "No"),
    tc("{[]}", "Yes"),
  ],
  "dsa/stacks/min-stack": [
    tc("push 2\npush 1\ngetMin\npop\ngetMin", "1\n2"),
  ],
  "dsa/stacks/next-greater": [
    tc("4\n2 1 2 4", "4 2 4 -1"),
    tc("3\n3 2 1", "-1 -1 -1"),
  ],
  "dsa/stacks/stack-using-array": [
    tc("push 1\npush 2\npeek\npop\npeek", "2\n2\n1"),
  ],
  "dsa/stacks/reverse-with-stack": [
    tc("abc", "cba"),
    tc("Aro", "orA"),
  ],
  "dsa/queues/implement-queue": [
    tc("enqueue 1\nenqueue 2\nfront\ndequeue\nfront", "1\n1\n2"),
  ],
  "dsa/queues/queue-with-stacks": [
    tc("enqueue 3\nenqueue 4\ndequeue\nfront", "3\n4"),
  ],
  "dsa/queues/generate-binary": [
    tc("3", "1 10 11"),
    tc("1", "1"),
  ],
  "dsa/queues/hot-potato": [
    tc("5 2", "3"),
    tc("1 1", "1"),
  ],
  "dsa/queues/time-to-buy": [
    tc("4 0\n5 1 1 1", "8"),
    tc("2 1\n2 3", "4"),
  ],
  "dsa/searching/linear-search": [
    tc("5 9\n1 4 2 9 3", "3"),
    tc("4 8\n1 2 3 4", "-1"),
  ],
  "dsa/searching/binary-search": [
    tc("5 9\n1 3 5 9 12", "3"),
    tc("4 2\n1 3 5 7", "-1"),
  ],
  "dsa/searching/first-occurrence": [
    tc("6 2\n1 2 2 2 3 4", "1"),
    tc("4 5\n1 2 3 4", "-1"),
  ],
  "dsa/searching/sqrt-integer": [
    tc("8", "2"),
    tc("16", "4"),
  ],
  "dsa/searching/search-insert": [
    tc("4 5\n1 3 5 6", "2"),
    tc("4 7\n1 3 5 6", "4"),
  ],
  "dsa/sorting/bubble-sort": [
    tc("5\n5 1 4 2 8", "1 2 4 5 8"),
    tc("1\n3", "3"),
  ],
  "dsa/sorting/selection-sort": [
    tc("4\n4 3 2 1", "1 2 3 4"),
  ],
  "dsa/sorting/insertion-sort": [
    tc("5\n12 11 13 5 6", "5 6 11 12 13"),
  ],
  "dsa/sorting/merge-sorted-arrays": [
    tc("3 3\n1 2 4\n1 3 4", "1 1 2 3 4 4"),
    tc("2 0\n1 2", "1 2"),
  ],
  "dsa/sorting/kth-largest": [
    tc("6 2\n3 2 1 5 6 4", "5"),
    tc("1 1\n7", "7"),
  ],
  "dsa/recursion/print-n-to-1": [
    tc("5", "5 4 3 2 1"),
    tc("1", "1"),
  ],
  "dsa/recursion/subset-sum-exists": [
    tc("4 9\n3 34 4 12", "Yes"),
    tc("3 30\n1 2 3", "No"),
  ],
  "dsa/recursion/tower-of-hanoi": [
    tc("1", "A C"),
    tc("2", "A B\nA C\nB C"),
  ],
  "dsa/recursion/count-paths": [
    tc("2 2", "2"),
    tc("3 2", "3"),
  ],
  "dsa/recursion/binary-strings": [
    tc("1", "0\n1"),
    tc("2", "00\n01\n10\n11"),
  ],
  "dsa/trees/tree-height": [
    tc("3\n1 2 3", "1"),
    tc("1\n1", "0"),
  ],
  "dsa/trees/inorder-traversal": [
    tc("3\n1 2 3", "2 1 3"),
  ],
  "dsa/trees/invert-tree": [
    tc("3\n1 2 3", "1 3 2"),
  ],
  "dsa/trees/same-tree": [
    tc("3 3\n1 2 3\n1 2 3", "Yes"),
    tc("2 2\n1 2\n1 3", "No"),
  ],
  "dsa/trees/bst-search": [
    tc("5 4\n4 2 7 1 3", "Yes"),
    tc("3 8\n2 1 3", "No"),
  ],
  "dsa/graphs/adjacency-list": [
    tc("3 2\n1 2\n2 3", "1: 2\n2: 1 3\n3: 2"),
  ],
  "dsa/graphs/bfs-order": [
    tc("4 3 1\n1 2\n1 3\n2 4", "1 2 3 4"),
  ],
  "dsa/graphs/dfs-order": [
    tc("3 2 1\n1 2\n1 3", "1 2 3"),
  ],
  "dsa/graphs/connected-components": [
    tc("4 2\n1 2\n3 4", "2"),
    tc("3 0", "3"),
  ],
  "dsa/graphs/number-of-islands": [
    tc("3 3\n1 1 0\n1 0 0\n0 0 1", "2"),
    tc("1 1\n0", "0"),
  ],
  "dsa/hashing/two-sum-hash": [
    tc("4 9\n2 7 11 15", "0 1"),
    tc("3 6\n3 3 4", "0 1"),
  ],
  "dsa/hashing/contains-duplicate": [
    tc("4\n1 2 3 1", "Yes"),
    tc("3\n1 2 3", "No"),
  ],
  "dsa/hashing/majority-element": [
    tc("5\n2 2 1 1 2", "2"),
    tc("3\n3 3 4", "3"),
  ],
  "dsa/hashing/group-anagrams-lite": [
    tc("3\neat tea tan", "eat tea\ntan"),
  ],
  "dsa/hashing/first-missing-positive-lite": [
    tc("3\n3 0 1", "2"),
    tc("2\n0 1", "2"),
  ],
  "dsa/dynamic-programming/climbing-stairs": [
    tc("2", "2"),
    tc("3", "3"),
  ],
  "dsa/dynamic-programming/house-robber": [
    tc("4\n1 2 3 1", "4"),
    tc("5\n2 7 9 3 1", "12"),
  ],
  "dsa/dynamic-programming/coin-change-count": [
    tc("3 5\n1 2 5", "4"),
    tc("1 3\n2", "0"),
  ],
  "dsa/dynamic-programming/longest-increasing": [
    tc("8\n10 9 2 5 3 7 101 18", "4"),
    tc("1\n5", "1"),
  ],
  "dsa/dynamic-programming/unique-paths": [
    tc("3 7", "28"),
    tc("3 2", "3"),
  ],
  "pf/operators/four-arithmetic": [
    tc("7 3", "10 4 21 2"),
    tc("5 5", "10 0 25 1"),
  ],
  "pf/operators/quotient-remainder": [
    tc("17 5", "3 2"),
    tc("20 4", "5 0"),
  ],
  "pf/operators/last-digit": [
    tc("127", "7"),
    tc("0", "0"),
  ],
  "pf/operators/strictly-increasing": [
    tc("1 4 9", "Yes"),
    tc("2 2 5", "No"),
  ],
  "pf/operators/absolute-difference": [
    tc("3 10", "7"),
    tc("8 2", "6"),
  ],
  "pf/nested-loops/square-of-stars": [
    tc("3", "***\n***\n***"),
    tc("1", "*"),
  ],
  "pf/nested-loops/inverted-triangle": [
    tc("3", "***\n**\n*"),
    tc("1", "*"),
  ],
  "pf/nested-loops/floyd-triangle": [
    tc("3", "1\n2 3\n4 5 6"),
    tc("1", "1"),
  ],
  "pf/nested-loops/count-pairs-sum": [
    tc("5 6\n1 5 3 3 4", "2"),
    tc("4 4\n1 1 1 1", "6"),
  ],
  "pf/nested-loops/spiral-order": [
    tc("3\n1 2 3\n4 5 6\n7 8 9", "1 2 3 6 9 8 7 4 5"),
    tc("1\n8", "8"),
  ],
  "pf/characters/char-kind": [
    tc("A", "Letter"),
    tc("7", "Digit"),
    tc("#", "Other"),
  ],
  "pf/characters/to-uppercase-char": [
    tc("b", "B"),
    tc("B", "B"),
    tc("3", "3"),
  ],
  "pf/characters/count-consonants": [
    tc("hello", "3"),
    tc("aei", "0"),
  ],
  "pf/characters/shift-letter": [
    tc("a", "b"),
    tc("z", "a"),
  ],
  "pf/characters/toggle-case": [
    tc("AbC12", "aBc12"),
    tc("Hi!", "hI!"),
  ],
  "pf/two-d-arrays/matrix-sum": [
    tc("2 3\n1 2 3\n4 5 6", "21"),
    tc("1 1\n9", "9"),
  ],
  "pf/two-d-arrays/row-sums": [
    tc("2 3\n1 2 3\n4 5 6", "6\n15"),
    tc("1 2\n4 5", "9"),
  ],
  "pf/two-d-arrays/main-diagonal": [
    tc("3\n1 2 3\n4 5 6\n7 8 9", "15"),
    tc("2\n1 0\n0 1", "2"),
  ],
  "pf/two-d-arrays/search-matrix": [
    tc("2 2\n1 8\n3 4\n8", "Yes"),
    tc("2 2\n1 8\n3 4\n7", "No"),
  ],
  "pf/two-d-arrays/transpose-matrix": [
    tc("2 3\n1 2 3\n4 5 6", "1 4\n2 5\n3 6"),
    tc("1 1\n2", "2"),
  ],
  "dsa/two-pointers/pair-sum-sorted": [
    tc("4 9\n2 7 11 15", "0 1"),
    tc("3 10\n1 2 3", "-1 -1"),
  ],
  "dsa/two-pointers/remove-val-inplace": [
    tc("4 3\n3 2 2 3", "2\n2 2"),
    tc("1 1\n1", "0"),
  ],
  "dsa/two-pointers/container-water": [
    tc("9\n1 8 6 2 5 4 8 3 7", "49"),
    tc("2\n1 1", "1"),
  ],
  "dsa/two-pointers/trapping-rain": [
    tc("12\n0 1 0 2 1 0 1 3 2 1 2 1", "6"),
    tc("3\n4 2 3", "1"),
  ],
  "dsa/two-pointers/three-sum-zero": [
    tc("6\n-1 0 1 2 -1 -4", "2"),
    tc("3\n0 1 1", "0"),
  ],
  "dsa/sliding-window/max-sum-window": [
    tc("5 2\n1 4 2 10 2", "12"),
    tc("3 3\n1 2 3", "6"),
  ],
  "dsa/sliding-window/longest-unique": [
    tc("abcabcbb", "3"),
    tc("bbbbb", "1"),
  ],
  "dsa/sliding-window/min-subarray-sum": [
    tc("7 6\n2 3 1 2 4 3", "2"),
    tc("100 3\n1 1 1", "0"),
  ],
  "dsa/sliding-window/longest-ones-flip": [
    tc("11 2\n1 1 1 0 0 0 1 1 1 1 0", "6"),
    tc("4 0\n1 0 1 0", "1"),
  ],
  "dsa/sliding-window/min-window-cover": [
    tc("ADOBECODEBANC\nABC", "BANC"),
    tc("a\naa", "-"),
  ],
  "dsa/prefix-sums/range-sum": [
    tc("5 2 4\n1 2 3 4 5", "9"),
    tc("3 1 1\n9 8 7", "9"),
  ],
  "dsa/prefix-sums/equilibrium-index": [
    tc("6\n1 7 3 6 5 6", "3"),
    tc("3\n1 2 3", "-1"),
  ],
  "dsa/prefix-sums/subarray-sum-k": [
    tc("4 2\n1 1 1 1", "3"),
    tc("3 0\n1 -1 0", "3"),
  ],
  "dsa/prefix-sums/product-except-self": [
    tc("4\n1 2 3 4", "24 12 8 6"),
    tc("2\n2 5", "5 2"),
  ],
  "dsa/prefix-sums/contiguous-array": [
    tc("6\n0 1 0 0 1 1", "6"),
    tc("2\n0 0", "0"),
  ],
  "dsa/heaps/last-stone-weight": [
    tc("6\n2 7 4 1 8 1", "1"),
    tc("1\n5", "5"),
  ],
  "dsa/heaps/k-closest": [
    tc("3 1\n0 1\n5 0\n4 4", "0 1"),
    tc("3 2\n1 3\n-2 2\n2 2", "-2 2\n2 2"),
  ],
  "dsa/heaps/top-k-frequent": [
    tc("6 2\n1 1 1 2 2 3", "1 2"),
    tc("4 1\n4 4 4 4", "4"),
  ],
  "dsa/heaps/kth-in-stream": [
    tc("3 3\n4 5 8\n3\n2 3 5", "4\n4\n5"),
    tc("1 1\n2\n2\n1 3", "2\n3"),
  ],
  "dsa/heaps/median-stream": [
    tc("5\n1 2 3 4 5", "1\n1\n2\n2\n3"),
    tc("1\n7", "7"),
  ],
  "dsa/backtracking/permutations": [
    tc("2\n1 2", "1 2\n2 1"),
    tc("1\n9", "9"),
  ],
  "dsa/backtracking/combinations": [
    tc("4 2", "1 2\n1 3\n1 4\n2 3\n2 4\n3 4"),
    tc("1 1", "1"),
  ],
  "dsa/backtracking/letter-phone": [
    tc("23", "ad ae af bd be bf cd ce cf"),
    tc("2", "a b c"),
  ],
  "dsa/backtracking/n-queens-count": [
    tc("4", "2"),
    tc("1", "1"),
  ],
  "dsa/backtracking/word-search": [
    tc("3 4\nABCE\nSFCS\nADEE\nABCCED", "Yes"),
    tc("3 4\nABCE\nSFCS\nADEE\nABCB", "No"),
  ],
  "dsa/greedy/assign-cookies": [
    tc("3 2\n1 2 3\n1 1", "1"),
    tc("2 3\n1 2\n1 2 3", "2"),
  ],
  "dsa/greedy/jump-game": [
    tc("5\n2 3 1 1 4", "Yes"),
    tc("5\n3 2 1 0 4", "No"),
  ],
  "dsa/greedy/activity-selection": [
    tc("3\n1 2\n3 4\n0 6", "2"),
    tc("1\n5 9", "1"),
  ],
  "dsa/greedy/gas-station": [
    tc("5\n1 2 3 4 5\n3 4 5 1 2", "3"),
    tc("3\n2 3 4\n3 4 3", "-1"),
  ],
  "dsa/greedy/jump-game-two": [
    tc("5\n2 3 1 1 4", "2"),
    tc("1\n0", "0"),
  ],
  "dsa/bst/bst-insert-print": [
    tc("5\n4 2 6 1 3", "1 2 3 4 6"),
    tc("1\n7", "7"),
  ],
  "dsa/bst/lca-bst": [
    tc("7 2 8\n6 2 8 0 4 7 9", "6"),
    tc("7 2 4\n6 2 8 0 4 7 9", "2"),
  ],
  "dsa/bst/validate-bst": [
    tc("3\n2 1 3", "Yes"),
    tc("3\n5 1 4", "No"),
  ],
  "dsa/bst/kth-smallest-bst": [
    tc("4 1\n3 1 4 2", "1"),
    tc("4 3\n3 1 4 2", "3"),
  ],
  "dsa/bst/delete-bst": [
    tc("5 3\n5 3 6 2 4", "2 4 5 6"),
    tc("3 2\n2 1 3", "1 3"),
  ],
  "dsa/dp-advanced/zero-one-knapsack": [
    tc("3 4\n1 2\n3 4\n4 5", "6"),
    tc("1 5\n2 10", "10"),
  ],
  "dsa/dp-advanced/lcs-length": [
    tc("abcde\nace", "3"),
    tc("abc\ndef", "0"),
  ],
  "dsa/dp-advanced/edit-distance": [
    tc("horse\nros", "3"),
    tc("a\na", "0"),
  ],
  "dsa/dp-advanced/longest-palindrome-subseq": [
    tc("bbbab", "4"),
    tc("cbbd", "2"),
  ],
  "dsa/dp-advanced/partition-equal": [
    tc("4\n1 5 11 5", "Yes"),
    tc("3\n1 2 5", "No"),
  ],
};

const PUBLIC_SAMPLE_COUNT = 2;

function getPublicSamples(problemId) {
  const tests = catalog[problemId];
  if (!tests || tests.length === 0) {
    return [];
  }
  return tests.slice(0, PUBLIC_SAMPLE_COUNT).map((test) => ({
    input: test.input,
    output: test.expectedOutput,
  }));
}

function getProblemTests(problemId) {
  const tests = catalog[problemId];
  if (!tests) {
    return null;
  }
  return tests;
}

function isKnownProblem(problemId) {
  return Object.prototype.hasOwnProperty.call(catalog, problemId);
}

module.exports = {
  PUBLIC_SAMPLE_COUNT,
  getProblemTests,
  getPublicSamples,
  isKnownProblem,
};
