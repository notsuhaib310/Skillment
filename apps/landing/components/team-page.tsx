"use client"
import { motion } from "framer-motion"
import { Linkedin, Twitter, Github, Mail, MapPin, Calendar, Users, Award, Code, Briefcase } from "lucide-react"
import { ModernNavbar } from "@/components/ui/aceternity/modern-navbar"
import { MinimalistFooter } from "@/components/ui/aceternity/minimalist-footer"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"
import { CardHover } from "@/components/ui/aceternity/card-hover"

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Suhaib SZ",
      role: "Founder & CEO",
      bio: "Visionary leader with 8+ years in EdTech and AI. Former software engineer at Google, passionate about revolutionizing coding education through innovative assessment technologies.",
      image: "/placeholder.svg?height=300&width=300",
      location: "San Francisco, CA",
      joinDate: "2022",
      social: {
        linkedin: "https://linkedin.com/in/suhaibsz",
        twitter: "https://twitter.com/suhaibsz",
        github: "https://github.com/suhaibsz",
        email: "suhaib@skillment.com",
      },
      skills: ["AI/ML", "Product Strategy", "EdTech", "Leadership"],
      achievements: [
        "Founded 2 successful EdTech startups",
        "Published 15+ research papers on AI in Education",
        "TEDx speaker on Future of Learning",
        "Forbes 30 Under 30 in Education",
      ],
      gradient: "from-orange-500 to-red-500",
    },
    {
      name: "Sarah Chen",
      role: "CTO & Co-founder",
      bio: "Technical architect with expertise in distributed systems and AI. Previously led engineering teams at Microsoft and Amazon, specializing in scalable assessment platforms.",
      image: "/placeholder.svg?height=300&width=300",
      location: "Seattle, WA",
      joinDate: "2022",
      social: {
        linkedin: "https://linkedin.com/in/sarahchen",
        twitter: "https://twitter.com/sarahchen",
        github: "https://github.com/sarahchen",
        email: "sarah@skillment.com",
      },
      skills: ["System Architecture", "AI/ML", "Cloud Computing", "Team Leadership"],
      achievements: [
        "Led engineering teams of 50+ developers",
        "Architected systems serving 100M+ users",
        "Patent holder in AI-powered assessment",
        "Women in Tech Leadership Award",
      ],
      gradient: "from-blue-500 to-purple-500",
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Product",
      bio: "Product strategist with deep understanding of educational technology. Former product manager at Khan Academy, focused on creating intuitive and impactful learning experiences.",
      image: "/placeholder.svg?height=300&width=300",
      location: "Austin, TX",
      joinDate: "2023",
      social: {
        linkedin: "https://linkedin.com/in/marcusrodriguez",
        twitter: "https://twitter.com/marcusrodriguez",
        github: "https://github.com/marcusrodriguez",
        email: "marcus@skillment.com",
      },
      skills: ["Product Management", "UX Design", "Data Analytics", "EdTech"],
      achievements: [
        "Launched products used by 10M+ students",
        "Increased user engagement by 300%",
        "Product Manager of the Year 2023",
        "Expert in educational psychology",
      ],
      gradient: "from-green-500 to-teal-500",
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of AI Research",
      bio: "AI researcher with PhD in Machine Learning from Stanford. Specializes in natural language processing and automated assessment systems. Published extensively in top-tier conferences.",
      image: "/placeholder.svg?height=300&width=300",
      location: "Palo Alto, CA",
      joinDate: "2023",
      social: {
        linkedin: "https://linkedin.com/in/emilywatson",
        twitter: "https://twitter.com/emilywatson",
        github: "https://github.com/emilywatson",
        email: "emily@skillment.com",
      },
      skills: ["Machine Learning", "NLP", "Research", "Academic Partnerships"],
      achievements: [
        "PhD in ML from Stanford University",
        "50+ publications in AI conferences",
        "Google Research Scientist Award",
        "AI Ethics Committee member",
      ],
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "James Kim",
      role: "Head of Security",
      bio: "Cybersecurity expert with 10+ years protecting educational platforms. Former security architect at Coursera, ensuring the highest standards of exam integrity and data protection.",
      image: "/placeholder.svg?height=300&width=300",
      location: "New York, NY",
      joinDate: "2023",
      social: {
        linkedin: "https://linkedin.com/in/jameskim",
        twitter: "https://twitter.com/jameskim",
        github: "https://github.com/jameskim",
        email: "james@skillment.com",
      },
      skills: ["Cybersecurity", "Compliance", "Risk Management", "Privacy"],
      achievements: [
        "CISSP and CISM certified",
        "Led security for 50M+ user platform",
        "Zero security breaches in 5 years",
        "Cybersecurity Excellence Award",
      ],
      gradient: "from-red-500 to-orange-500",
    },
    {
      name: "Lisa Thompson",
      role: "Head of Customer Success",
      bio: "Customer experience leader passionate about education. Previously at Zoom and Slack, helping organizations transform their learning and assessment processes.",
      image: "/placeholder.svg?height=300&width=300",
      location: "Denver, CO",
      joinDate: "2023",
      social: {
        linkedin: "https://linkedin.com/in/lisathompson",
        twitter: "https://twitter.com/lisathompson",
        github: "https://github.com/lisathompson",
        email: "lisa@skillment.com",
      },
      skills: ["Customer Success", "Training", "Support", "Relationship Management"],
      achievements: [
        "98% customer satisfaction rate",
        "Reduced churn by 60%",
        "Customer Success Leader of the Year",
        "Expert in educational consulting",
      ],
      gradient: "from-teal-500 to-blue-500",
    },
  ]

  const companyStats = [
    { label: "Team Members", value: "25+", icon: Users },
    { label: "Years Experience", value: "50+", icon: Calendar },
    { label: "Countries", value: "8", icon: MapPin },
    { label: "Patents Filed", value: "12", icon: Award },
  ]

  const values = [
    {
      icon: Code,
      title: "Innovation First",
      description: "We push the boundaries of what's possible in educational technology.",
    },
    {
      icon: Users,
      title: "Student-Centric",
      description: "Every decision we make is focused on improving learning outcomes.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards in everything we build.",
    },
    {
      icon: Briefcase,
      title: "Integrity",
      description: "We believe in fair, secure, and transparent assessment practices.",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <ModernNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full text-orange-400 text-sm font-medium border border-orange-500/30 mb-6"
          >
            <Users className="w-4 h-4 mr-2" />
            Meet Our Team
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
              The Minds Behind
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Skillment</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            We're a diverse team of educators, engineers, and innovators united by our mission to revolutionize coding
            education through AI-powered assessment technology.
          </motion.p>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companyStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Leadership Team</h2>
            <p className="text-xl text-gray-300">Experienced leaders driving innovation in educational technology</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardHover>
                  <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full">
                    {/* Profile Header */}
                    <div className="text-center mb-6">
                      <div className="relative mb-4">
                        <img
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          className="w-24 h-24 rounded-full mx-auto border-4 border-white/10"
                        />
                        <div
                          className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center`}
                        >
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                      <p className="text-orange-400 font-medium mb-2">{member.role}</p>
                      <div className="flex items-center justify-center space-x-4 text-gray-400 text-sm">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {member.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Since {member.joinDate}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-300 text-sm mb-6 leading-relaxed">{member.bio}</p>

                    {/* Skills */}
                    <div className="mb-6">
                      <h4 className="text-white font-medium mb-3">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Achievements */}
                    <div className="mb-6">
                      <h4 className="text-white font-medium mb-3">Key Achievements</h4>
                      <div className="space-y-2">
                        {member.achievements.slice(0, 2).map((achievement, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-400 text-xs">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-4">
                      <a
                        href={member.social.linkedin}
                        className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-gray-400" />
                      </a>
                      <a
                        href={member.social.twitter}
                        className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Twitter className="w-4 h-4 text-gray-400" />
                      </a>
                      <a
                        href={member.social.github}
                        className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Github className="w-4 h-4 text-gray-400" />
                      </a>
                      <a
                        href={`mailto:${member.social.email}`}
                        className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Mail className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                </CardHover>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-300">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8"
          >
            <Users className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Mission</h2>
            <p className="text-gray-300 mb-8">
              We're always looking for talented individuals who share our passion for transforming education through
              technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedButton colors={["#ea580c", "#dc2626", "#be185d"]} className="px-8 py-3 group">
                View Open Positions
                <Users className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              </AnimatedButton>
              <button className="px-8 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors">
                Learn About Our Culture
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <MinimalistFooter />
    </div>
  )
}
