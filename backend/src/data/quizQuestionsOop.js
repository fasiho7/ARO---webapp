function q(id, topic, subtopic, difficulty, question, options, correctAnswer, explanation) {
  return { id, topic, subtopic, difficulty, question, options, correctAnswer, explanation };
}

const oopQuestions = [
  q("oop-cls-1", "oop", "classes", "easy", "A class is best described as:", ["A single running program", "A blueprint for creating objects", "A database table", "A loop construct"], 1, "Objects are instances created from a class."),
  q("oop-cls-2", "oop", "classes", "easy", "An object stores its own copy of:", ["Only static methods", "Instance data members", "The source file", "The compiler"], 1, "Each instance has its own field values."),
  q("oop-cls-3", "oop", "classes", "easy", "Calling a function that belongs to an object is calling a:", ["macro", "method / member function", "namespace", "preprocessor"], 1, "Behavior attached to the class is a method."),
  q("oop-cls-4", "oop", "classes", "medium", "Two Counter objects increment independently because:", ["They share one global count", "Each instance has its own count field", "The class cannot have fields", "Methods are not allowed"], 1, "Instance state is per object."),
  q("oop-cls-5", "oop", "classes", "medium", "The `this` pointer/reference in a method refers to:", ["The base class only", "The current object", "A random instance", "The operating system"], 1, "`this` is the instance the method was invoked on."),
  q("oop-cls-6", "oop", "classes", "hard", "If many objects of the same class exist, methods in memory are typically:", ["Fully copied per object in every language", "Shared code, with per-object data", "Stored in the stack frame of main only", "Impossible"], 1, "Code is shared; data differs per instance."),

  q("oop-ctor-1", "oop", "constructors", "easy", "A constructor runs when:", ["The object is destroyed", "The object is created", "A method returns", "The program exits"], 1, "Construction initializes a new instance."),
  q("oop-ctor-2", "oop", "constructors", "easy", "A default constructor typically:", ["Takes no parameters (or all defaulted)", "Must take three parameters", "Deletes the object", "Is the destructor"], 0, "It allows `Type obj;` style creation."),
  q("oop-ctor-3", "oop", "constructors", "easy", "Constructor overloading means:", ["Two destructors", "Multiple constructors with different parameter lists", "Inheriting twice", "Friend functions only"], 1, "Same name, different signatures."),
  q("oop-ctor-4", "oop", "constructors", "medium", "A copy constructor initializes a new object from:", ["An integer always", "Another object of the same type", "A file path only", "The heap size"], 1, "It copies existing instance state into a new instance."),
  q("oop-ctor-5", "oop", "constructors", "medium", "Member initializer lists in C++ are required for:", ["All ints", "const and reference members (among others)", "Every cout statement", "virtual functions"], 1, "Those members must be initialized, not assigned later."),
  q("oop-ctor-6", "oop", "constructors", "hard", "If a class owns a heap array, the default copy constructor is dangerous because it typically performs a:", ["Deep copy of the array", "Shallow copy of the pointer", "Move only", "No copy at all"], 1, "Both objects would share (and later double-free) the same block."),

  q("oop-enc-1", "oop", "encapsulation", "easy", "Encapsulation mainly means:", ["Using only global variables", "Bundling data with methods and hiding internals", "Avoiding classes", "Printing objects"], 1, "Keep representation private; expose a safe interface."),
  q("oop-enc-2", "oop", "encapsulation", "easy", "Private members are accessible from:", ["Any function in the program", "Other classes always", "Methods of the same class", "The operating system"], 2, "Privacy is class-scoped, not object-scoped."),
  q("oop-enc-3", "oop", "encapsulation", "easy", "A getter typically:", ["Destroys the object", "Returns a field (or computed value) without exposing assignment", "Opens a socket", "Compiles the class"], 1, "Read access without making the field public."),
  q("oop-enc-4", "oop", "encapsulation", "medium", "A setter should reject invalid values so that:", ["The object stays in a valid state (invariants)", "Getters become unused", "Inheritance is disabled", "The destructor never runs"], 0, "Validation preserves class invariants."),
  q("oop-enc-5", "oop", "encapsulation", "medium", "A read-only ID field is usually:", ["Public and writable", "Set in the constructor with a getter and no setter", "A global int", "Stored in the destructor"], 1, "Initialize once; do not offer a setter."),
  q("oop-enc-6", "oop", "encapsulation", "hard", "Making every field public \"for convenience\" mainly harms:", ["Compilation speed only", "The ability to change representation and enforce rules", "The stack size", "Virtual tables"], 1, "You lose control of invariants and coupling increases."),

  q("oop-inh-1", "oop", "inheritance", "easy", "Inheritance models a relationship that is primarily:", ["has-a", "is-a", "uses-a file", "equals-a"], 1, "A Car is-a Vehicle."),
  q("oop-inh-2", "oop", "inheritance", "easy", "The derived class typically:", ["Deletes the base class", "Reuses and extends base members", "Cannot have methods", "Must be empty"], 1, "Children add or override behavior."),
  q("oop-inh-3", "oop", "inheritance", "easy", "Protected members are visible to:", ["The whole program", "Derived classes (not general outside code)", "Only friend OS APIs", "No one"], 1, "Protected is for the hierarchy."),
  q("oop-inh-4", "oop", "inheritance", "medium", "Multilevel inheritance is:", ["A → B → C", "A and B both inherit C only as friends", "No classes", "Only interfaces"], 0, "A chain of derivation."),
  q("oop-inh-5", "oop", "inheritance", "medium", "Hierarchical inheritance is:", ["One base, several derived classes", "One class only", "Templates only", "Multiple main() functions"], 0, "Several children share one parent."),
  q("oop-inh-6", "oop", "inheritance", "hard", "Overriding a method in a derived class means:", ["Same signature, new implementation", "Different name required", "Deleting the base method from the binary", "Only changing parameter names"], 0, "Runtime or static dispatch then uses the child version as designed."),

  q("oop-poly-1", "oop", "polymorphism", "easy", "Polymorphism lets you:", ["Use one interface with many underlying types", "Avoid functions", "Store only integers", "Disable inheritance"], 0, "The same call can run different implementations."),
  q("oop-poly-2", "oop", "polymorphism", "easy", "Function overloading is resolved mainly by:", ["The return type only in C++", "The parameter list (and context) at compile time", "The destructor", "The file name"], 1, "Overload sets are distinguished by signatures."),
  q("oop-poly-3", "oop", "polymorphism", "easy", "A Dog and Cat both implement speak() differently. This is:", ["Encapsulation only", "Ad-hoc file I/O", "Subtype polymorphism / overriding", "A memory leak"], 2, "Same message, different types."),
  q("oop-poly-4", "oop", "polymorphism", "medium", "Calling a virtual method through a base pointer uses:", ["Always the base version", "Dynamic dispatch to the actual object's override", "The preprocessor", "A global function only"], 1, "The vtable (or equivalent) selects the override."),
  q("oop-poly-5", "oop", "polymorphism", "medium", "Without virtual in C++, `Base* p = new Derived; p->foo();` if foo is non-virtual:", ["Calls Derived::foo", "Calls Base::foo", "Fails to compile always", "Calls both"], 1, "Static type of p is Base, so Base::foo is used."),
  q("oop-poly-6", "oop", "polymorphism", "hard", "A virtual destructor on a base class is important when:", ["You never allocate", "You delete derived objects through Base*", "You only use stack objects of the exact type", "You avoid inheritance"], 1, "Otherwise derived cleanup may not run."),

  q("oop-abs-1", "oop", "abstraction", "easy", "Abstraction focuses on:", ["Every private bit of representation", "Essential behavior, hiding unnecessary detail", "Faster CPUs", "Global variables"], 1, "Users see what, not necessarily how."),
  q("oop-abs-2", "oop", "abstraction", "easy", "An abstract class in C++ typically has:", ["No name", "At least one pure virtual function", "Only static ints", "A required main()"], 1, "Pure virtual (`= 0`) makes the class abstract."),
  q("oop-abs-3", "oop", "abstraction", "easy", "You cannot directly construct:", ["A concrete derived class", "An abstract class", "An int", "A string"], 1, "Abstract types must be subclassed."),
  q("oop-abs-4", "oop", "abstraction", "medium", "A pure virtual function:", ["Has a required inline body in the base and cannot be overridden", "Must be implemented by concrete derived classes", "Is the destructor always", "Disables encapsulation"], 1, "Children provide the missing implementation."),
  q("oop-abs-5", "oop", "abstraction", "medium", "An \"interface\" in C++ is often modeled as:", ["A class with only public data", "An abstract class with only pure virtual methods", "A namespace alias", "A preprocessor include guard"], 1, "It specifies a contract without implementation."),
  q("oop-abs-6", "oop", "abstraction", "hard", "Composition (\"has-a\") is often preferred over inheritance when:", ["You need every class to share an is-a hierarchy for one extra field", "You want to reuse behavior without claiming an is-a relationship", "You cannot write methods", "Templates are banned"], 1, "Favor composition for reuse; reserve inheritance for true subtype relationships."),
];

module.exports = { oopQuestions };
