import { useState } from "react";
import { unlinkGoogleAccount } from "../services/userServices";

const useGoogleAccount = () => {
    const [googleAccountUnlinked, setGoogleAccountUnlinked] = useState(false);

    const unlinkAccount = async () => {
        try {
            await unlinkGoogleAccount();
            setGoogleAccountUnlinked(true);
        } catch (error) {
            console.error("Error unlinking Google account:", error);
            throw error;
        }
    };

    const linkGoogleAccount = async () => {
        // this will redirect to the google auth page so i dont have to update the state
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    }

    return { unlinkAccount, linkGoogleAccount, googleAccountUnlinked, setGoogleAccountUnlinked };
}
export default useGoogleAccount;