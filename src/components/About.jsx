import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function About() {
  const sections = ['status', 'capabilities', 'strengths', 'ambitions', 'creator'];
  const [visibleSections, setVisibleSections] = useState([]);
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setVisibleSections(prev => [...prev, sections[index]]);
      index++;
      if (index === sections.length) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // check scroll boundaries + active card
  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);

    const cardWidth = 350 + 24; // card width + spacing (adjust if spacing changes)
    setActiveIndex(Math.round(scrollLeft / cardWidth));
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 350 + 24;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
      <h2 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        About B2.0
      </h2>

      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-100 dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition hidden md:block"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition hidden md:block"
        >
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
      )}

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
      >
        <AnimatePresence>
          {visibleSections.includes('status') && (
            <Section key="status" title="Current Status">
              B2.0 is an autonomous AI-powered development platform with advanced frontend interface.
              Currently operational with modular agents, multi-provider AI integration, and industry best practices.
            </Section>
          )}

          {visibleSections.includes('capabilities') && (
            <Section key="capabilities" title="Capabilities" list={[
              "Autonomous task planning and execution",
              "Multi-provider AI integration (Mistral, DeepSeek, OpenRouter, NVIDIA NIM)",
              "Code generation, debugging, and refactoring",
              "Automated testing and deployment",
              "Security scanning and vulnerability assessment",
              "Performance profiling and optimization",
              "Containerization and infrastructure management"
            ]} />
          )}

          {visibleSections.includes('strengths') && (
            <Section key="strengths" title="Strengths" list={[
              "Modular microservices architecture",
              "Zero-trust security model",
              "Scalable API-first design",
              "Comprehensive observability and monitoring",
              "Provider adapters for normalized AI responses",
              "Sandboxed execution for safe code testing"
            ]} />
          )}

          {visibleSections.includes('ambitions') && (
            <Section key="ambitions" title="Future Ambitions" list={[
              "Enhanced self-improvement through feedback loops",
              "Expanded multi-framework support",
              "Advanced RAG and retrieval systems",
              "Full GitOps integration",
              "AI-driven infrastructure optimization",
              "Global deployment with edge computing"
            ]} />
          )}

          {visibleSections.includes('creator') && (
            <Section key="creator" title="Creator Information">
              Developed by the B R$D AI team, B2.0 represents a cutting-edge approach
              to autonomous software development. The system integrates multiple AI providers
              and follows industry best practices for secure, scalable, and maintainable code.
            </Section>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {sections.map((_, idx) => (
          <motion.div
            key={idx}
            className={`w-3 h-3 rounded-full ${activeIndex === idx ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`}
            animate={{ scale: activeIndex === idx ? 1.3 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        ))}
      </div>
    </div>
  );
}

function Section({ title, children, list }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-shrink-0 snap-center min-w-[300px] max-w-[350px] bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">{title}</h3>
      <div className="text-sm text-gray-600 dark:text-gray-400 max-h-48 overflow-y-auto pr-2 space-y-2">
        {list ? (
          <ul className="space-y-1">
            {list.map((item, idx) => <li key={idx}>• {item}</li>)}
          </ul>
        ) : (
          <p>{children}</p>
        )}
      </div>
    </motion.div>
  );
}
