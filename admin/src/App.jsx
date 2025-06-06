import { Route, Routes } from "react-router";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import { ToastContainer } from 'react-toastify';
import Login from "./components/Login";

const App = () => {
  const { loading, user } = useAuth();
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {
        !user ?
          (<Login />)
          :
          (
            <>
              <Navbar />
              <hr className="border border-gray-300" />
              <div className="flex w-full">
                <Sidebar />
                <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
                  <Routes>
                    <Route path="/add" element={<Add />} />
                    <Route path="/list" element={<List />} />
                    <Route path="/orders" element={<Orders />} />
                  </Routes>
                </div>
              </div>
            </>
          )
      }
    </div>
  );
};

export default App;
