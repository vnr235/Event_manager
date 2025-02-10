import {BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage'
import DashboardPage from './components/DashboardPage';
import Home from './components/HomePage';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />}></Route>
      <Route path='/admin' element={<AdminDashboard/>}/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
