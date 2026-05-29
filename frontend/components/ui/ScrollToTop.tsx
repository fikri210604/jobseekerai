"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Jika scroll lebih dari 300px, tampilkan tombol
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    
    // Check posisi awal saat load
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      size="icon-lg"
      className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg transition-all duration-300 ease-in-out"
      style={{ background: "var(--sb-indigo)", color: "#fff" }}
      aria-label="Scroll to top"
      asChild
    >
      <a href="#">
        <ArrowUp size={20} />
      </a>
    </Button>
  );
}
