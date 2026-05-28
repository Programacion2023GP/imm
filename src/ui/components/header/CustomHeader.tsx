// components/header/Header.tsx
import { useState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import useAuthData from "../../hooks/auth/useauthdata";
import { theme } from "../../../config/themes";

interface HeaderProps {
  setOpenSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header = ({ setOpenSidebar, isSidebarOpen }: HeaderProps) => {
  const authData = useAuthData();
  const authUser = authData.persist;
  const { logout } = authData;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(e.target)
      )
        setDropdownOpen(false);
      if (notifRef.current && !(notifRef.current as any).contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = "Usuario"
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Colores del tema
  const primaryColor = theme.colors.primary.DEFAULT;
  const primaryDark = theme.colors.primary.dark;
  const primaryLight = theme.colors.primary.light;
  const borderColor = `${primaryColor}33`; // 20% opacidad
  const borderLight = `${primaryColor}1A`; // 10% opacidad
  const bgDark = theme.colors.primary.dark;

  return (
    <header
      style={{
        height: "64px",
        background: scrolled
          ? `${bgDark}F5` // con opacidad
          : `linear-gradient(135deg, ${bgDark} 0%, ${primaryDark} 50%, ${bgDark} 100%)`,
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px 0 16px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "all 0.3s ease",
        boxShadow: scrolled ? theme.shadows.md : "none",
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Hamburger */}
        <button
          onClick={setOpenSidebar}
          style={{
            width: "38px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isSidebarOpen ? `${primaryColor}4D` : "transparent",
            border: `1px solid ${borderColor}`,
            borderRadius: theme.radius.md,
            color: theme.colors.text.inverse,
            cursor: "pointer",
            transition: theme.transitions.DEFAULT,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = `${primaryColor}40`)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = isSidebarOpen
              ? `${primaryColor}4D`
              : "transparent")
          }
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Breadcrumb / Page title */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "1px",
              height: "20px",
              background: borderColor,
              marginRight: "4px",
            }}
          />
          <div></div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Notifications - se puede agregar después */}

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "24px",
            background: borderLight,
            margin: "0 4px",
          }}
        />

        {/* Profile */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 12px 6px 6px",
              background: dropdownOpen ? `${primaryColor}33` : "transparent",
              border: `1px solid ${borderColor}`,
              borderRadius: theme.radius.md,
              cursor: "pointer",
              transition: theme.transitions.DEFAULT,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = `${primaryColor}26`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = dropdownOpen
                ? `${primaryColor}33`
                : "transparent")
            }
          >
            {/* Avatar */}
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: theme.radius.sm,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "700",
                color: theme.colors.text.inverse,
                letterSpacing: "0.5px",
                boxShadow: `0 2px 8px ${primaryColor}66`,
              }}
            >
              {initials}
            </div>
            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  margin: 0,
                  color: theme.colors.text.inverse,
                  fontSize: "12.5px",
                  fontWeight: "600",
                  lineHeight: 1.2,
                }}
              >
                {/* {authUser.username?.split(" ")[0] || "Usuario"} */}
                Usuario
              </p>
              <p
                style={{
                  margin: 0,
                  color: theme.colors.text.disabled,
                  fontSize: "10.5px",
                  lineHeight: 1.2,
                }}
              >
                {/* {authUser.full_name ?? "Perfil"} */}
                Perfil
              </p>
            </div>
            <span
              style={{
                color: theme.colors.text.disabled,
                display: "flex",
                marginLeft: "2px",
              }}
            >
              <ChevronDown size={16} />
            </span>
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "220px",
                background: bgDark,
                border: `1px solid ${borderColor}`,
                borderRadius: theme.radius.lg,
                boxShadow: theme.shadows.dropdown,
                overflow: "hidden",
                zIndex: theme.zIndex.dropdown,
                animation: "dropIn 0.2s ease",
              }}
            >
              {/* Profile info */}
              <div
                style={{
                  padding: "16px",
                  borderBottom: `1px solid ${borderLight}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: theme.radius.md,
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: theme.colors.text.inverse,
                      boxShadow: `0 4px 12px ${primaryColor}66`,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: theme.colors.text.inverse,
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Usuario
                    </p>
                    <div
                      style={{
                        marginTop: "4px",
                        display: "inline-flex",
                        alignItems: "center",
                        background: `${primaryColor}40`,
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      <span
                        style={{
                          color: primaryLight,
                          fontSize: "10.5px",
                          fontWeight: "600",
                        }}
                      >
                        Perfil
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: "8px" }}>
                <div
                  style={{
                    margin: "6px 0",
                    height: "1px",
                    background: borderLight,
                  }}
                />

                {/* Logout */}
                <button
                  onClick={logout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    borderRadius: theme.radius.md,
                    color: theme.colors.status.error,
                    cursor: "pointer",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    transition: theme.transitions.DEFAULT,
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = `${primaryColor}33`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animación para el dropdown */}
      <style>{`
        @keyframes dropIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
};
