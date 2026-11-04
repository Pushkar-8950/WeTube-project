import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../src/pages/pages-jsx-files/home'
import Login from '../src/pages/pages-jsx-files/login'
import VideoPlayPage from '../src/pages/pages-jsx-files/videoPlayPage'
import ChannelPage from '../src/pages/pages-jsx-files/channelPage'

function AppRoutes(){

    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/videoPlayPage/:videoId' element={<VideoPlayPage />} />
                    <Route path="/channel/:channelId" element={<ChannelPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default AppRoutes;