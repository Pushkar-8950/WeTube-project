import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../src/pages/pages-jsx-files/home';
import Login from '../src/pages/pages-jsx-files/login';
import Register from '../src/pages/pages-jsx-files/register';
import VideoPlayPage from '../src/pages/pages-jsx-files/videoPlayPage';
import ChannelPage from '../src/pages/pages-jsx-files/channelPage';
import SearchPage from '../src/pages/pages-jsx-files/search';
import Studio from '../src/pages/pages-jsx-files/studio';
import Settings from '../src/pages/pages-jsx-files/settings';
import HistoryPage from '../src/pages/pages-jsx-files/history';
import LikedVideosPage from '../src/pages/pages-jsx-files/likedVideos';
import PlaylistsPage from '../src/pages/pages-jsx-files/playlists';
import PlaylistDetail from '../src/pages/pages-jsx-files/playlistDetail';
import SubscriptionsPage from '../src/pages/pages-jsx-files/subscriptions';

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Main Feeds */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />

                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />

                {/* Video Playback */}
                <Route path="/videoPlayPage/:videoId" element={<VideoPlayPage />} />
                <Route path="/watch/:videoId" element={<VideoPlayPage />} />

                {/* Channel & Profile */}
                <Route path="/channel/:identifier" element={<ChannelPage />} />
                <Route path="/channel/:channelId" element={<ChannelPage />} />
                <Route path="/c/:username" element={<ChannelPage />} />
                <Route path="/settings" element={<Settings />} />

                {/* Creator Studio & Management */}
                <Route path="/studio" element={<Studio />} />
                <Route path="/your-videos" element={<Studio />} />

                {/* Library & Playlists */}
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/liked-videos" element={<LikedVideosPage />} />
                <Route path="/playlists" element={<PlaylistsPage />} />
                <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
