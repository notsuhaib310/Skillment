"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, Clock, Users, MessageSquare, ArrowRight } from "lucide-react"
import { ModernNavbar } from "@/components/ui/aceternity/modern-navbar"
import { MinimalistFooter } from "@/components/ui/aceternity/minimalist-footer"
import { AnimatedButton } from "@/components/ui/aceternity/animated-button"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    subject: "general",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch via email",
      value: "hello@codeproctor.com",
      action: "mailto:hello@codeproctor.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team",
      value: "+1 (555) 123-4567",
      action: "tel:+15551234567",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our headquarters",
      value: "San Francisco, CA",
      action: "#",
    },
    {
      icon: Clock,
      title: "Business Hours",
      description: "Monday - Friday",
      value: "9:00 AM - 6:00 PM PST",
      action: "#",
    },
  ]

  const faqs = [
    {
      question: "How quickly can we get started?",
      answer:
        "You can start using CodeProctor within 24 hours of signing up. Our team will help you set up your first exam.",
    },
    {
      question: "Do you offer custom integrations?",
      answer:
        "Yes, we provide custom integrations with your existing LMS and assessment tools. Contact our enterprise team for details.",
    },
    {
      question: "What support do you provide?",
      answer: "We offer 24/7 support for enterprise customers and business hours support for all other plans.",
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
            <MessageSquare className="w-4 h-4 mr-2" />
            Get in Touch
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
              Let's Build the Future
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              of Coding Assessments
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Ready to transform your coding assessments? Our team is here to help you get started with CodeProctor and
            answer any questions you might have.
          </motion.p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="demo">Request Demo</option>
                    <option value="enterprise">Enterprise Sales</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                    placeholder="Tell us about your needs..."
                    required
                  />
                </div>

                <AnimatedButton
                  type="submit"
                  colors={["#ea580c", "#dc2626", "#be185d"]}
                  className="w-full py-4 text-lg group"
                >
                  Send Message
                  <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Get in touch</h2>
                <p className="text-gray-300 mb-8">
                  We're here to help you transform your coding assessments. Reach out to us through any of the channels
                  below.
                </p>
              </div>

              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={info.title}
                    href={info.action}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <info.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{info.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{info.description}</p>
                        <p className="text-orange-400 font-medium">{info.value}</p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* FAQ Section */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-lg p-6"
                    >
                      <h4 className="font-semibold text-white mb-2">{faq.question}</h4>
                      <p className="text-gray-300 text-sm">{faq.answer}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8"
          >
            <Users className="w-16 h-16 text-orange-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-gray-300 mb-8">
              Join thousands of educators and recruiters who trust CodeProctor for secure coding assessments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedButton colors={["#ea580c", "#dc2626", "#be185d"]} className="px-8 py-3 group">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
              <button className="px-8 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <MinimalistFooter />
    </div>
  )
}
