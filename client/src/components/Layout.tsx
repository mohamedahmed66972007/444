import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { NavIcons } from "./SubjectIcons";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import AdminLogin from "./AdminLogin";
import Footer from "./Footer";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, User, Menu, Home, X, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, logout } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = location;

  const navItems = [
    { href: "/", icon: <Home className="text-base sm:text-xl" />, label: "الرئيسية" },
    { href: "/files", icon: <NavIcons.files className="text-base sm:text-xl" />, label: "الملفات" },
    { href: "/exams", icon: <NavIcons.exams className="text-base sm:text-xl" />, label: "جدول الاختبارات" },
    { href: "/quizzes", icon: <NavIcons.quizzes className="text-base sm:text-xl" />, label: "اختبارات الكترونية" },
  ];

  if (isAdmin) {
    navItems.push({ 
      href: "/analytics", 
      icon: <BarChart className="text-base sm:text-xl" />, 
      label: "التحليلات" 
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-foreground">
              دفعة 2026
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {!isAdmin ? (
              <Button onClick={() => setShowAdminLogin(true)} className="flex items-center space-x-1 space-x-reverse">
                <User className="h-4 w-4 ml-2" />
                <span className="hidden sm:inline">تسجيل دخول المشرف</span>
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                onClick={logout} 
                className="flex items-center space-x-1 space-x-reverse"
              >
                <LogOut className="h-4 w-4 ml-2" />
                <span className="hidden sm:inline">تسجيل خروج</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
        <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform translate-x-0">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-md transition-colors",
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {item.icon}
                <span className="mr-2">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block bg-white dark:bg-gray-800 shadow-sm mb-6">
        <div className="container mx-auto">
          <nav className="flex overflow-x-auto whitespace-nowrap py-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 font-medium whitespace-nowrap transition-colors duration-200 focus:outline-none flex items-center",
                  pathname === item.href 
                    ? "border-b-2 border-primary text-primary" 
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {item.icon}
                <span className="mr-2">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 pb-12">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Admin Login Modal */}
      <AdminLogin isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} />
    </div>
  );
};

export default Layout;