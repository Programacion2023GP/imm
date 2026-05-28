import { memo, useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiHeart } from "react-icons/fi";
import { FaFemale, FaVenusMars, FaDove } from "react-icons/fa";
import { GiRose } from "react-icons/gi";
import { IoMdFemale, IoMdTransgender } from "react-icons/io";
import useAuthData from "../../hooks/auth/useauthdata";

const PageLoginInstitutoMujer = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { login, initialValues } = useAuthData();

  // Efecto de partículas simplificado y más suave
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#130D0E";
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 182, 175, ${p.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const validationSchema = Yup.object({
    usuario: Yup.string().required("El usuario es requerido"),
    password: Yup.string().required("La contraseña es requerida"),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setStatus }: any,
  ) => {
    try {
      await login(values.usuario, values.password, navigate);
    } catch (err: any) {
      setStatus(err.message || "Error al iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  // Elementos decorativos flotantes (menos saturación)
  const floatingIcons = [
    {
      icon: FaFemale,
      color: "#9B2242",
      size: 28,
      x: "8%",
      y: "15%",
      delay: 0,
      duration: 25,
    },
    {
      icon: FaVenusMars,
      color: "#651D32",
      size: 32,
      x: "85%",
      y: "20%",
      delay: 1.5,
      duration: 28,
    },
    {
      icon: GiRose,
      color: "#9B2242",
      size: 26,
      x: "12%",
      y: "75%",
      delay: 2,
      duration: 22,
    },
    {
      icon: FiHeart,
      color: "#B8B6AF",
      size: 24,
      x: "88%",
      y: "70%",
      delay: 0.8,
      duration: 26,
    },
    {
      icon: IoMdFemale,
      color: "#9B2242",
      size: 30,
      x: "20%",
      y: "40%",
      delay: 1,
      duration: 30,
    },
    {
      icon: IoMdTransgender,
      color: "#651D32",
      size: 28,
      x: "75%",
      y: "50%",
      delay: 2.5,
      duration: 27,
    },
    {
      icon: FaDove,
      color: "#B8B6AF",
      size: 26,
      x: "45%",
      y: "85%",
      delay: 3,
      duration: 24,
    },
  ];

  return (
    <div className="min-h-screen bg-[#130D0E] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Canvas de partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full -z-10"
      />

      {/* Gradientes de fondo sutiles */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9B2242]/20 via-transparent to-[#651D32]/20 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#9B2242]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#651D32]/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Íconos flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              className="absolute"
              style={{ left: item.x, top: item.y }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: item.duration,
                delay: item.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Icon
                size={item.size}
                color={item.color}
                className="drop-shadow-lg"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Contenido principal */}
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#130D0E]/80 backdrop-blur-md rounded-2xl border border-[#9B2242]/30 shadow-2xl p-8"
        >
          {/* Logo y título */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#9B2242] to-[#651D32] flex items-center justify-center shadow-lg mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <IoMdFemale className="text-white text-4xl" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">
              Instituto de la Mujer
            </h1>
            <p className="text-[#B8B6AF] text-sm mt-1">
              Archivo Digital de Igualdad
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <FiHeart className="text-[#9B2242] text-xs" />
              <span className="text-[#9B2242] text-xs font-medium">
                Por una vida libre de violencia
              </span>
              <FiHeart className="text-[#9B2242] text-xs" />
            </div>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-5">
                <AnimatePresence>
                  {status && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm text-center"
                    >
                      {status}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-[#B8B6AF] text-sm font-medium mb-2">
                    Usuario
                  </label>
                  <Field
                    name="usuario"
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#474C55] rounded-lg focus:ring-2 focus:ring-[#9B2242] focus:border-transparent text-white placeholder-[#727372] transition"
                    placeholder="Ingresa tu usuario"
                  />
                  <ErrorMessage
                    name="usuario"
                    component="div"
                    className="text-red-400 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className="block text-[#B8B6AF] text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#474C55] rounded-lg focus:ring-2 focus:ring-[#9B2242] focus:border-transparent text-white placeholder-[#727372] pr-12 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727372] hover:text-[#B8B6AF] transition"
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-400 text-xs mt-1"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#9B2242] to-[#651D32] hover:from-[#8a1e3a] hover:to-[#7a1b2a] text-white font-semibold py-3 rounded-lg transition shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                </motion.button>

                <div className="text-center pt-4 border-t border-[#474C55]/30">
                  <p className="text-[#727372] text-xs">
                    Datos protegidos por la Ley de Igualdad
                  </p>
                  <p className="text-[#727372] text-xs mt-1">
                    Versión { "2.0.0"}
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </motion.div>
      </div>
    </div>
  );
};

export default memo(PageLoginInstitutoMujer);
