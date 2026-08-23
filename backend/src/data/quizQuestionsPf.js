function q(id, topic, subtopic, difficulty, question, options, correctAnswer, explanation) {
  return { id, topic, subtopic, difficulty, question, options, correctAnswer, explanation };
}

const pfQuestions = [
  q("pf-var-1", "pf", "variables", "easy", "Which data type is most appropriate for storing a person's age in whole years?", ["float", "int", "boolean", "char"], 1, "Age in whole years is an integer quantity."),
  q("pf-var-2", "pf", "variables", "easy", "After `x = 5` then `x = x + 2`, what is the value of x?", ["5", "2", "7", "52"], 2, "Assignment replaces the old value. 5 + 2 is 7."),
  q("pf-var-3", "pf", "variables", "easy", "A boolean variable can store which pair of values?", ["0 and 1 only as strings", "true and false", "any integer", "only negative numbers"], 1, "Booleans represent true or false."),
  q("pf-var-4", "pf", "variables", "medium", "In most languages, converting 3.9 to an integer by truncation yields:", ["4", "3", "3.9", "an error always"], 1, "Truncation toward zero drops the fraction, so 3.9 becomes 3."),
  q("pf-var-5", "pf", "variables", "medium", "Which identifier is invalid in typical C-like syntax?", ["totalSum", "_count", "2ndValue", "userName"], 2, "Identifiers cannot start with a digit."),
  q("pf-var-6", "pf", "variables", "hard", "A 32-bit signed int overflows if you keep adding 1 past its maximum. What typically happens in two's complement wrap-around?", ["It becomes infinity", "It becomes the minimum negative value", "The program must crash", "It stays at the maximum"], 1, "Two's complement wrap-around goes from INT_MAX to INT_MIN."),

  q("pf-cond-1", "pf", "conditions", "easy", "Which operator tests equality in C, C++, Java, and JavaScript?", ["=", "==", ":=", "==="], 1, "`=` assigns; `==` compares values."),
  q("pf-cond-2", "pf", "conditions", "easy", "If `n = 7`, what does `n % 2 == 0` evaluate to?", ["true, because 7 is odd", "false", "2", "7"], 1, "7 modulo 2 is 1, so the even check is false."),
  q("pf-cond-3", "pf", "conditions", "easy", "An if/else chooses at most how many of the two branches to run?", ["Both always", "One of them", "Neither ever", "A random one"], 1, "Exactly one branch runs: the if body or the else body."),
  q("pf-cond-4", "pf", "conditions", "medium", "A year is a leap year if it is divisible by 400, or divisible by 4 but not by 100. Is 1900 a leap year?", ["Yes", "No", "Only in the Julian calendar for this rule", "Cannot tell"], 1, "1900 is divisible by 100 but not by 400, so it is not a leap year."),
  q("pf-cond-5", "pf", "conditions", "medium", "In a switch on integers, what happens if no case matches and there is no default?", ["The first case runs", "The last case runs", "No case body runs", "The program always errors"], 2, "Without a matching case or default, the switch does nothing."),
  q("pf-cond-6", "pf", "conditions", "hard", "Which expression is true when x is between 10 and 20 inclusive?", ["x > 10 && x < 20", "x >= 10 && x <= 20", "x >= 10 || x <= 20", "!(x < 10) && x == 20"], 1, "Inclusive range uses >= and <= on both ends."),

  q("pf-loop-1", "pf", "loops", "easy", "A for-loop that prints 1 through 5 should stop when the counter becomes:", ["5", "6", "0", "1"], 1, "After printing 5 the counter becomes 6 and the condition fails."),
  q("pf-loop-2", "pf", "loops", "easy", "Which loop is guaranteed to run its body at least once?", ["for", "while", "do-while", "infinite for with break only"], 2, "do-while checks the condition after the first body execution."),
  q("pf-loop-3", "pf", "loops", "easy", "What does `break` do inside a loop?", ["Skips the rest of this iteration", "Exits the loop immediately", "Restarts the program", "Pauses for input"], 1, "break leaves the innermost loop."),
  q("pf-loop-4", "pf", "loops", "medium", "How many times does `for (i = 0; i < n; i++)` run when n is 0?", ["0", "1", "n", "Infinite"], 0, "The condition i < 0 is false immediately."),
  q("pf-loop-5", "pf", "loops", "medium", "`continue` in a for-loop typically:", ["Ends the program", "Jumps to the next iteration after the update", "Deletes the loop variable", "Converts the loop to a while"], 1, "continue skips the rest of the body and proceeds with the increment/update."),
  q("pf-loop-6", "pf", "loops", "hard", "A nested loop with i from 1..n and j from 1..i runs how many inner-body executions?", ["n", "n²", "n(n+1)/2", "2n"], 2, "That is the triangular number 1+2+…+n."),

  q("pf-fn-1", "pf", "functions", "easy", "A function that returns no value is often declared to return:", ["int", "void", "string", "bool"], 1, "void means no return value."),
  q("pf-fn-2", "pf", "functions", "easy", "Parameters listed in the function definition are called:", ["arguments at the call site only", "formal parameters", "global variables", "return codes"], 1, "Definition parameters are formal parameters; call values are arguments."),
  q("pf-fn-3", "pf", "functions", "easy", "What is the result of a function whose only statement is `return a + b;` with a=2, b=3?", ["23", "5", "undefined", "0"], 1, "It returns the sum 5."),
  q("pf-fn-4", "pf", "functions", "medium", "Pass-by-value means the callee:", ["Receives a copy and cannot change the caller's variable", "Always changes the caller's variable", "Shares the same memory as a reference", "Cannot read the argument"], 0, "A copy is passed; mutating the parameter does not mutate the original."),
  q("pf-fn-5", "pf", "functions", "medium", "nCr (combinations) is undefined or zero when:", ["n = r", "r > n for non-negative integers", "n = 0", "r = 0"], 1, "You cannot choose more items than exist; r > n yields 0."),
  q("pf-fn-6", "pf", "functions", "hard", "A recursive function without a reachable base case will typically:", ["Return 0", "Cause unbounded recursion / stack overflow", "Run in constant time", "Be optimized to a loop always"], 1, "It keeps calling itself until the call stack is exhausted."),

  q("pf-arr-1", "pf", "arrays", "easy", "The first index of an array in C, C++, Java, and Python is:", ["1", "0", "-1", "n"], 1, "These languages use 0-based indexing."),
  q("pf-arr-2", "pf", "arrays", "easy", "For an array of n elements, the last valid index is:", ["n", "n-1", "n+1", "0"], 1, "Indices run from 0 through n-1."),
  q("pf-arr-3", "pf", "arrays", "easy", "To compute the sum of all elements you must visit:", ["Only the largest", "Every element once", "Only even indices", "The first and last only"], 1, "A full scan is required unless extra structure exists."),
  q("pf-arr-4", "pf", "arrays", "medium", "Accessing index n in an array of length n is:", ["Always the last element", "Out of range", "Equal to index 0", "The midpoint"], 1, "Valid indices are 0..n-1, so n is out of bounds."),
  q("pf-arr-5", "pf", "arrays", "medium", "Finding the second-largest distinct value requires care when:", ["All values are unique", "The maximum appears more than once", "n = 2 with different values", "The array is sorted descending with unique values"], 1, "Duplicates of the max must not be counted as second-largest."),
  q("pf-arr-6", "pf", "arrays", "hard", "Reversing an array in place with two pointers takes how much extra memory?", ["O(n)", "O(1)", "O(n log n)", "O(n²)"], 1, "Swapping from both ends uses constant extra space."),

  q("pf-str-1", "pf", "strings", "easy", "In C, a string is typically a sequence of characters ending with:", ["newline", "the null character '\\0'", "space", "EOF only"], 1, "C strings are null-terminated."),
  q("pf-str-2", "pf", "strings", "easy", "A palindrome reads the same:", ["only in uppercase", "forwards and backwards", "when sorted", "after removing vowels"], 1, "Palindromes match their reverse."),
  q("pf-str-3", "pf", "strings", "easy", "The length of \"hi\" as characters is:", ["1", "2", "3 including quotes", "0"], 1, "h and i are two characters."),
  q("pf-str-4", "pf", "strings", "medium", "To reverse a string in place you typically:", ["Allocate n extra strings", "Swap characters from both ends", "Sort the characters", "Convert to an integer"], 1, "Two-pointer swaps reverse in place."),
  q("pf-str-5", "pf", "strings", "medium", "Counting vowels usually treats which letters as vowels (basic English set)?", ["a e i o u", "a e i o u y always", "only a and e", "every consonant"], 0, "The basic set is a, e, i, o, u (both cases)."),
  q("pf-str-6", "pf", "strings", "hard", "Removing all spaces from a string of length n with a single extra buffer is:", ["O(1) time", "O(n) time", "O(n²) time always", "O(log n) time"], 1, "You scan each character once."),
];

module.exports = { pfQuestions };
