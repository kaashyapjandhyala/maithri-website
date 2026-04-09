import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// HOOK: responsive breakpoint
// ─────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

// ─────────────────────────────────────────────
// 3D SCENE — Hero
// ─────────────────────────────────────────────
function TorusKnotMesh({ scale = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.x = Math.sin(t / 2.5) * 0.6;
    ref.current.rotation.y = t * 0.3;
    ref.current.position.y = Math.sin(t * 0.8) * 0.4;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5}>
      <mesh ref={ref} scale={scale}>
        <torusKnotGeometry args={[1.4, 0.38, 160, 28, 2, 3]} />
        <meshStandardMaterial
          color="#4AFFD4" emissive="#0a3d33" metalness={0.9} roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

function IcosahedronMesh() {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * 0.2;
    ref.current.rotation.z = t * 0.15;
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[-4, 2, -3]}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#F5C842" emissive="#3d2e00" metalness={0.7} roughness={0.2} wireframe
        />
      </mesh>
    </Float>
  );
}

function RingMesh() {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.4) * 0.2;
    ref.current.rotation.z = t * 0.1;
  });
  return (
    <Float speed={1} floatIntensity={1} position={[4.5, -1.5, -2]}>
      <mesh ref={ref}>
        <torusGeometry args={[1.2, 0.08, 16, 80]} />
        <meshStandardMaterial color="#a855f7" emissive="#3b0764" metalness={0.9} roughness={0.1} />
      </mesh>
    </Float>
  );
}

function ParticleField({ count = 1800 }) {
  const ref = useRef();
  const positions = useRef(
    Float32Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 60)
  );
  const colorsArr = useRef((() => {
    const c = new Float32Array(count * 3);
    const palettes = [[0.29,1,0.83],[0.96,0.78,0.26],[0.66,0.33,0.97]];
    for (let i = 0; i < count; i++) {
      const p = palettes[Math.floor(Math.random() * 3)];
      c[i*3]=p[0]; c[i*3+1]=p[1]; c[i*3+2]=p[2];
    }
    return c;
  })());
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
        <bufferAttribute attach="attributes-color" args={[colorsArr.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}

function CameraRig({ enabled = true }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!enabled) return;
    const move = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [enabled]);
  useFrame(() => {
    if (!enabled) return;
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current.y * 1.0 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function HeroScene({ isMobile }) {
  return (
    <Canvas
      camera={{ position: [0, 0, isMobile ? 12 : 10], fov: isMobile ? 65 : 55 }}
      style={{ background: "transparent" }}
      dpr={[1, isMobile ? 1 : 2]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={3} color="#4AFFD4" />
      <pointLight position={[-10, -10, -5]} intensity={1.5} color="#F5C842" />
      <pointLight position={[0, 0, 8]} intensity={1} color="#a855f7" />
      <Stars
        radius={80} depth={60}
        count={isMobile ? 1200 : 4000}
        factor={3} fade speed={0.5}
      />
      {!isMobile && (
        <Sparkles count={80} scale={12} size={1.2} speed={0.4} color="#4AFFD4" />
      )}
      <ParticleField count={isMobile ? 500 : 1800} />
      <TorusKnotMesh scale={isMobile ? 0.65 : 1} />
      {!isMobile && <IcosahedronMesh />}
      {!isMobile && <RingMesh />}
      <CameraRig enabled={!isMobile} />
    </Canvas>
  );
}

// ─────────────────────────────────────────────
// 3D SCENE — Product
// ─────────────────────────────────────────────
function ZenverseMesh() {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.4;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.3;
  });
  return (
    <Float speed={2} floatIntensity={1.5}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.32, 140, 20, 3, 5]} />
        <MeshDistortMaterial
          color="#4AFFD4" emissive="#062b24"
          metalness={0.9} roughness={0.05}
          distort={0.25} speed={2}
        />
      </mesh>
    </Float>
  );
}

function ProductScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={3} color="#4AFFD4" />
      <pointLight position={[-5, -5, 0]} intensity={1.5} color="#F5C842" />
      <Stars radius={50} depth={30} count={800} factor={2} fade />
      <ZenverseMesh />
    </Canvas>
  );
}

// ─────────────────────────────────────────────
// NAVBAR — with mobile hamburger
// ─────────────────────────────────────────────
const NAV_ITEMS = ["home", "about", "products", "services", "contact"];

