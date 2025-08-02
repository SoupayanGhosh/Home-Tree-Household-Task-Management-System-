"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Shield,
  Lightbulb,
  Heart,
  Github,
  Linkedin,
  ExternalLink,
} from "lucide-react";

export default function ForgotPass() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">HT</span>
              </div>
              <span className="text-xl font-semibold text-slate-900">
                Home-Tree.
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="text-slate-700 border-slate-300 bg-transparent"
                >
                  Home
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              About Home-Tree.
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We believe that managing a home and family should be simple,
              intuitive, and stress-free. Our mission is to empower modern
              families with the tools they need to stay organized, connected,
              and focused on what matters most.
            </p>
          </div>
        </div>
      </section>
      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Team of 3 aspiring students from Nit CSE, working together to
              create a better future for families. We are passionate about
              building a product that makes a real difference in people's lives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <Image
                src="/pic1.jpg?height=200&width=200"
                alt="Sarthak, Teamlead"
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                Sarthak Dutta
              </h3>
              <p className="text-slate-600 mb-2">Team lead</p>
              <p className="text-sm text-slate-500 mb-4">
                Backend Api Designing, Frontend Designing with shadcn, Schema Designing. Fullstack Management. 
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://github.com/JoySarthak"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/sarthak-dutta-0b8133303/"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://portfolio-joysarthaks-projects.vercel.app/"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="text-center">
              <Image
                src="/pic2.jpg?height=200&width=200"
                alt="Marcus Rodriguez, CTO"
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                Soupayan Ghosh
              </h3>
              <p className="text-slate-600 mb-2">Team Member</p>
              <p className="text-sm text-slate-500 mb-4">
                UI/UX advisor, Frontend designing with shadcn/tailwind and
                testing.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="text-center">
              <Image
                src="/pic3.jpg?height=200&width=200"
                alt="Soham, Member"
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                Soham Hait
              </h3>
              <p className="text-slate-600 mb-2">Team member</p>
              <p className="text-sm text-slate-500 mb-4">
                UI/UX advisor, Frontend designing with shadcn/tailwind and
                testing.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything we do is guided by these core principles that shape our
              product and culture.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Family First
                </h3>
                <p className="text-slate-600">
                  Every feature we build is designed to strengthen family bonds
                  and improve communication.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Privacy & Security
                </h3>
                <p className="text-slate-600">
                  Your family's data is sacred. We use industry-leading security
                  to keep it safe.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Innovation
                </h3>
                <p className="text-slate-600">
                  We continuously evolve our platform with cutting-edge
                  technology and user feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Simplicity
                </h3>
                <p className="text-slate-600">
                  Complex problems deserve simple solutions. We make the
                  complicated feel effortless.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Family Life?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of families who have already discovered the joy of
            seamless home management with Home-Tree.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-slate-900 hover:bg-slate-800 text-white px-8"
              >
                Sign up & Try now
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="lg"
                variant="outline"
                className="text-slate-700 border-slate-300 px-8 bg-transparent"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">HT</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">
                Home-Tree. __Made with Nextjs & Typescript__
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 Home-Tree. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
