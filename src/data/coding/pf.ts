import { makeProblem } from "./build";
import type { CodingTrack } from "./types";

export const pfTrack: CodingTrack = {
  id: "pf",
  slug: "pf",
  shortName: "PF",
  title: "Programming Fundamentals",
  description: "Build a strong foundation in programming and problem solving.",
  topics: [
    {
      slug: "variables-data-types",
      title: "Variables & Data Types",
      description: "Store values and choose the right type for each piece of data.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "swap-two-variables", "Swap Two Variables", "Easy", "Swap the values of two variables without mixing them up.", ["Use a temporary variable.", "Some languages also allow tuple-style swap."]),
        makeProblem(2, "sum-of-two-numbers", "Sum of Two Numbers", "Easy", "Read two integers and print their sum.", ["Store each number in its own variable.", "Watch overflow if the type is too small."]),
        makeProblem(3, "type-conversion", "Type Conversion", "Easy", "Convert a floating-point value to an integer by truncation.", ["Casting toward int drops the fraction.", "Print both the original and converted values."]),
        makeProblem(4, "ascii-of-character", "ASCII of a Character", "Easy", "Print the numeric code of a given character.", ["Characters are stored as small integers.", "Print the value using an integer conversion."]),
        makeProblem(5, "min-and-max-of-three", "Min and Max of Three", "Easy", "Given three numbers, print the smallest and the largest.", ["Compare them pairwise.", "You do not need arrays yet."]),
      ],
    },
    {
      slug: "input-output",
      title: "Input & Output",
      description: "Read values from the user and print clear results.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "echo-a-line", "Echo a Line", "Easy", "Read a line of text and print it back unchanged.", ["Read the full line, not just one word.", "Avoid adding extra spaces."]),
        makeProblem(2, "formatted-greeting", "Formatted Greeting", "Easy", "Read a name and print Hello, <name>!", ["Concatenate or use formatted print.", "Keep punctuation exact."]),
        makeProblem(3, "average-of-three", "Average of Three", "Easy", "Read three numbers and print their average.", ["Sum first, then divide.", "Use a floating type for the average."], {
          ioFormat:
            "Input:\nThree integers on one line, separated by spaces.\n\nOutput:\nThe average of the three numbers.",
          sampleStdin: "3 6 9",
          examples: [
            {
              input: "3 6 9",
              output: "6",
              explanation: "(3 + 6 + 9) / 3 = 6.",
            },
            {
              input: "2 2 2",
              output: "2",
              explanation: "All three values are 2, so the average is 2.",
            },
          ],
        }),
        makeProblem(4, "rectangle-area", "Rectangle Area", "Easy", "Read length and width and print the area.", ["Area is length times width.", "Confirm the input order."]),
        makeProblem(5, "seconds-to-hms", "Seconds to H:M:S", "Medium", "Convert a total number of seconds into hours, minutes, and seconds.", ["Use integer division and remainder.", "60 seconds make a minute, 3600 make an hour."]),
      ],
    },
    {
      slug: "conditions",
      title: "Conditions",
      description: "Branch with if/else so the program reacts to data.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "even-or-odd", "Even or Odd", "Easy", "Say whether an integer is even or odd.", ["Use modulo 2.", "Zero is even."]),
        makeProblem(2, "grade-from-score", "Grade from Score", "Easy", "Map a score 0–100 to A/B/C/D/F.", ["Check the highest band first.", "Handle scores outside 0–100."]),
        makeProblem(3, "largest-of-two", "Largest of Two", "Easy", "Print the larger of two numbers. If equal, say they are equal.", ["A simple comparison is enough.", "Do not forget the equal case."]),
        makeProblem(4, "leap-year", "Leap Year", "Medium", "Decide if a year is a leap year.", ["Divisible by 4, except centuries not divisible by 400.", "Test 1900, 2000, and 2024."]),
        makeProblem(5, "positive-negative-zero", "Positive, Negative, or Zero", "Easy", "Classify an integer as positive, negative, or zero.", ["Zero needs its own branch.", "Keep the labels exact."]),
      ],
    },
    {
      slug: "loops",
      title: "Loops",
      description: "Repeat work with for and while until a condition ends.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "print-1-to-n", "Print 1 to N", "Easy", "Print numbers from 1 to N on one line.", ["A single for-loop is enough.", "Separate values with spaces."]),
        makeProblem(2, "sum-1-to-n", "Sum 1 to N", "Easy", "Compute 1 + 2 + … + N.", ["Accumulate in a running total.", "The formula N*(N+1)/2 also works."]),
        makeProblem(3, "factorial", "Factorial", "Easy", "Compute N! for a small N.", ["Multiply from 1 to N.", "0! is 1."]),
        makeProblem(4, "multiplication-table", "Multiplication Table", "Easy", "Print the table of N from 1 to 10.", ["Loop the multiplier from 1 to 10.", "Format as N x i = product."]),
        makeProblem(5, "count-digits", "Count Digits", "Medium", "Count how many digits an integer has.", ["Repeatedly divide by 10.", "Treat 0 as one digit."]),
      ],
    },
    {
      slug: "functions",
      title: "Functions",
      description: "Split logic into reusable functions with parameters and return values.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "is-prime", "Is Prime", "Easy", "Return whether N is a prime number.", ["Check divisors up to sqrt(N).", "Numbers less than 2 are not prime."]),
        makeProblem(2, "gcd", "GCD", "Easy", "Return the greatest common divisor of two integers.", ["Euclid's algorithm uses remainders.", "GCD(a, 0) is a."]),
        makeProblem(3, "power", "Power", "Easy", "Compute base^exponent for a non-negative exponent.", ["Multiply in a loop.", "Anything to the power 0 is 1."]),
        makeProblem(4, "ncr", "nCr", "Medium", "Compute combinations n choose r.", ["nCr = n! / (r! (n-r)!).", "Reduce overflow by simplifying as you multiply."]),
        makeProblem(5, "temperature-convert", "Temperature Convert", "Easy", "Write functions to convert C to F and F to C.", ["F = C * 9/5 + 32.", "Keep the conversion in a function, not main."]),
      ],
    },
    {
      slug: "arrays",
      title: "Arrays",
      description: "Store sequences of values and process them with indexes.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "array-sum", "Array Sum", "Easy", "Print the sum of all elements in an array.", ["Walk the array once.", "Start the total at 0."]),
        makeProblem(2, "array-average", "Array Average", "Easy", "Print the average of the array values.", ["Sum, then divide by length.", "Use a floating result."]),
        makeProblem(3, "count-occurrences", "Count Occurrences", "Easy", "Count how many times a target appears.", ["Compare each element to the target.", "The count can be zero."]),
        makeProblem(4, "second-largest", "Second Largest", "Medium", "Find the second largest distinct value.", ["Track largest and second as you scan.", "Skip duplicates of the maximum."]),
        makeProblem(5, "reverse-in-place", "Reverse In Place", "Easy", "Reverse the array without extra storage.", ["Swap from both ends.", "Stop when the indexes meet."]),
      ],
    },
    {
      slug: "strings",
      title: "Strings",
      description: "Work with text: length, reverse, search, and compare.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "string-length", "String Length", "Easy", "Count characters in a string without a built-in length if asked.", ["Walk until the terminator or end.", "Spaces count as characters."]),
        makeProblem(2, "reverse-string", "Reverse String", "Easy", "Print the reverse of a string.", ["Swap from both ends, or copy backwards.", "Keep case and spaces."]),
        makeProblem(3, "palindrome-string", "Palindrome String", "Easy", "Check whether a string reads the same forwards and backwards.", ["Compare i and n-1-i.", "Decide whether to ignore case."]),
        makeProblem(4, "count-vowels", "Count Vowels", "Easy", "Count vowels in a string.", ["Check a, e, i, o, u in both cases.", "Y is not required."]),
        makeProblem(5, "remove-spaces", "Remove Spaces", "Medium", "Return the string with all spaces removed.", ["Build a new string of non-space characters.", "Tabs can stay unless specified."]),
      ],
    },
    {
      slug: "pointers",
      title: "Pointers",
      description: "Use addresses to read and update values indirectly.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "swap-with-pointers", "Swap with Pointers", "Easy", "Swap two integers using pointers.", ["Dereference to read and write.", "A temp variable still helps."]),
        makeProblem(2, "print-via-pointer", "Print via Pointer", "Easy", "Print an integer using a pointer to it.", ["The pointer stores an address.", "*p is the value at that address."]),
        makeProblem(3, "array-with-pointer", "Walk Array with Pointer", "Medium", "Sum an array using pointer arithmetic.", ["p + i points to element i.", "Do not walk off the end."]),
        makeProblem(4, "pointer-to-max", "Pointer to Max", "Medium", "Return a pointer to the largest element.", ["Scan once, keep the address of the max.", "Handle an empty array if required."]),
        makeProblem(5, "null-check", "Null Check", "Easy", "Safely print a value only if the pointer is not null.", ["Never dereference NULL.", "Print a fallback message otherwise."]),
      ],
    },
    {
      slug: "recursion",
      title: "Recursion",
      description: "Solve problems by calling the same function on a smaller input.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "recursive-factorial", "Recursive Factorial", "Easy", "Compute N! with recursion.", ["Base case: 0! and 1! are 1.", "Return n * fact(n-1)."]),
        makeProblem(2, "recursive-fibonacci", "Recursive Fibonacci", "Easy", "Return the Nth Fibonacci number.", ["F(0)=0, F(1)=1.", "This version can be slow; that is OK here."]),
        makeProblem(3, "sum-to-n-recursive", "Sum to N Recursive", "Easy", "Sum 1..N using recursion.", ["Base: n <= 0 returns 0.", "Return n + sum(n-1)."]),
        makeProblem(4, "reverse-digits", "Reverse Digits", "Medium", "Print the digits of N in reverse using recursion.", ["Print N%10, then recurse on N/10.", "Watch leading zeros in the reverse."]),
        makeProblem(5, "power-recursive", "Power Recursive", "Medium", "Compute base^exp recursively.", ["base^0 is 1.", "You can square for a faster version later."]),
      ],
    },
    {
      slug: "basic-problem-solving",
      title: "Basic Problem Solving",
      description: "Combine input, conditions, and loops on small worded tasks.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "fizzbuzz", "FizzBuzz", "Easy", "Print 1..N, replacing multiples of 3 with Fizz, 5 with Buzz, both with FizzBuzz.", ["Check 15 first.", "Otherwise print the number."]),
        makeProblem(2, "palindrome-number", "Palindrome Number", "Easy", "Check whether an integer is a palindrome.", ["Reverse the digits and compare.", "Negative numbers are usually not palindromes."]),
        makeProblem(3, "armstrong-number", "Armstrong Number", "Medium", "Check if a number equals the sum of its digits each raised to the count of digits.", ["Count digits first.", "Then sum digit^k."]),
        makeProblem(4, "pattern-triangle", "Pattern Triangle", "Easy", "Print a right triangle of stars of height N.", ["Outer loop is rows.", "Inner loop prints i stars."]),
        makeProblem(5, "simple-calculator", "Simple Calculator", "Easy", "Read two numbers and an operator +, -, *, / and print the result.", ["Switch on the operator.", "Guard against divide by zero."]),
      ],
    },
    {
      slug: "operators",
      title: "Operators",
      description: "Use arithmetic, remainder, and comparison operators on real inputs.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "four-arithmetic", "Four Arithmetic Results", "Easy", "Read two integers a and b. Print a+b, a-b, a*b, and integer a/b on one line.", ["Integer division truncates toward zero in most contest settings here.", "Print four numbers separated by spaces."], {
          ioFormat: "Input:\nTwo integers a and b.\n\nOutput:\na+b a-b a*b a/b",
          sampleStdin: "7 3",
          examples: [
            { input: "7 3", output: "10 4 21 2", explanation: "7+3=10, 7-3=4, 7*3=21, 7/3=2." },
            { input: "5 5", output: "10 0 25 1" },
          ],
        }),
        makeProblem(2, "quotient-remainder", "Quotient and Remainder", "Easy", "Read a and b (b > 0). Print the quotient and remainder of a divided by b.", ["quotient = a / b, remainder = a % b.", "Remainder is 0 when a is a multiple of b."], {
          sampleStdin: "17 5",
          examples: [
            { input: "17 5", output: "3 2" },
            { input: "20 4", output: "5 0" },
          ],
        }),
        makeProblem(3, "last-digit", "Last Digit", "Easy", "Print the last digit of a non-negative integer n.", ["Last digit is n % 10.", "The last digit of 0 is 0."], {
          sampleStdin: "127",
          examples: [
            { input: "127", output: "7" },
            { input: "0", output: "0" },
          ],
        }),
        makeProblem(4, "strictly-increasing", "Strictly Increasing Triple", "Easy", "Read three integers. Print Yes if they are strictly increasing, otherwise No.", ["Need a < b and b < c.", "Equals are not strictly increasing."], {
          sampleStdin: "1 4 9",
          examples: [
            { input: "1 4 9", output: "Yes" },
            { input: "2 2 5", output: "No" },
          ],
        }),
        makeProblem(5, "absolute-difference", "Absolute Difference", "Easy", "Print the absolute difference of two integers.", ["If a >= b print a-b, else b-a.", "Do not print a minus sign."], {
          sampleStdin: "3 10",
          examples: [
            { input: "3 10", output: "7" },
            { input: "8 2", output: "6" },
          ],
        }),
      ],
    },
    {
      slug: "nested-loops",
      title: "Nested Loops",
      description: "Use a loop inside a loop for patterns and pairwise work.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "square-of-stars", "Square of Stars", "Easy", "Print an n×n square of asterisks, n lines of n stars each with no spaces.", ["Outer loop is rows.", "Inner loop prints n stars."], {
          sampleStdin: "3",
          examples: [
            { input: "3", output: "***\n***\n***" },
            { input: "1", output: "*" },
          ],
        }),
        makeProblem(2, "inverted-triangle", "Inverted Triangle", "Easy", "Print an inverted right triangle of height n: n stars, then n-1, down to 1.", ["Row i (1-indexed) has n-i+1 stars.", "No extra spaces."], {
          sampleStdin: "4",
          examples: [
            { input: "3", output: "***\n**\n*" },
          ],
        }),
        makeProblem(3, "floyd-triangle", "Floyd Triangle", "Easy", "Print Floyd's triangle of n rows: consecutive integers starting at 1.", ["Keep a running counter.", "Row i contains i numbers."], {
          sampleStdin: "3",
          examples: [
            { input: "3", output: "1\n2 3\n4 5 6", explanation: "Row 1 has 1 number, row 2 has 2, row 3 has 3." },
          ],
        }),
        makeProblem(4, "count-pairs-sum", "Count Pairs with Sum", "Medium", "Given n, target k, and n integers, count pairs i < j whose values sum to k.", ["Brute force two nested loops is acceptable.", "Do not count a pair twice."], {
          ioFormat: "Input:\nn k\nn integers\n\nOutput:\nThe number of pairs.",
          sampleStdin: "5 6\n1 5 3 3 4",
          examples: [
            { input: "5 6\n1 5 3 3 4", output: "2", explanation: "Pairs (1,5) and (3,3)." },
            { input: "4 4\n1 1 1 1", output: "6" },
          ],
        }),
        makeProblem(5, "spiral-order", "Spiral Order", "Hard", "Read n then an n×n matrix (n rows of n integers). Print the spiral order starting at the top-left going right, on one line.", ["Keep four bounds: top, bottom, left, right.", "Walk right, down, left, up, and shrink the bounds."], {
          sampleStdin: "3\n1 2 3\n4 5 6\n7 8 9",
          examples: [
            { input: "3\n1 2 3\n4 5 6\n7 8 9", output: "1 2 3 6 9 8 7 4 5" },
            { input: "1\n8", output: "8" },
          ],
        }),
      ],
    },
    {
      slug: "characters",
      title: "Characters",
      description: "Classify, convert, and transform individual characters.",
      difficulty: "Beginner",
      problems: [
        makeProblem(1, "char-kind", "Character Kind", "Easy", "Read one character. Print Digit, Letter, or Other.", ["Digits are 0-9.", "Letters are A-Z and a-z."], {
          sampleStdin: "A",
          examples: [
            { input: "A", output: "Letter" },
            { input: "7", output: "Digit" },
            { input: "#", output: "Other" },
          ],
        }),
        makeProblem(2, "to-uppercase-char", "Uppercase Character", "Easy", "If the character is a lowercase letter, print its uppercase form; otherwise print it unchanged.", ["'a' differs from 'A' by 32 in ASCII.", "Non-letters stay the same."], {
          sampleStdin: "b",
          examples: [
            { input: "b", output: "B" },
            { input: "B", output: "B" },
            { input: "3", output: "3" },
          ],
        }),
        makeProblem(3, "count-consonants", "Count Consonants", "Easy", "Count consonants in a lowercase/uppercase word (letters that are not a,e,i,o,u).", ["Ignore non-letters.", "Y counts as a consonant here."], {
          sampleStdin: "hello",
          examples: [
            { input: "hello", output: "3", explanation: "h, l, l are consonants." },
            { input: "aei", output: "0" },
          ],
        }),
        makeProblem(4, "shift-letter", "Shift Letter by One", "Easy", "Read a lowercase letter and print the next letter. If it is z, print a.", ["Wrap around after z.", "Input is a single lowercase letter."], {
          sampleStdin: "a",
          examples: [
            { input: "a", output: "b" },
            { input: "z", output: "a" },
          ],
        }),
        makeProblem(5, "toggle-case", "Toggle Case", "Medium", "Read a string and toggle the case of every letter. Non-letters stay unchanged.", ["A becomes a, a becomes A.", "Digits and spaces stay."], {
          sampleStdin: "AbC12",
          examples: [
            { input: "AbC12", output: "aBc12" },
            { input: "Hi!", output: "hI!" },
          ],
        }),
      ],
    },
    {
      slug: "two-d-arrays",
      title: "2D Arrays",
      description: "Store a grid and walk rows, columns, and diagonals.",
      difficulty: "Intermediate",
      problems: [
        makeProblem(1, "matrix-sum", "Matrix Sum", "Easy", "Read n m, then an n×m matrix. Print the sum of all entries.", ["Nested loops over rows and columns.", "Start the total at 0."], {
          sampleStdin: "2 3\n1 2 3\n4 5 6",
          examples: [
            { input: "2 3\n1 2 3\n4 5 6", output: "21" },
            { input: "1 1\n9", output: "9" },
          ],
        }),
        makeProblem(2, "row-sums", "Row Sums", "Easy", "Print the sum of each row on its own line.", ["One inner loop per row.", "Do not print extra numbers."], {
          sampleStdin: "2 3\n1 2 3\n4 5 6",
          examples: [
            { input: "2 3\n1 2 3\n4 5 6", output: "6\n15" },
          ],
        }),
        makeProblem(3, "main-diagonal", "Main Diagonal Sum", "Easy", "Read n then an n×n matrix. Print the sum of the main diagonal.", ["Diagonal cells are a[i][i].", "There are n of them."], {
          sampleStdin: "3\n1 2 3\n4 5 6\n7 8 9",
          examples: [
            { input: "3\n1 2 3\n4 5 6\n7 8 9", output: "15", explanation: "1+5+9." },
          ],
        }),
        makeProblem(4, "search-matrix", "Search in Matrix", "Easy", "Read n m, a matrix, then a target. Print Yes if the target appears, otherwise No.", ["Scan every cell.", "Stop early if you want, but correctness first."], {
          sampleStdin: "2 2\n1 8\n3 4\n8",
          examples: [
            { input: "2 2\n1 8\n3 4\n8", output: "Yes" },
            { input: "2 2\n1 8\n3 4\n7", output: "No" },
          ],
        }),
        makeProblem(5, "transpose-matrix", "Transpose Matrix", "Medium", "Read n m and an n×m matrix. Print the m×n transpose.", ["Result[j][i] = original[i][j].", "Print m rows of n numbers."], {
          sampleStdin: "2 3\n1 2 3\n4 5 6",
          examples: [
            { input: "2 3\n1 2 3\n4 5 6", output: "1 4\n2 5\n3 6" },
          ],
        }),
      ],
    },
  ],
};
