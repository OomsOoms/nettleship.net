import { useState, useEffect } from "react"

function useMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        // Initial check
        checkIfMobile()

        // Add event listener
        window.addEventListener("resize", checkIfMobile)

        // Clean up
        return () => {
            window.removeEventListener("resize", checkIfMobile)
        }
    }, [])

    return isMobile
}

export default useMobile;
