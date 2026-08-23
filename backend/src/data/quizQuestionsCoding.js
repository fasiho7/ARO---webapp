/**
 * Coding quiz questions for Aro controlled coding exams.
 * Includes problem description, starter template, public samples, and hidden test cases.
 * Hidden test cases remain strictly on the backend and are NEVER sent to the client.
 */

function cq(id, topic, subtopic, difficulty, title, problemStatement, starterCode, sampleCases, hiddenTests, defaultLanguage = "python") {
  return {
    id,
    type: "coding",
    topic,
    subtopic,
    difficulty,
    question: `${title}: ${problemStatement}`,
    title,
    problemStatement,
    starterCode,
    sampleCases,
    hiddenTests,
    language: defaultLanguage,
  };
}

const codingQuestions = [
  // PF Easy: Sum of Two Numbers
  cq(
    "pf-code-1",
    "pf",
    "functions",
    "easy",
    "Sum of Two Numbers",
    "Read two integers from standard input and print their sum.",
    `import sys

def main():
    lines = sys.stdin.read().split()
    if len(lines) >= 2:
        a = int(lines[0])
        b = int(lines[1])
        print(a + b)

if __name__ == "__main__":
    main()
`,
    [
      { input: "3 5\n", output: "8" },
      { input: "10 20\n", output: "30" },
    ],
    [
      { input: "3 5\n", expectedOutput: "8" },
      { input: "10 20\n", expectedOutput: "30" },
      { input: "-5 15\n", expectedOutput: "10" },
      { input: "0 0\n", expectedOutput: "0" },
    ]
  ),

  // PF Easy: Even or Odd
  cq(
    "pf-code-even-odd",
    "pf",
    "conditions",
    "easy",
    "Even or Odd Integer",
    "Read a single integer N. Print 'Even' if it is divisible by 2, otherwise print 'Odd'.",
    `import sys

def main():
    line = sys.stdin.read().strip()
    if line:
        n = int(line)
        if n % 2 == 0:
            print("Even")
        else:
            print("Odd")

if __name__ == "__main__":
    main()
`,
    [
      { input: "4\n", output: "Even" },
      { input: "7\n", output: "Odd" },
    ],
    [
      { input: "4\n", expectedOutput: "Even" },
      { input: "7\n", expectedOutput: "Odd" },
      { input: "0\n", expectedOutput: "Even" },
      { input: "-3\n", expectedOutput: "Odd" },
    ]
  ),

  // PF Easy: Count Vowels
  cq(
    "pf-code-vowels",
    "pf",
    "strings",
    "easy",
    "Count Vowels in String",
    "Read a single string word. Print the count of vowels (a, e, i, o, u, case-insensitive).",
    `import sys

def main():
    s = sys.stdin.read().strip()
    if s:
        vowels = set("aeiouAEIOU")
        count = sum(1 for char in s if char in vowels)
        print(count)

if __name__ == "__main__":
    main()
`,
    [
      { input: "hello\n", output: "2" },
      { input: "programming\n", output: "3" },
    ],
    [
      { input: "hello\n", expectedOutput: "2" },
      { input: "programming\n", expectedOutput: "3" },
      { input: "rhythm\n", expectedOutput: "0" },
      { input: "AEIOU\n", expectedOutput: "5" },
    ]
  ),

  // PF Easy: Sum of Three Numbers
  cq(
    "pf-code-sum-three",
    "pf",
    "functions",
    "easy",
    "Sum of Three Numbers",
    "Read three integers and print their sum.",
    `import sys

def main():
    tokens = sys.stdin.read().split()
    if len(tokens) >= 3:
        nums = [int(x) for x in tokens[:3]]
        print(sum(nums))

if __name__ == "__main__":
    main()
`,
    [
      { input: "1 2 3\n", output: "6" },
      { input: "10 20 30\n", output: "60" },
    ],
    [
      { input: "1 2 3\n", expectedOutput: "6" },
      { input: "10 20 30\n", expectedOutput: "60" },
      { input: "-5 0 5\n", expectedOutput: "0" },
    ]
  ),

  // PF Easy: Min and Max of Three Numbers
  cq(
    "pf-code-min-max",
    "pf",
    "conditions",
    "easy",
    "Min and Max of Three Numbers",
    "Read three integers. Print the minimum value and maximum value separated by a space.",
    `import sys

def main():
    tokens = sys.stdin.read().split()
    if len(tokens) >= 3:
        nums = [int(x) for x in tokens[:3]]
        print(f"{min(nums)} {max(nums)}")

if __name__ == "__main__":
    main()
`,
    [
      { input: "3 1 2\n", output: "1 3" },
      { input: "5 5 5\n", output: "5 5" },
    ],
    [
      { input: "3 1 2\n", expectedOutput: "1 3" },
      { input: "5 5 5\n", expectedOutput: "5 5" },
      { input: "-10 0 10\n", expectedOutput: "-10 10" },
    ]
  ),

  // PF Easy: Formatted Greeting
  cq(
    "pf-code-greeting",
    "pf",
    "input-output",
    "easy",
    "Formatted Greeting",
    "Read a single name string. Print 'Hello, <name>!'",
    `import sys

def main():
    name = sys.stdin.read().strip()
    if name:
        print(f"Hello, {name}!")

if __name__ == "__main__":
    main()
`,
    [
      { input: "Aro\n", output: "Hello, Aro!" },
      { input: "Ali\n", output: "Hello, Ali!" },
    ],
    [
      { input: "Aro\n", expectedOutput: "Hello, Aro!" },
      { input: "Ali\n", expectedOutput: "Hello, Ali!" },
    ]
  ),

  // PF Medium: Reverse Array Elements
  cq(
    "pf-code-2",
    "pf",
    "arrays",
    "medium",
    "Reverse Array Elements",
    "Read an integer N, followed by N integers. Print the integers in reverse order on a single line separated by spaces.",
    `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    nums.reverse()
    print(" ".join(map(str, nums)))

if __name__ == "__main__":
    main()
`,
    [
      { input: "5 1 2 3 4 5\n", output: "5 4 3 2 1" },
      { input: "3 10 20 30\n", output: "30 20 10" },
    ],
    [
      { input: "5 1 2 3 4 5\n", expectedOutput: "5 4 3 2 1" },
      { input: "3 10 20 30\n", expectedOutput: "30 20 10" },
      { input: "1 42\n", expectedOutput: "42" },
      { input: "4 -1 0 5 9\n", expectedOutput: "9 5 0 -1" },
    ]
  ),

  // PF Medium: Factorial of N
  cq(
    "pf-code-factorial",
    "pf",
    "loops",
    "medium",
    "Factorial of a Number",
    "Read a non-negative integer N (0 <= N <= 12). Print N! (factorial of N).",
    `import sys
import math

def main():
    s = sys.stdin.read().strip()
    if s:
        n = int(s)
        print(math.factorial(n))

if __name__ == "__main__":
    main()
`,
    [
      { input: "5\n", output: "120" },
      { input: "0\n", output: "1" },
    ],
    [
      { input: "5\n", expectedOutput: "120" },
      { input: "0\n", expectedOutput: "1" },
      { input: "1\n", expectedOutput: "1" },
      { input: "6\n", expectedOutput: "720" },
    ]
  ),

  // PF Hard: Palindrome String Checker
  cq(
    "pf-code-3",
    "pf",
    "strings",
    "hard",
    "Palindrome String Checker",
    "Read a single word string from input. Print 'YES' if it is a palindrome (case-insensitive), or 'NO' otherwise.",
    `import sys

def main():
    s = sys.stdin.read().strip()
    if not s:
        return
    s_lower = s.lower()
    if s_lower == s_lower[::-1]:
        print("YES")
    else:
        print("NO")

if __name__ == "__main__":
    main()
`,
    [
      { input: "racecar\n", output: "YES" },
      { input: "hello\n", output: "NO" },
    ],
    [
      { input: "racecar\n", expectedOutput: "YES" },
      { input: "hello\n", expectedOutput: "NO" },
      { input: "Madam\n", expectedOutput: "YES" },
      { input: "a\n", expectedOutput: "YES" },
      { input: "ab\n", expectedOutput: "NO" },
    ]
  ),

  // PF Hard: Prime Number Checker
  cq(
    "pf-code-prime",
    "pf",
    "loops",
    "hard",
    "Prime Number Checker",
    "Read an integer N. Print 'Yes' if N is a prime number (N > 1), or 'No' otherwise.",
    `import sys

def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def main():
    s = sys.stdin.read().strip()
    if s:
        n = int(s)
        print("Yes" if is_prime(n) else "No")

if __name__ == "__main__":
    main()
`,
    [
      { input: "7\n", output: "Yes" },
      { input: "1\n", output: "No" },
    ],
    [
      { input: "7\n", expectedOutput: "Yes" },
      { input: "1\n", expectedOutput: "No" },
      { input: "4\n", expectedOutput: "No" },
      { input: "29\n", expectedOutput: "Yes" },
    ]
  ),

  // OOP Easy: Rectangle Area
  cq(
    "oop-code-1",
    "oop",
    "classes",
    "easy",
    "Rectangle Area",
    "Read two positive integers (width and height). Output width * height.",
    `import sys

class Rectangle:
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h

def main():
    tokens = sys.stdin.read().split()
    if len(tokens) >= 2:
        w = int(tokens[0])
        h = int(tokens[1])
        rect = Rectangle(w, h)
        print(rect.area())

if __name__ == "__main__":
    main()
`,
    [
      { input: "4 5\n", output: "20" },
      { input: "10 10\n", output: "100" },
    ],
    [
      { input: "4 5\n", expectedOutput: "20" },
      { input: "10 10\n", expectedOutput: "100" },
      { input: "1 99\n", expectedOutput: "99" },
    ]
  ),

  // OOP Easy: Circle Perimeter
  cq(
    "oop-code-circle",
    "oop",
    "classes",
    "easy",
    "Circle Perimeter",
    "Read an integer radius R. Print the rounded perimeter of a circle using 3.14 * 2 * R.",
    `import sys

class Circle:
    def __init__(self, r):
        self.r = r

    def perimeter(self):
        return round(2 * 3.14 * self.r)

def main():
    s = sys.stdin.read().strip()
    if s:
        r = int(s)
        c = Circle(r)
        print(c.perimeter())

if __name__ == "__main__":
    main()
`,
    [
      { input: "5\n", output: "31" },
      { input: "10\n", output: "63" },
    ],
    [
      { input: "5\n", expectedOutput: "31" },
      { input: "10\n", expectedOutput: "63" },
      { input: "1\n", expectedOutput: "6" },
    ]
  ),

  // OOP Medium: Bank Account Operations
  cq(
    "oop-code-2",
    "oop",
    "encapsulation",
    "medium",
    "Bank Account Operations",
    "Read an initial balance B, and N transaction pairs (type: D for deposit or W for withdraw, amount). Print the final balance. If a withdrawal exceeds balance, ignore that withdrawal.",
    `import sys

class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    bal = int(tokens[0])
    acc = BankAccount(bal)
    idx = 1
    while idx + 1 < len(tokens):
        op = tokens[idx]
        amt = int(tokens[idx+1])
        if op == 'D':
            acc.deposit(amt)
        elif op == 'W':
            acc.withdraw(amt)
        idx += 2
    print(acc.balance)

if __name__ == "__main__":
    main()
`,
    [
      { input: "100 D 50 W 30\n", output: "120" },
      { input: "50 W 100 D 20\n", output: "70" },
    ],
    [
      { input: "100 D 50 W 30\n", expectedOutput: "120" },
      { input: "50 W 100 D 20\n", expectedOutput: "70" },
      { input: "200 W 50 W 50 W 50\n", expectedOutput: "50" },
    ]
  ),

  // OOP Hard: Polymorphic Employee Pay
  cq(
    "oop-code-employee",
    "oop",
    "polymorphism",
    "hard",
    "Polymorphic Employee Payroll",
    "Read employee type ('H' for Hourly with rate & hours, or 'S' for Salaried with monthly salary). Print the total pay.",
    `import sys

class Employee:
    def get_pay(self):
        return 0

class HourlyEmployee(Employee):
    def __init__(self, rate, hours):
        self.rate = rate
        self.hours = hours
    def get_pay(self):
        return self.rate * self.hours

class SalariedEmployee(Employee):
    def __init__(self, salary):
        self.salary = salary
    def get_pay(self):
        return self.salary

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    emp_type = tokens[0]
    if emp_type == 'H':
        rate = int(tokens[1])
        hours = int(tokens[2])
        emp = HourlyEmployee(rate, hours)
    else:
        salary = int(tokens[1])
        emp = SalariedEmployee(salary)
    print(emp.get_pay())

if __name__ == "__main__":
    main()
`,
    [
      { input: "H 20 40\n", output: "800" },
      { input: "S 5000\n", output: "5000" },
    ],
    [
      { input: "H 20 40\n", expectedOutput: "800" },
      { input: "S 5000\n", expectedOutput: "5000" },
      { input: "H 15 10\n", expectedOutput: "150" },
    ]
  ),

  // DSA Easy: Find Maximum Element
  cq(
    "dsa-code-1",
    "dsa",
    "arrays",
    "easy",
    "Find Maximum Element",
    "Read N followed by N integers. Print the maximum value.",
    `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    print(max(nums))

if __name__ == "__main__":
    main()
`,
    [
      { input: "5 3 7 2 9 4\n", output: "9" },
      { input: "3 -10 -5 -20\n", output: "-5" },
    ],
    [
      { input: "5 3 7 2 9 4\n", expectedOutput: "9" },
      { input: "3 -10 -5 -20\n", expectedOutput: "-5" },
      { input: "1 100\n", expectedOutput: "100" },
    ]
  ),

  // DSA Easy: Array Sum
  cq(
    "dsa-code-sum",
    "dsa",
    "arrays",
    "easy",
    "Sum of Array Elements",
    "Read N followed by N integers. Print the sum of all elements.",
    `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    print(sum(nums))

if __name__ == "__main__":
    main()
`,
    [
      { input: "4 1 2 3 4\n", output: "10" },
      { input: "3 -1 0 1\n", output: "0" },
    ],
    [
      { input: "4 1 2 3 4\n", expectedOutput: "10" },
      { input: "3 -1 0 1\n", expectedOutput: "0" },
      { input: "1 42\n", expectedOutput: "42" },
    ]
  ),

  // DSA Medium: Binary Search
  cq(
    "dsa-code-2",
    "dsa",
    "searching",
    "medium",
    "Binary Search Index",
    "Read N, followed by N sorted integers, then a target integer K. Print the 0-based index of K, or -1 if K is not in the array.",
    `import sys

def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    arr = [int(x) for x in tokens[1:n+1]]
    target = int(tokens[n+1])
    print(binary_search(arr, target))

if __name__ == "__main__":
    main()
`,
    [
      { input: "5 10 20 30 40 50 30\n", output: "2" },
      { input: "5 10 20 30 40 50 25\n", output: "-1" },
    ],
    [
      { input: "5 10 20 30 40 50 30\n", expectedOutput: "2" },
      { input: "5 10 20 30 40 50 25\n", expectedOutput: "-1" },
      { input: "4 1 3 5 7 1\n", expectedOutput: "0" },
      { input: "4 1 3 5 7 7\n", expectedOutput: "3" },
    ]
  ),

  // DSA Medium: Valid Parentheses
  cq(
    "dsa-code-parentheses",
    "dsa",
    "stacks",
    "medium",
    "Valid Parentheses Matching",
    "Read a string of brackets containing '()', '[]', '{}'. Print 'Yes' if valid, or 'No' otherwise.",
    `import sys

def is_valid(s):
    stack = []
    mapping = {")": "(", "]": "[", "}": "{"}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping.keys():
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
    return len(stack) == 0

def main():
    s = sys.stdin.read().strip()
    if s:
        print("Yes" if is_valid(s) else "No")

if __name__ == "__main__":
    main()
`,
    [
      { input: "()\n", output: "Yes" },
      { input: "([)]\n", output: "No" },
    ],
    [
      { input: "()\n", expectedOutput: "Yes" },
      { input: "([)]\n", expectedOutput: "No" },
      { input: "{[]}\n", expectedOutput: "Yes" },
      { input: "(\n", expectedOutput: "No" },
    ]
  ),

  // DSA Hard: Maximum Subarray (Kadane)
  cq(
    "dsa-code-kadane",
    "dsa",
    "arrays",
    "hard",
    "Maximum Subarray Sum",
    "Read N followed by N integers. Print the maximum contiguous subarray sum (Kadane's Algorithm).",
    `import sys

def max_subarray(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    print(max_subarray(nums))

if __name__ == "__main__":
    main()
`,
    [
      { input: "9 -2 1 -3 4 -1 2 1 -5 4\n", output: "6" },
      { input: "1 -3\n", output: "-3" },
    ],
    [
      { input: "9 -2 1 -3 4 -1 2 1 -5 4\n", expectedOutput: "6" },
      { input: "1 -3\n", expectedOutput: "-3" },
      { input: "5 5 4 -1 7 8\n", expectedOutput: "23" },
    ]
  ),
];

module.exports = { codingQuestions };
