import { UserProvider } from './context/userContext.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import { RegisterForm, LoginForm } from "./features/authentication";
import './assets/App.css'


export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="login" element={<LoginForm />} />
            <Route path="register" element={<RegisterForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}