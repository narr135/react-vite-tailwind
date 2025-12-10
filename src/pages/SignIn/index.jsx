import { useContext, useRef, useState } from "react";
import { ShoppingCartContext } from "../../Context";
import { Link } from "react-router-dom";

function SignIn() {
  const {
    account,
    signIn,
    signOut,
    isSignIn
  } = useContext(ShoppingCartContext);
  const [view, setView] = useState("login");
  const form = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasUserAnAccount = Object.keys(account || {}).length !== 0;

  const createAnAccount = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(form.current);
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
      };

      await signIn(data); // registers and stores token/account
      // after success, navigate home (Link wrapper does it)
    } catch (err) {
      // show server error message if available
      const msg = err?.response?.data?.message || err?.response?.data || err.message || 'Failed to register';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const doLogin = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(form.current || undefined);
      const data = {
        email: formData ? formData.get("email") : account?.email,
        password: formData ? formData.get("password") : account?.password
      };

      if (!data.email || !data.password) {
        setError('Please provide email and password');
        setLoading(false);
        return;
      }

      await signIn(data); // login
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderLogin = () => {
    return (
      <form ref={form} className="flex flex-col w-80" onSubmit={doLogin}>
        {error && <div className="text-red-600 text-sm mb-2">{String(error)}</div>}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-light text-sm">Email:</label>
          <input
            type="text"
            id="email"
            name="email"
            defaultValue={account?.email}
            placeholder="hi@helloworld.com"
            className="rounded-lg border border-black placeholder:font-light placeholder:text-sm placeholder:text-black/60 focus:outline-none py-2 px-4"
          />
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <label htmlFor="password" className="font-light text-sm">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            defaultValue={account?.password}
            placeholder="******"
            className="rounded-lg border border-black placeholder:font-light placeholder:text-sm placeholder:text-black/60 focus:outline-none py-2 px-4"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="bg-black text-white w-full rounded-lg py-3"
            disabled={loading}
          >
            {loading ? 'Logging...' : 'Log in'}
          </button>
          <button
            type="button"
            className="border border-black rounded-lg py-3 px-4"
            onClick={() => {
              form.current?.reset?.();
              setView('create-user-info');
            }}
            disabled={loading}
          >
            Create
          </button>
        </div>
      </form>
    )
  }

  const renderCreateUserInfo = () => {
    return (
      <form ref={form} className="flex flex-col gap-4 w-80" onSubmit={createAnAccount}>
        {error && <div className="text-red-600 text-sm mb-2">{String(error)}</div>}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="font-light text-sm">Your name:</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={account?.name}
            placeholder="John"
            className="rounded-lg border border-black placeholder:font-light placeholder:text-sm placeholder:text-black/60 focus:outline-none py-2 px-4"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-light text-sm">Your email:</label>
          <input
            type="text"
            id="email"
            name="email"
            defaultValue={account?.email}
            placeholder="hi@helloworld.com"
            className="rounded-lg border border-black placeholder:font-light placeholder:text-sm placeholder:text-black/60 focus:outline-none py-2 px-4"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="font-light text-sm">Your password:</label>
          <input
            type="password"
            id="password"
            name="password"
            defaultValue={account?.password}
            placeholder="******"
            className="rounded-lg border border-black placeholder:font-light placeholder:text-sm placeholder:text-black/60 focus:outline-none py-2 px-4"
          />
        </div>
        <div className="flex gap-2">
          <Link to="/">
            <button
              className="bg-black text-white w-full rounded-lg py-3"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </Link>
          <button
            type="button"
            className="border border-black rounded-lg py-3 px-4"
            onClick={() => setView('login')}
            disabled={loading}
          >
            Back
          </button>
        </div>
      </form>
    );
  };

  const renderView = () => view === "create-user-info" ? renderCreateUserInfo() : renderLogin();

  return (
    <>
      <h1 className="font-medium text-xl text-center w-80 mb-6">
        Welcome, let's get started
      </h1>
      {renderView()}
    </>
  );
}

export { SignIn }