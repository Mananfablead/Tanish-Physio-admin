import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Calendar, CheckCircle, ArrowRight, Heart } from "lucide-react";
import logo from "../assets/logo.webp";

let confetti: any;

// Dynamic import for confetti to avoid Vite optimization issues
const loadConfetti = async () => {
  try {
    const module = await import("canvas-confetti");
    confetti = module.default || module;
  } catch (error) {
    console.warn("Confetti failed to load:", error);
    confetti = null;
  }
};

const ComingSoonPage = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confettiLoaded, setConfettiLoaded] = useState(false);

  useEffect(() => {
    loadConfetti().then(() => setConfettiLoaded(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubscribed(true);
    setIsLoading(false);

    // Trigger confetti if loaded
    if (confetti && confettiLoaded) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full opacity-20"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <img
            src={logo}
            alt="Tanish Physio Logo"
            className="mx-auto h-20 w-auto"
          />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
        >
          Coming <span className="text-blue-600">Soon</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Revolutionizing physiotherapy with cutting-edge video consultation
          technology. Your health journey is about to get smarter.
        </motion.p>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: <Heart className="w-8 h-8 text-red-500" />,
              title: "Expert Care",
              desc: "Certified physiotherapists at your fingertips",
            },
            {
              icon: <Calendar className="w-8 h-8 text-blue-500" />,
              title: "Flexible Scheduling",
              desc: "Book sessions anytime, anywhere",
            },
            {
              icon: <ArrowRight className="w-8 h-8 text-purple-500" />,
              title: "Personalized Plans",
              desc: "Tailored treatment programs for you",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="font-semibold text-gray-900 mt-4 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