function Navbar() {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      NAV_ITEMS.forEach((id) => {
        const sec = document.getElementById(id);
        if (sec && window.scrollY >= sec.offsetTop - 200) setActive(id);
      });
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  const navClick = (id) => {
    setMenuOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled || menuOpen
            ? "bg-[#050508]/90 backdrop-blur-2xl border-b border-[#4AFFD4]/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 lg:h-[70px] flex items-center justify-between">
          {/* Logo */}
          <div className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#F5C842] to-[#4AFFD4] bg-clip-text text-transparent shrink-0">
            MAITHRI
          </div>

          {/* Desktop nav */}
          <ul className="hidden md:flex gap-5 lg:gap-8 list-none m-0 p-0">
            {NAV_ITEMS.map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => navClick(tab)}
                  className={`relative font-mono text-[10px] lg:text-[11px] tracking-widest uppercase transition-colors duration-300 bg-transparent border-none cursor-pointer p-0 ${
                    active === tab ? "text-[#4AFFD4]" : "text-[#8b8fa8] hover:text-white"
                  }`}
                >
                  {tab}
                  {active === tab && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 w-full h-px bg-[#4AFFD4]"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden flex flex-col gap-[5px] p-2 z-50 bg-transparent border-none cursor-pointer"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[1.5px] bg-[#FAFAF8] origin-center"
              style={{ transition: "all 0.25s" }}
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              className="block w-5 h-[1.5px] bg-[#FAFAF8]"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[1.5px] bg-[#FAFAF8] origin-center"
              style={{ transition: "all 0.25s" }}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#050508]/97 backdrop-blur-2xl flex flex-col items-center justify-center gap-7"
          >
            {NAV_ITEMS.map((tab, i) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navClick(tab)}
                className={`font-extrabold text-3xl tracking-tight uppercase bg-transparent border-none cursor-pointer transition-colors duration-200 ${
                  active === tab ? "text-[#4AFFD4]" : "text-white/50 hover:text-white"
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function useCounter(target, duration = 1800, trigger = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return val;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

function SectionLabel({ children }) {
  return (
    <div className="font-mono text-[10px] sm:text-[11px] tracking-[.2em] text-[#4AFFD4] uppercase mb-3 sm:mb-4">
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="w-full max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-[#4AFFD4]/20 to-transparent my-0" />
  );
}

// ─────────────────────────────────────────────
// HOME SECTION
// ─────────────────────────────────────────────
function HomeSection() {
  const isMobile = useIsMobile(768);
  const [counted, setCounted] = useState(false);
  const statsRef = useRef();
  const c1 = useCounter(10, 1500, counted);
  const c2 = useCounter(25, 1800, counted);
  const c3 = useCounter(8, 1600, counted);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCounted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="home"
      className="relative w-full min-h-[100svh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* 3D bg */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <HeroScene isMobile={isMobile} />
        </Suspense>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,#050508_85%)]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-8 pt-20 sm:pt-24 pb-20 sm:pb-28 text-center flex flex-col items-center">

        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="inline-block font-mono text-[9px] sm:text-[10px] lg:text-xs tracking-[.2em] text-[#4AFFD4] border border-[#4AFFD4]/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-5 sm:mb-7"
        >
          ⬡ AI-FIRST TECHNOLOGY STUDIO
        </motion.div>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-[2.2rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-7xl font-extrabold leading-[1.06] tracking-[-0.04em]"
        >
          Building{" "}
          <span className="bg-gradient-to-r from-[#4AFFD4] via-[#F5C842] to-[#a855f7] bg-clip-text text-transparent">
            Intelligent
          </span>
          <br />
          Digital Experiences
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-[#8b8fa8] max-w-xs sm:max-w-md lg:max-w-xl mx-auto leading-relaxed"
        >
          Web, Mobile, AI &amp; Data Solutions for the Future
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(74,255,212,.45)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById("services").scrollIntoView({ behavior: "smooth" })}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-[#4AFFD4] to-[#1dd1a1] text-[#050508] font-bold rounded-lg text-sm tracking-wide"
          >
            Explore Services
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, borderColor: "#4AFFD4", color: "#4AFFD4" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById("products").scrollIntoView({ behavior: "smooth" })}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-transparent border border-white/20 text-white font-bold rounded-lg text-sm tracking-wide transition-colors duration-300"
          >
            View Products
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          ref={statsRef}
          variants={fadeUp} initial="hidden" animate="visible" custom={5}
          className="mt-10 sm:mt-14 lg:mt-16 grid grid-cols-3 gap-3 sm:gap-8 lg:gap-12 w-full max-w-[300px] sm:max-w-none sm:w-auto"
        >
          {[
            { val: c1, suffix: "+", label: "Projects This Month" },
            { val: c2, suffix: "+", label: "Systems Delivered" },
            { val: c3, suffix: "+", label: "AI Models" },
          ].map(({ val, suffix, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-[#F5C842] to-[#4AFFD4] bg-clip-text text-transparent leading-none">
                {val}{suffix}
              </div>
              <div className="font-mono text-[8px] sm:text-[9px] lg:text-[10px] text-[#8b8fa8] tracking-widest mt-1 uppercase leading-tight">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 sm:gap-2 opacity-40 z-10"
      >
        <span className="font-mono text-[8px] sm:text-[9px] text-[#8b8fa8] tracking-[.15em]">SCROLL</span>
        <div className="w-px h-7 sm:h-9 bg-gradient-to-b from-[#4AFFD4] to-transparent" />
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────
// ABOUT SECTION
// ─────────────────────────────────────────────
const TIMELINE = [
  { title: "AI-First Architecture", desc: "Every layer is designed around intelligent processing, adaptive systems, and real-time inference." },
  { title: "Infinite Scalability", desc: "Distributed systems that grow with demand — from zero to millions without rearchitecting." },
  { title: "Multilingual by Default", desc: "Products built for regional creators and global reach from day one." },
  { title: "Creator-Centric Design", desc: "Tools and analytics that empower creators to build, grow, and monetize at scale." },
];

function AboutSection() {
  return (
    <section id="about" className="relative w-full py-16 sm:py-24 lg:py-32 px-5 sm:px-8 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-24 items-start lg:items-center">

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SectionLabel>// Who We Are</SectionLabel>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Next-gen platforms<br />
            <span className="text-[#8b8fa8]">for a smarter world</span>
          </h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#8b8fa8] leading-relaxed">
            We build AI-first digital infrastructure — from social platforms to intelligent agents — with a relentless focus on scalability, depth, and human-centered design.
          </p>
          <p className="mt-3 text-sm sm:text-base text-[#8b8fa8] leading-relaxed">
            Every product ships ready for tomorrow's load, today's users, and the intelligence layer that ties it all together.
          </p>
        </motion.div>

        <div className="flex flex-col">
          {TIMELINE.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }} custom={i}
              className="flex gap-4 sm:gap-5 py-4 sm:py-5 border-b border-white/[0.06] last:border-0"
            >
              <div className="mt-1 w-2 h-2 sm:w-2.5 sm:h-2.5 min-w-[8px] rounded-full bg-[#4AFFD4] shadow-[0_0_10px_#4AFFD4] shrink-0" />
              <div>
                <h4 className="font-bold text-sm sm:text-base mb-0.5 sm:mb-1">{item.title}</h4>
                <p className="text-xs sm:text-sm text-[#8b8fa8] leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// PRODUCTS SECTION
// ─────────────────────────────────────────────
const FEATURES = [
  "Mood-based multi-layer content discovery",
  "Secure, encrypted real-time chat",
  "Creator analytics & AI insights",
  "White-label AI infra for regional creators",
];

function ProductsSection() {
  const isMobile = useIsMobile(768);
  return (
    <section id="products" className="relative w-full py-16 sm:py-24 lg:py-32 px-5 sm:px-8 flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(74,255,212,0.04)_0%,transparent_70%)]" />
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SectionLabel>// Flagship Product</SectionLabel>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4 sm:mb-5">
            The future of<br />
            <span className="bg-gradient-to-r from-[#4AFFD4] to-[#F5C842] bg-clip-text text-transparent">
              social intelligence
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#8b8fa8] leading-relaxed">
            Our products redefine how people discover, create, and connect — powered by a proprietary AI stack built for depth and scale.
          </p>
          {/* 3D canvas */}
          <div className="mt-6 sm:mt-7 h-[180px] sm:h-[220px] lg:h-[260px] rounded-2xl overflow-hidden border border-[#4AFFD4]/10">
            <Suspense fallback={<div className="w-full h-full bg-[#050508]" />}>
              <ProductScene />
            </Suspense>
          </div>
        </motion.div>

        {/* Zenverse card */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          whileHover={!isMobile ? { rotateY: 4, rotateX: -2, scale: 1.02 } : {}}
          style={!isMobile ? { transformStyle: "preserve-3d", perspective: 1000 } : {}}
          className="relative bg-white/[0.03] border border-[#4AFFD4]/15 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_30%,rgba(74,255,212,0.07),transparent_60%)]" />
          <div className="inline-block font-mono text-[9px] sm:text-[10px] tracking-[.15em] text-[#4AFFD4] border border-[#4AFFD4]/40 px-2.5 sm:px-3 py-1 rounded-full mb-4 sm:mb-5">
            AI-NATIVE PLATFORM
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-[#4AFFD4] bg-clip-text text-transparent">
            Zenverse
          </h3>
          <p className="mt-3 sm:mt-4 text-[#8b8fa8] leading-relaxed text-xs sm:text-sm">
            An AI-native social platform focused on mood-based content discovery and intelligent user experiences — built for the creator economy of tomorrow.
          </p>
          <div className="mt-4 sm:mt-5 flex flex-col gap-2 sm:gap-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-[#8b8fa8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4AFFD4] shrink-0 shadow-[0_0_6px_#4AFFD4]" />
                {f}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// SERVICES SECTION
// ─────────────────────────────────────────────
const SERVICES = [
  { icon: "◈", title: "Web Application Development", desc: "Scalable, performant web platforms with modern frameworks and AI-powered features baked in." },
  { icon: "◉", title: "Mobile Application Development", desc: "Cross-platform apps with native performance, seamless UX, and deep integrations." },
  { icon: "⬡", title: "AI Agents", desc: "Autonomous intelligent agents that reason, plan, and act across complex workflows at scale." },
  { icon: "◎", title: "AI Bots", desc: "Multilingual voice and chat companions with personality, memory, and creator-grade customization." },
  { icon: "⬢", title: "Analytics Dashboards", desc: "Real-time intelligence layers that surface insights, trends, and decisions from your data." },
];

function ServicesSection() {
  const isMobile = useIsMobile(768);
  return (
    <section id="services" className="relative w-full py-16 sm:py-24 lg:py-32 px-5 sm:px-8 flex flex-col items-center">
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="text-center mb-8 sm:mb-12 lg:mb-14 max-w-2xl"
      >
        <SectionLabel>// What We Build</SectionLabel>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
          End-to-end digital solutions
        </h2>
      </motion.div>

      <div className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
        {SERVICES.map((svc, i) => (
          <motion.div
            key={svc.title}
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true }} custom={i}
            whileHover={!isMobile ? {
              y: -8, rotateX: 4, rotateY: -4,
              borderColor: "rgba(74,255,212,.25)",
              backgroundColor: "rgba(74,255,212,.04)",
            } : { scale: 0.99 }}
            style={!isMobile ? { transformStyle: "preserve-3d", perspective: 800 } : {}}
            className="relative group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 sm:p-6 lg:p-7 transition-all duration-300 overflow-hidden cursor-default"
          >
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-[#4AFFD4] to-[#F5C842] origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.35 }}
            />
            <div className="text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4 lg:mb-5">{svc.icon}</div>
            <h3 className="font-bold text-sm sm:text-sm lg:text-base mb-1.5 sm:mb-2">{svc.title}</h3>
            <p className="text-[11px] sm:text-xs lg:text-sm text-[#8b8fa8] leading-relaxed">{svc.desc}</p>
            <span className="absolute top-4 right-4 text-[#4AFFD4] text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// CONTACT SECTION
// ─────────────────────────────────────────────
function ContactSection() {
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => {
      setStatus("sent");
      setTimeout(() => { setStatus("idle"); e.target.reset(); }, 3000);
    }, 1500);
  };

  return (
    <section id="contact" className="relative w-full py-16 sm:py-24 lg:py-32 px-5 sm:px-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-start">

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SectionLabel>// Get In Touch</SectionLabel>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Let's build something<br />
            <span className="bg-gradient-to-r from-[#4AFFD4] to-[#F5C842] bg-clip-text text-transparent">
              remarkable
            </span>
          </h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#8b8fa8] leading-relaxed">
            Have a vision? We have the architecture. Whether you're a startup, creator platform, or enterprise — let's talk.
          </p>
          <div className="mt-5 sm:mt-7 flex flex-col gap-2 sm:gap-3">
            <div className="font-mono text-xs sm:text-sm text-[#4AFFD4]">hello@maithri.tech</div>
            <div className="font-mono text-xs sm:text-sm text-[#8b8fa8]">Bengaluru, Karnataka, India</div>
          </div>
        </motion.div>

        <motion.form
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3.5 sm:gap-4 lg:gap-5"
        >
          <input
            type="text" placeholder="Name" required
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-white placeholder-[#8b8fa8]/60 text-sm outline-none focus:border-[#4AFFD4] focus:shadow-[0_0_20px_rgba(74,255,212,0.1)] transition-all duration-300"
          />
          <input
            type="email" placeholder="Email" required
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-white placeholder-[#8b8fa8]/60 text-sm outline-none focus:border-[#4AFFD4] focus:shadow-[0_0_20px_rgba(74,255,212,0.1)] transition-all duration-300"
          />
          <textarea
            placeholder="Message" required rows={4}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-white placeholder-[#8b8fa8]/60 text-sm outline-none resize-none focus:border-[#4AFFD4] focus:shadow-[0_0_20px_rgba(74,255,212,0.1)] transition-all duration-300 sm:rows-5"
          />
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(74,255,212,.3)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={status !== "idle"}
            className="w-full py-3.5 bg-gradient-to-r from-[#4AFFD4] to-[#1dd1a1] text-[#050508] font-bold rounded-xl text-sm tracking-wide transition-all duration-300 disabled:opacity-70"
          >
            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Send Message →
                </motion.span>
              )}
              {status === "loading" && (
                <motion.span key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Sending...
                </motion.span>
              )}
              {status === "sent" && (
                <motion.span key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Message Sent ✓
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// CURSOR — desktop only
// ─────────────────────────────────────────────
function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const isDesktop = !useIsMobile(1024);

  useEffect(() => {
    if (!isDesktop) return;
    const move = (e) => {
      if (dot.current) { dot.current.style.left = e.clientX + "px"; dot.current.style.top = e.clientY + "px"; }
      setTimeout(() => {
        if (ring.current) { ring.current.style.left = e.clientX + "px"; ring.current.style.top = e.clientY + "px"; }
      }, 90);
    };
    const grow = () => {
      if (dot.current) { dot.current.style.width = "22px"; dot.current.style.height = "22px"; dot.current.style.background = "#F5C842"; }
    };
    const shrink = () => {
      if (dot.current) { dot.current.style.width = "10px"; dot.current.style.height = "10px"; dot.current.style.background = "#4AFFD4"; }
    };
    window.addEventListener("mousemove", move);
    const els = document.querySelectorAll("button,a");
    els.forEach((el) => { el.addEventListener("mouseenter", grow); el.addEventListener("mouseleave", shrink); });
    return () => { window.removeEventListener("mousemove", move); };
  }, [isDesktop]);

  if (!isDesktop) return null;
  return (
    <>
      <div ref={dot} className="fixed pointer-events-none z-[9999] w-[10px] h-[10px] bg-[#4AFFD4] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-[width,height,background] duration-200" />
      <div ref={ring} className="fixed pointer-events-none z-[9998] w-9 h-9 border border-[#4AFFD4]/30 rounded-full -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-100" />
    </>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  return (
    <div className="bg-[#050508] text-[#FAFAF8] overflow-x-hidden lg:cursor-none">
      <CustomCursor />
      <Navbar />

      {/* Grain overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <HomeSection />
      <Divider />
      <AboutSection />
      <Divider />
      <ProductsSection />
      <Divider />
      <ServicesSection />
      <Divider />
      <ContactSection />

      <footer className="relative z-10 text-center py-5 sm:py-7 px-5 sm:px-8 border-t border-white/[0.05] font-mono text-[8px] sm:text-[10px] text-[#8b8fa8] tracking-widest">
        © 2025 MAITHRI TECHNOLOGIES PRIVATE LIMITED · BENGALURU, INDIA
      </footer>
    </div>
  );
}