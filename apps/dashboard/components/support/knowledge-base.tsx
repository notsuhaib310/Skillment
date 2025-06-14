"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Book, ChevronRight, Clock, User } from "lucide-react"

const categories = [
  { name: "All", count: 24 },
  { name: "Getting Started", count: 8 },
  { name: "Assessments", count: 6 },
  { name: "Participants", count: 4 },
  { name: "Email & Invites", count: 3 },
  { name: "AI Tools", count: 3 },
]

const articles = [
  {
    id: 1,
    title: "Getting Started with Skillment",
    description: "Learn the basics of setting up your first assessment",
    category: "Getting Started",
    readTime: "5 min",
    author: "Support Team",
    popular: true,
  },
  {
    id: 2,
    title: "Creating Your First Assessment",
    description: "Step-by-step guide to create and configure assessments",
    category: "Assessments",
    readTime: "8 min",
    author: "Support Team",
    popular: true,
  },
  {
    id: 3,
    title: "Managing Participants and Invitations",
    description: "How to add participants and send assessment invitations",
    category: "Participants",
    readTime: "6 min",
    author: "Support Team",
    popular: false,
  },
  {
    id: 4,
    title: "Setting Up Email Templates",
    description: "Customize your email templates for better engagement",
    category: "Email & Invites",
    readTime: "4 min",
    author: "Support Team",
    popular: true,
  },
  {
    id: 5,
    title: "Using AI Tools for Question Generation",
    description: "Leverage AI to create better assessment questions",
    category: "AI Tools",
    readTime: "7 min",
    author: "Support Team",
    popular: false,
  },
  {
    id: 6,
    title: "Proctoring Configuration Guide",
    description: "Set up advanced proctoring for secure assessments",
    category: "Assessments",
    readTime: "10 min",
    author: "Support Team",
    popular: false,
  },
]

export function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "ghost"}
                className="w-full justify-between rounded-2xl"
                onClick={() => setSelectedCategory(category.name)}
              >
                <span>{category.name}</span>
                <Badge variant="secondary" className="rounded-full">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Articles List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl hover:bg-card/70 transition-colors cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="rounded-full text-xs">
                        {article.category}
                      </Badge>
                      {article.popular && (
                        <Badge className="rounded-full text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">{article.title}</h3>
                    <p className="text-muted-foreground mb-3">{article.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredArticles.length === 0 && (
            <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms or browse different categories.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
