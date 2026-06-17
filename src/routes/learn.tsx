import { createFileRoute } from "@tanstack/react-router";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { BookOpen, Play, FileText, Award, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/learn")({
  component: Learn,
});

const featured = {
  title: "Getting Started with Unit Trusts",
  description: "Learn the fundamentals of unit trust investing and how to build your first portfolio.",
  duration: "5 min read",
  tag: "Beginner",
};

const categories = [
  { icon: BookOpen, label: "Articles", count: 24 },
  { icon: Play, label: "Videos", count: 12 },
  { icon: FileText, label: "Guides", count: 8 },
  { icon: Award, label: "Courses", count: 5 },
];

const articles = [
  { title: "Understanding NAV", desc: "What Net Asset Value means for your investments", time: "3 min", tag: "Basics" },
  { title: "Risk vs Return", desc: "Finding the right balance for your portfolio", time: "4 min", tag: "Strategy" },
  { title: "Tax Benefits of Unit Trusts", desc: "How to maximize your tax advantages", time: "6 min", tag: "Tax" },
  { title: "Diversification 101", desc: "Why and how to spread your investments", time: "5 min", tag: "Strategy" },
  { title: "Reading Market Indicators", desc: "Key signals every investor should know", time: "7 min", tag: "Advanced" },
];

function Learn() {
  return (
    <MobileLayout>
      <PageHeader title="Learn" showBack />

      {/* Featured */}
      <div className="mx-4 mt-2 gradient-primary rounded-2xl p-5">
        <span className="text-[12px] bg-white/20 text-primary-foreground px-2 py-0.5 rounded-full">{featured.tag}</span>
        <h3 className="text-base font-bold text-primary-foreground mt-2">{featured.title}</h3>
        <p className="text-[12px] text-primary-foreground/80 mt-1">{featured.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[12px] text-primary-foreground/60">{featured.duration}</span>
          <button className="text-[12px] bg-white/20 text-primary-foreground px-3 py-1 rounded-lg font-medium">Read Now</button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto">
        {categories.map(({ icon: Icon, label, count }) => (
          <div key={label} className="glass-card p-3 flex flex-col items-center min-w-[72px]">
            <Icon className="w-5 h-5 text-primary mb-1" />
            <span className="text-[12px] font-medium text-foreground">{label}</span>
            <span className="text-[12px] text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>

      {/* Articles */}
      <div className="mx-4 mt-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Popular Articles</h3>
        <div className="space-y-2">
          {articles.map((article) => (
            <div key={article.title} className="glass-card p-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{article.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{article.desc}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[12px] text-muted-foreground">{article.time}</span>
                  <span className="text-[12px] text-primary">{article.tag}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
