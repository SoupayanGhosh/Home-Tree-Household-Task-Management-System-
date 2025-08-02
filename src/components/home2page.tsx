"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  LogIn,
  LogOut,
  Shield,
  Zap,
  Users,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                HT
              </span>
            </div>
            <span className="font-semibold text-lg">Home-Tree.</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/sign-in">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="sm"
                className="bg-slate-800 text-white hover:bg-slate-900"
              >
                <Users className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero/Landing Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                Welcome to the Future of Family and Home-management
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Home-Tree.
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Reimagining home and family management with an integrated,
                secure, and intuitive solution—no more pens, papers, or diaries.
                Just seamless automation of essential tasks through
                cutting-edge, next-gen digital technology. Designed for the
                modern family, built for the future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Try Now
                  </Button>
                </Link>
                <Link href="/info">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-slate-800 text-slate-800"
                >
                  About Us
                </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-video bg-slate-100 rounded-md mb-4 flex items-center justify-center">
                  <img
                    src="/dashboard.png"
                    alt="Family Dashboard Preview"
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Family-Oriented Style
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Create or join a family, connect with your family members, assign
              tasks, send messages, and keep an eye on everything from bills to
              medicines. HomeTree has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Enhanced Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Email authentication, to family invite code verification,
                  whatever happens in your family, remains within your family.
                  Safety and security is our commitment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Live Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Ever imagined in the middle of the road, "Wish I had a live
                  digital grocery list"? Don't imagine, though; it's already
                  here. Your family members can share a list on Home-tree, which
                  is updated on both ends—whether items are added or removed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Bills, Updates and More</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Never lose track of your bills, with our advanced bill management tools,
                  live notifications, with calendar highlight. Losing Track of your medicine stock,
                  Home-Tree is there to help u keep track of everything! Even documents, add a folder
                  and you never lose track of important things again.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-slate-900 font-bold text-sm">HT</span>
                </div>
                <span className="font-semibold text-xl text-slate-100">
                  Home-Tree Inc.
                </span>
              </div>
              <p className="text-slate-400">
                Building the future of digital experiences with innovative
                technology solutions.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-100 p-2"
                >
                  <Github className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-100 p-2"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-100 p-2"
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-100">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/info"
                    className="hover:text-slate-100 transition-colors"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-100">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-100 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            {/* Help Desk */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-100">Help Desk</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">support@hometree.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">+XXXXX-XXXXX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">Kolkata, India</span>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2025 Home-Tree. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-slate-400 hover:text-slate-100 text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-slate-100 text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-slate-100 text-sm transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
