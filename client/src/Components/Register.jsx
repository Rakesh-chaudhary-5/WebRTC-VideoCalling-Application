import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
     const res = await axios.post("http://localhost:8080/register",
      {
        username,
        email
      },
      {withCredentials: true}
    );
    if(res.data == "registration successful"){
      setUsername("");
      setEmail("");
    }
      setMessage(res.data);
      
    } catch (error) {
      console.log(error);
      setMessage("Registration Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-md">

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">

          <h1 className="text-4xl font-bold text-center text-white">
            Create Account
          </h1>

          <p className="text-slate-400 text-center mt-2">
            Register to continue
          </p>

          <p className={`${message == "registration successful" ? "text-green-500" : "text-red-600"} text-center mt-4 `}>
            {message}
          </p>

          <form
            onSubmit={handleRegister}
            className="mt-8 space-y-5"
          >

            <div>
              <label className="block text-slate-300 mb-2">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                className="
                  w-full
                  bg-slate-800
                  border
                  border-slate-700
                  text-white
                  rounded-xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:border-indigo-500
                "
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                  w-full
                  bg-slate-800
                  border
                  border-slate-700
                  text-white
                  rounded-xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:border-indigo-500
                "
              />
            </div>

            <button
              type="submit"
              className="
                w-full
                bg-indigo-600
                hover:bg-indigo-500
                text-white
                py-3
                rounded-xl
                font-semibold
                transition-all
              "
            >
              Register
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}