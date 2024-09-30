// this is not what a page should look like its just used for testing
import { useContext } from 'react';
import { UserContext } from '../context/userContext';

const Home = () => {
    const { user, loading } = useContext(UserContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Not authenticated. Please <a href="/login">login</a>.</div>;
    }

    const handleLogout = async () => {
        try {
            const response = await fetch('https://api.nettleship.net/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // Include cookies if needed
            });

            if (response.ok) {
                console.log('Logout successful');
                window.location.href = '/login';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('An error occurred during logout', error);
        }
    };

    return (
        <div className="home-page">
            <h1>Welcome, {user.profile.displayName}!</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Home;
