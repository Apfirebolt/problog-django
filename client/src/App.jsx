import { BrowserRouter, Routes, Route } from 'react-router'
import Home from './screens/Home'
import Login from './screens/Login'
import Register from './screens/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App