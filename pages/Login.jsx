"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const Login = ({ loginWithPopup }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const userContext = useUser();
  if (!userContext) return null;
  const { login, register, loginWithGoogle, user } = userContext;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      isRegistering
        ? await register(email, password, firstName, lastName)
        : await login(email, password);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.has("email")) {
      setEmail(searchParams.get("email"));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.userID && !loginWithPopup) {
      router.push("/");
    }
  }, [user]);

  return (
    <div className="flex rounded-[24px] overflow-hidden shadow-lg max-w-xs md:max-w-5xl w-full">
      <div className="hidden md:flex relative w-2/3 bg-white/30 px-10 py-24 flex-col justify-center items-center text-white">
        <div className="h-64 w-64 bg-white rounded-full mb-10 shadow">
          <img
            className="h-full w-full object-contain"
            src="/media/logo.png"
            alt="logo"
          />
        </div>

        <div className="mt-2 text-center">
          <h1 className="text-xl font-bold">Benvenuto a bordo, amico mio</h1>
          <p className="mt-2 text-sm">
            Solo un paio di clic e iniziamo il viaggio
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-white w-full md:w-1/2 px-5 md:px-14 py-10">
        <h2 className="text-xl font-bold mb-8 text-main text-center">
          {isRegistering ? "Registrati" : "Accedi"}
        </h2>

        <form onSubmit={handleSubmit} className="">
          {isRegistering ? (
            <div className="flex items-center mb-4 gap-4">
              <div className="relative">
                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-1"
                  placeholder="Nome"
                  required
                />
              </div>
              <div className="relative">
                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-1"
                  placeholder="Cognome"
                  required
                />
              </div>
            </div>
          ) : null}
          <div className="relative">
            <label
              className="absolute left-3 h-5 w-5 top-1/2 transform -translate-y-1/2 mt-0"
              htmlFor="email"
            >
              <img
                src="/media/email.png"
                className="h-full w-full object-contain opacity-50"
                alt="email"
              />
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-1"
              placeholder="Email"
              required
            />
          </div>
          <div className="relative mt-4">
            <label
              className="absolute left-3 h-5 w-5 top-1/2 transform -translate-y-1/2 mt-0"
              htmlFor="password"
            >
              <img
                src="/media/lock.png"
                className="h-full w-full object-contain opacity-50"
                alt="lock"
              />
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 px-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-1"
              placeholder="Password"
              required
            />
            <button
              onClick={() => setShowPassword((prev) => !prev)}
              className="h-5 w-5 absolute top-1/2 transform -translate-y-1/2 mt-0 hover:opacity-50 right-3"
              type="button"
            >
              <img
                src={showPassword ? "/media/hide.png" : "/media/show.png"}
                className="h-full w-full object-contain"
                alt="eye"
              />
            </button>
          </div>

          {isRegistering ? null : (
            <div className="flex items-center justify-end pt-4">
              <button
                disabled={loading}
                type="button"
                className="text-sm text-main hover:text-secondary disabled:opacity-50 font-semibold"
              >
                Password dimenticata?
              </button>
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full mt-8 py-3 bg-main-1 text-white font-semibold rounded-full hover:bg-main-2 transition disabled:opacity-50"
          >
            {isRegistering ? "Registrati" : "Accedi"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 py-4">
          <div className="h-[0.5px] bg-main-1/50 w-1/4" />
          <p className="text-xs text-main uppercase">O</p>
          <div className="h-[0.5px] bg-main-1/50 w-1/4" />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 rounded-full flex justify-center items-center gap-4 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <img
              src="/media/google.png"
              alt="Google"
              className="w-5 h-5 object-contain"
            />
            Google
          </button>
        </div>

        <p className="mt-6 text-sm text-center text-gray-600">
          Non hai ancora un account?{" "}
          <button
            type="button"
            className="underline text-xs font-semibold"
            onClick={() => setIsRegistering((prev) => !prev)}
          >
            {isRegistering ? "Accedi" : "Registrati"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
