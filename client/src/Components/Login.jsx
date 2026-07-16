import { useContext, useState } from "react";
import axios, { all } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/userProvider";

export default function Login() {

  const {change,setChange} = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  

  const sendOtp = async () => {
    try {

    const res =  await axios.get(
        `http://localhost:8080/generateOTP?email=${email}`
      );

      console.log(res.data);
      if(res.data == "OTP Sent Successfully"){
         setOtpSent(true);
      }
      setMessage(res.data)

    } catch (error) {

      console.log(error);
      setMessage("Failed To Send OTP");
    }
  };


  const verifyOtp = async () => {
    try {

      const res = await axios.post(
        "http://localhost:8080/verifyOtp",
        {
          email,
          otp,
        },
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      setMessage(res.data)
      if(res.data == "OTP Verified Successfully"){
        setChange(!change);
        setOtp("");
        setEmail("");

        navigate("/");
      }
      

    } catch (error) {

      console.log(error);
      setMessage("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-md">

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">

          <h1 className="text-4xl font-bold text-center text-white">
            Welcome Back
          </h1>

          <p className="text-slate-400 text-center mt-2">
            Login using Email OTP
          </p>

           <p className={`${message == "OTP Verified Successfully" || "OTP Sent Successfully" ? "text-green-500" : "text-red-600"} text-center mt-4 `}>
            {message}
          </p>

          <div className="mt-8 space-y-5">

            <div>
              <label className="block text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                  readOnly={message === "OTP Sent Successfully"}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className={`
                 ${message === "OTP Sent Successfully" ? "opacity-70 ": ""}
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
                `}
              />
            </div>

            {!otpSent ? (
              <button
                onClick={sendOtp}
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
                Send OTP
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-slate-300 mb-2">
                    OTP
                  </label>

                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value)
                    }
                    className="
                      w-full
                      bg-slate-800
                      border
                      border-slate-700
                      text-white
                      text-center
                      text-xl
                      tracking-[8px]
                      rounded-xl
                      px-4
                      py-3
                      focus:outline-none
                      focus:border-green-500
                    "
                  />
                </div>

                <button
                  onClick={verifyOtp}
                  className="
                    w-full
                    bg-green-600
                    hover:bg-green-500
                    text-white
                    py-3
                    rounded-xl
                    font-semibold
                    transition-all
                  "
                >
                  Verify OTP
                </button>
              </>
            )}

          </div>

          <p className="text-center text-slate-400 mt-6">
            New user?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}