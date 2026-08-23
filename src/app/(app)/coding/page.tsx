import { BookOpen, Boxes, Network } from "lucide-react";
import { CodingBreadcrumbs } from "@/components/coding/CodingBreadcrumbs";
import { CodingCategoryCard } from "@/components/coding/CodingCategoryCard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CodingPage() {
  return (
    <div>
      <CodingBreadcrumbs items={[{ label: "Coding" }]} />
      <PageHeader
        title="Learn. Practice. Master."
        description="Build your programming skills step by step with guided practice."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <CodingCategoryCard
          href="/coding/pf"
          shortName="PF"
          title="Programming Fundamentals"
          description="Build a strong foundation in programming and problem solving."
          icon={BookOpen}
          tone="blue"
        />
        <CodingCategoryCard
          href="/coding/oop"
          shortName="OOP"
          title="Object-Oriented Programming"
          description="Master classes, objects, inheritance, polymorphism and more."
          icon={Boxes}
          tone="purple"
        />
        <CodingCategoryCard
          href="/coding/dsa"
          shortName="DSA"
          title="Data Structures & Algorithms"
          description="Learn algorithms and data structures through practical problems."
          icon={Network}
          tone="teal"
        />
      </div>
    </div>
  );
}
