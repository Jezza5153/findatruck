
"use client"; // Ensure this hook is client-side only

import * as React from "react"

const MOBILE_BREAKPOINT = 768 // Standard md breakpoint

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false); // Default to false or based on initial check

  React.useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    
    // Set the initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures effect is only run on mount and unmount

  return isMobile;
}
