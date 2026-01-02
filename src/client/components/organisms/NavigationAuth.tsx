import Button from "../atoms/Button";

interface NavigationAuthProps {
  isDarkMode?: boolean;
  isMobile?: boolean;
}

export default function NavigationAuth({
  isDarkMode = false,
  isMobile = false,
}: NavigationAuthProps) {
  const containerClasses = isMobile
    ? "flex flex-col xl:flex xl:flex-row xl:items-center xl:gap-4 xl:flex-shrink-0 p-4"
    : "hidden xl:flex xl:flex-row xl:items-center xl:gap-4 xl:flex-shrink-0";

  const buttonClasses = isMobile
    ? "w-full xl:w-auto mb-2 xl:mb-0"
    : "w-full xl:w-auto";

  return (
    <div
      id={isMobile ? "globalAuthContainer" : "desktopAuthContainer"}
      className={containerClasses}
    >
      <Button
        href="https://sentry.io/auth/login/"
        variant="silent"
        redesign={true}
        darkMode={isDarkMode}
        className={buttonClasses}
      >
        Sign In
      </Button>
      <Button
        href="https://sentry.io/demo/"
        variant="secondary-dark"
        redesign={true}
        darkMode={isDarkMode}
        className={buttonClasses}
      >
        Get Demo
      </Button>
      <Button
        href="https://sentry.io/signup/"
        variant="primary-dark"
        redesign={true}
        darkMode={isDarkMode}
        className={buttonClasses}
      >
        Get Started
      </Button>
    </div>
  );
}
