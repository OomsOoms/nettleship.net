import { useParams } from "react-router-dom";
import useGetUserByUsername from "../hooks/useGetUserByUsername";
import MainLayout from "@components/layout/MainLayout";
import "../styles/ProfilePage.scss";

export interface User {
  google: any;
  local: any;
  displayName: string;
  username: string;
  profile: {
    displayName: string;
    bio: string;
    avatarUrl: string;
  };
  stats: {
    winStreak: number;
    wins: number;
    gamesPlayed: number;
    timePlayed: string;
  };
}

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user, loading } = useGetUserByUsername(username || "");

  // Handle all states explicitly
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  // Now we're guaranteed to have user data
  const avatarUrl = user.profile?.avatarUrl.startsWith("https")
    ? user.profile.avatarUrl
    : `${import.meta.env.VITE_IMAGE_URL}${user.profile.avatarUrl}`;

  return (
    <MainLayout>
      <div className="container profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              <img src={avatarUrl} alt={user.profile?.displayName} />
            </div>

            <div className="profile-info">
              <h1 className="display-name">{user.profile.displayName}</h1>
              <p className="username">{user.username}</p>
              <p className="bio">{user.profile.bio}</p>
            </div>
          </div>

          <div className="profile-content">
            <h2 className="stats-title">Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Win Streak</p>
                <p className="stat-value">{user.stats.winStreak}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Wins</p>
                <p className="stat-value">{user.stats.wins}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Games Played</p>
                <p className="stat-value">{user.stats.gamesPlayed}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Time Played</p>
                <p className="stat-value">{user.stats.timePlayed}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
