"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import menuData from "./menuData";
import { useAuth } from "@/stores/userAuth";
import { ModeToggle } from "./toggler";

const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen((prev) => !prev);
  };

  const {user, isAuthenticated, isLoading}=useAuth();


  const pathname = usePathname();

  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = useCallback(() => {
    setSticky(window.scrollY > 0); // sticky starts as soon as the user scrolls
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, [handleStickyNavbar]);

  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".group")) {
        setOpenIndex(-1);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
    const router = useRouter();

useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push("/login");
  }
}, [isLoading, isAuthenticated, router]);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 w-full z-9999 transition-all duration-300 py-2 md:py-2.5 lg:py-3
          border-b border-gray-200 dark:border-[#6ABAE1]/20
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
          ${sticky ? "dark:border-[#6ABAE1] shadow-md" : "shadow-none"}
        `}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Compact Logo */}
            <div className="relative group">
              <Link
                href="/"
                className="relative block transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0   duration-500" />
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={120}
                  height={30}
                  className="h-auto w-auto max-h-10 md:max-h-11 lg:max-h-12 relative z-10 dark:hidden"
                  priority
                />
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={120}
                  height={30}
                  className="hidden h-auto w-auto max-h-10 md:max-h-11 lg:max-h-12 relative z-10 dark:block"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation - unchanged */}
            <nav className="hidden lg:flex lg:items-center lg:space-x-1">
              {/* ... desktop navigation remains the same ... */}
              <ul className="flex items-center space-x-1">
                {menuData.map((menuItem, index) => (
                  <li key={index} className="relative group">
                    {menuItem.path ? (
                      <Link
                        href={menuItem.path as string}
                        className={`
                          relative px-3 py-1.5 text-sm xl:text-base font-medium rounded-sm
                          transition-all duration-300 inline-flex items-center
                          ${
                            pathname === menuItem.path
                              ? "text-[#03396C] dark:text-[#D8F0F4] bg-linear-to-br from-[#D8F0F4]/40 to-[#6ABAE1]/20 dark:from-[#6ABAE1]/20 dark:to-[#03396C]/30"
                              : "text-primary/80 hover:text-[#6ABAE1] dark:text-[#D8F0F4]/80 dark:hover:text-[#6ABAE1]"
                          }
                          before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2
                          before:w-0 before:h-0.5 before:bg-linear-to-r before:from-[#6ABAE1] before:to-[#03396C]
                          before:transition-all before:duration-300 hover:before:w-1/2
                          after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
                          after:w-0 after:h-0.5 after:bg-linear-to-r after:from-[#03396C] after:to-[#6ABAE1]
                          after:transition-all after:duration-300 hover:after:w-1/2
                        `}
                      >
                        {menuItem.title}
                      </Link>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => handleSubmenu(index)}
                          className={`
                            relative px-3 py-1.5 text-sm xl:text-base font-medium rounded-sm
                            transition-all duration-300 inline-flex items-center gap-1.5
                            ${
                              openIndex === index
                                ? "text-[#03396C] dark:text-[#D8F0F4] bg-linear-to-br from-[#D8F0F4]/40 to-[#6ABAE1]/20"
                                : "text-primary/80 hover:text-[#6ABAE1] dark:text-[#D8F0F4]/80 dark:hover:text-[#6ABAE1]"
                            }
                            group-hover:bg-[#D8F0F4]/20
                          `}
                        >
                          {menuItem.title}
                          <svg
                            className={`w-3.5 h-3.5 transition-all duration-300 ${
                              openIndex === index ? "rotate-180 transform" : ""
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        {/* Dropdown */}
                        {menuItem.submenu && (
                          <div
                            className={`
                              absolute left-0 top-full mt-2 w-56
                              transition-all duration-400 transform origin-top-left
                              ${
                                openIndex === index
                                  ? "visible opacity-100 scale-100 translate-y-0"
                                  : "invisible opacity-0 scale-95 -translate-y-2 pointer-events-none"
                              }
                            `}
                          >
                            <div className="relative bg-white dark:bg-primary rounded-sm shadow-2xl border border-[#D8F0F4]/30 dark:border-[#6ABAE1]/20 overflow-hidden">
                              <div className="absolute inset-0 bg-linear-to-br from-[#D8F0F4]/20 to-transparent dark:from-[#6ABAE1]/10" />
                              <div className="relative p-1.5">
                                {menuItem.submenu.map((subItem, subIndex) => (
                                  <Link
                                    key={subIndex}
                                    href={subItem.path as string}
                                    className={`
                                      group/sub flex items-center px-3 py-2 rounded-sm
                                      transition-all duration-300
                                      ${
                                        pathname === subItem.path
                                          ? "bg-linear-to-r from-[#6ABAE1]/20 to-[#03396C]/10 text-[#03396C] dark:text-[#D8F0F4]"
                                          : "text-primary/70 hover:text-[#6ABAE1] dark:text-[#D8F0F4]/70 dark:hover:text-[#6ABAE1] hover:bg-[#D8F0F4]/40 dark:hover:bg-[#6ABAE1]/10"
                                      }
                                    `}
                                  >
                                    <span className="flex-1 text-xs font-medium">
                                      {subItem.title}
                                    </span>
                                    <svg
                                      className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-300"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Side Actions - More Compact */}
            <div className="flex items-center space-x-1.5 md:space-x-2 lg:space-x-3">
           {/*<ModeToggle></ModeToggle> */}   
              

              <div className="hidden md:flex md:items-center md:space-x-1.5">
                {isAuthenticated ? (<>
                <span>{user?.name}</span>
                          <Link
                  href="/login"
                  className="relative px-3.5 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-[#03396C] dark:text-[#D8F0F4] rounded-sm
                    border border-[#6ABAE1]/30 hover:border-[#6ABAE1] dark:border-[#D8F0F4]/30
                    transition-all duration-300 hover:shadow-lg hover:shadow-[#6ABAE1]/20
                    bg-linear-to-r from-transparent to-transparent
                    hover:from-[#D8F0F4]/20 hover:to-transparent
                    overflow-hidden group/btn"
                >
                  <span className="relative z-10">Logout</span>
                  <div className="absolute inset-0 bg-linear-to-r from-[#6ABAE1]/0 via-[#6ABAE1]/10 to-[#6ABAE1]/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                </Link>
                
                
                </>):(<>
                          <Link
                  href="/login"
                  className="relative px-3.5 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-[#03396C] dark:text-[#D8F0F4] rounded-sm
                    border border-[#6ABAE1]/30 hover:border-[#6ABAE1] dark:border-[#D8F0F4]/30
                    transition-all duration-300 hover:shadow-lg hover:shadow-[#6ABAE1]/20
                    bg-linear-to-r from-transparent to-transparent
                    hover:from-[#D8F0F4]/20 hover:to-transparent
                    overflow-hidden group/btn"
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-linear-to-r from-[#6ABAE1]/0 via-[#6ABAE1]/10 to-[#6ABAE1]/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                </Link></>)}
      
              </div>

              {/* Mobile Menu Toggle - Smaller */}
              <button
                onClick={navbarToggleHandler}
                aria-label="Toggle Mobile Menu"
                className="inline-flex items-center justify-center w-9 h-9 lg:hidden
                  rounded-sm bg-linear-to-br from-[#D8F0F4]/40 to-transparent
                  dark:from-[#03396C]/40 dark:to-transparent
                  border border-[#6ABAE1]/30 hover:border-[#6ABAE1]
                  transition-all duration-300 hover:scale-110 active:scale-90
                  text-[#03396C] dark:text-[#D8F0F4]"
              >
                <div className="relative w-4 h-4">
                  <span
                    className={`absolute top-0 left-0 w-4 h-0.5 bg-current rounded-sm transition-all duration-300 ${
                      navbarOpen ? "rotate-45 translate-y-1.5" : ""
                    }`}
                  />
                  <span
                    className={`absolute top-1.5 left-0 w-4 h-0.5 bg-current rounded-sm transition-all duration-300 ${
                      navbarOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`absolute bottom-0 left-0 w-4 h-0.5 bg-current rounded-sm transition-all duration-300 ${
                      navbarOpen ? "-rotate-45 -translate-y-1.5" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
          {/* Compact Mobile Menu */}
          <div
            className={`
    fixed inset-x-3 top-16 z-50
    lg:hidden transition-all duration-500 transform
    ${
      navbarOpen
        ? "visible opacity-100 translate-y-0"
        : "invisible opacity-0 -translate-y-4 pointer-events-none"
    }
  `}
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-sm shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-b from-blue-50/50 to-transparent dark:from-gray-800/30" />
              <div className="relative p-3 max-h-[calc(100vh-80px)] overflow-y-auto">
                <nav>
                  <ul className="space-y-0.5">
                    {menuData.map((menuItem, index) => (
                      <li
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path as string}
                            onClick={() => setNavbarOpen(false)}
                            className={`
                    flex items-center py-2.5 px-2 rounded-sm text-sm font-medium
                    transition-all duration-300
                    ${
                      pathname === menuItem.path
                        ? "bg-linear-to-r from-blue-100 to-blue-50 text-blue-900 dark:from-gray-800 dark:to-gray-900 dark:text-blue-400"
                        : "text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-gray-900/50"
                    }
                  `}
                          >
                            {menuItem.title}
                          </Link>
                        ) : (
                          <div className="py-1">
                            <button
                              onClick={() => handleSubmenu(index)}
                              className={`
                      flex w-full items-center justify-between py-2 px-2 rounded-sm
                      text-sm font-medium transition-all duration-300
                      ${
                        openIndex === index
                          ? "bg-linear-to-r from-blue-100 to-blue-50 text-blue-900 dark:from-gray-800 dark:to-gray-900 dark:text-blue-400"
                          : "text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400"
                      }
                    `}
                            >
                              {menuItem.title}
                              <svg
                                className={`w-4 h-4 transition-all duration-300 ${
                                  openIndex === index ? "rotate-180" : ""
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>

                            {menuItem.submenu && (
                              <div
                                className={`
                        mt-1 ml-2 space-y-0.5 transition-all duration-300
                        ${
                          openIndex === index
                            ? "block opacity-100"
                            : "hidden opacity-0"
                        }
                      `}
                              >
                                {menuItem.submenu.map((subItem, subIndex) => (
                                  <Link
                                    key={subIndex}
                                    href={subItem.path as string}
                                    onClick={() => setNavbarOpen(false)}
                                    className={`
                            flex items-center py-1.5 px-3 rounded-sm text-xs
                            transition-all duration-300 pl-5
                            ${
                              pathname === subItem.path
                                ? "text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-gray-900"
                                : "text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-gray-900/30"
                            }
                          `}
                                  >
                                    <span className="w-1 h-1 bg-blue-500 rounded-full mr-2" />
                                    {subItem.title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}

                    {/* Mobile Auth Button - Compact */}
                    <li className="pt-3">
                      <Link
                        href="/journey"
                        onClick={() => setNavbarOpen(false)}
                        className="flex w-full items-center justify-center px-3 py-2.5 rounded-sm
                text-sm font-medium text-blue-900 dark:text-blue-400
                border border-blue-200 hover:border-blue-500 dark:border-gray-700 dark:hover:border-primary
                transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-primary/20
                bg-linear-to-r from-transparent to-transparent
                hover:from-blue-50 hover:to-transparent dark:hover:from-gray-800"
                      >
                        Start Your Scholarship Journey
                      </Link>
                    </li>
                    <li className="pt-2">
                      <Link
                        href="/login"
                        onClick={() => setNavbarOpen(false)}
                        className="flex w-full items-center justify-center px-3 py-2.5 rounded-sm
                text-sm font-medium text-blue-900 dark:text-blue-400
                border border-blue-200 hover:border-blue-500 dark:border-gray-700 dark:hover:border-primary
                transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-primary/20
                bg-linear-to-r from-transparent to-transparent
                hover:from-blue-50 hover:to-transparent dark:hover:from-gray-800"
                      >
                        Login
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay - More Subtle */}
      {navbarOpen && (
        <div
          onClick={() => setNavbarOpen(false)}
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm dark:bg-gray-900 transition-opacity duration-300 lg:hidden"
        />
      )}

      {/* Dynamic Spacer - Smaller */}
      <div className="h-14 md:h-16 lg:h-13" />
    </>
  );
};

export default Header;
