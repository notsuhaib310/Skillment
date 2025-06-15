"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiPython,
  SiNodedotjs,
  SiMongodb,
  SiPostgresql,
  SiDocker,
  SiAmazonaws,
  SiTensorflow,
  SiPytorch,
  SiKubernetes,
  SiPrisma,
  SiRedis,
  SiJest,
  SiCypress,
  SiVercel,
  SiGraphql,
  SiSocketdotio,
  SiElasticsearch,
} from "react-icons/si"
import { Code2, Database, Cloud, TestTube, Cpu, Zap } from "lucide-react"

const techStack = [
  {
    name: "React",
    icon: SiReact,
    color: "text-[#61DAFB]",
    category: "frontend",
    description: "UI Library",
  },
  {
    name: "Next.js",
    icon: SiNextdotjs,
    color: "text-foreground",
    category: "frontend",
    description: "React Framework",
  },
  {
    name: "TypeScript",
    icon: SiTypescript,
    color: "text-[#3178C6]",
    category: "language",
    description: "Type Safety",
  },
  {
    name: "Python",
    icon: SiPython,
    color: "text-[#3776AB]",
    category: "language",
    description: "Backend Logic",
  },
  {
    name: "Node.js",
    icon: SiNodedotjs,
    color: "text-[#339933]",
    category: "backend",
    description: "Runtime Environment",
  },
  {
    name: "GraphQL",
    icon: SiGraphql,
    color: "text-[#E10098]",
    category: "backend",
    description: "API Query Language",
  },
  {
    name: "Socket.io",
    icon: SiSocketdotio,
    color: "text-foreground",
    category: "backend",
    description: "Real-time Communication",
  },
  {
    name: "PostgreSQL",
    icon: SiPostgresql,
    color: "text-[#336791]",
    category: "database",
    description: "Primary Database",
  },
  {
    name: "MongoDB",
    icon: SiMongodb,
    color: "text-[#47A248]",
    category: "database",
    description: "Document Database",
  },
  {
    name: "Redis",
    icon: SiRedis,
    color: "text-[#DC382D]",
    category: "database",
    description: "Caching & Sessions",
  },
  {
    name: "Prisma",
    icon: SiPrisma,
    color: "text-foreground",
    category: "database",
    description: "Database ORM",
  },
  {
    name: "Elasticsearch",
    icon: SiElasticsearch,
    color: "text-[#005571]",
    category: "database",
    description: "Search Engine",
  },
  {
    name: "AWS",
    icon: SiAmazonaws,
    color: "text-[#FF9900]",
    category: "cloud",
    description: "Cloud Infrastructure",
  },
  {
    name: "Vercel",
    icon: SiVercel,
    color: "text-foreground",
    category: "cloud",
    description: "Deployment Platform",
  },
  {
    name: "Docker",
    icon: SiDocker,
    color: "text-[#2496ED]",
    category: "devops",
    description: "Containerization",
  },
  {
    name: "Kubernetes",
    icon: SiKubernetes,
    color: "text-[#326CE5]",
    category: "devops",
    description: "Container Orchestration",
  },
  {
    name: "TensorFlow",
    icon: SiTensorflow,
    color: "text-[#FF6F00]",
    category: "ai",
    description: "Machine Learning",
  },
  {
    name: "PyTorch",
    icon: SiPytorch,
    color: "text-[#EE4C2C]",
    category: "ai",
    description: "Deep Learning",
  },
  {
    name: "Jest",
    icon: SiJest,
    color: "text-[#C21325]",
    category: "testing",
    description: "Unit Testing",
  },
  {
    name: "Cypress",
    icon: SiCypress,
    color: "text-foreground",
    category: "testing",
    description: "E2E Testing",
  },
]

const categories = [
  { id: null, name: "All Technologies", icon: Code2, count: techStack.length },
  { id: "frontend", name: "Frontend", icon: Code2, count: techStack.filter((t) => t.category === "frontend").length },
  { id: "backend", name: "Backend", icon: Cpu, count: techStack.filter((t) => t.category === "backend").length },
  {
    id: "database",
    name: "Database",
    icon: Database,
    count: techStack.filter((t) => t.category === "database").length,
  },
  {
    id: "cloud",
    name: "Cloud & DevOps",
    icon: Cloud,
    count: techStack.filter((t) => t.category === "cloud" || t.category === "devops").length,
  },
  { id: "ai", name: "AI & ML", icon: Zap, count: techStack.filter((t) => t.category === "ai").length },
  { id: "testing", name: "Testing", icon: TestTube, count: techStack.filter((t) => t.category === "testing").length },
]

export const TechStack = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredTechStack = activeCategory
    ? techStack.filter((tech) =>
        activeCategory === "cloud"
          ? tech.category === "cloud" || tech.category === "devops"
          : tech.category === activeCategory,
      )
    : techStack

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4 mr-2" />
            Enterprise-Grade Technology
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Built with Modern Tech Stack
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Powered by cutting-edge technologies to ensure scalability, security, and performance for your hiring needs
            at any scale.
          </motion.p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id || "all"}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg"
                  : "bg-card hover:bg-muted border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.name}
              <span className="ml-2 px-2 py-0.5 bg-muted rounded-full text-xs">{category.count}</span>
            </button>
          ))}
        </div>

        {/* Tech Stack Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {filteredTechStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-muted/50 rounded-lg mb-4 group-hover:bg-primary/10 transition-colors">
                  <tech.icon className={cn("h-8 w-8 transition-all duration-300", tech.color)} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{tech.name}</h3>
                <p className="text-xs text-muted-foreground">{tech.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">{"<"}100ms</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">SOC 2</div>
            <div className="text-sm text-muted-foreground">Compliant</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Monitoring</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
