import React, { useState } from 'react';

function Login() {
    const [currentState, setCurrentState] = useState('Sign Up');
    const isSignUp = currentState === 'Sign Up';

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        // Handle form submission
    };

    return (
        <form
            onSubmit={onSubmitHandler}
            className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
        >
            <div className="inline-flex items-center gap-2 mb-2 mt-10">
                <p className="prata-regular text-3xl">{currentState}</p>
                <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
            </div>

            {isSignUp && (
                <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-800"
                    required
                    placeholder="Name"
                />
            )}

            <input
                type="email"
                className="w-full px-3 py-2 border border-gray-800"
                required
                placeholder="Email"
            />
            <input
                type="password"
                className="w-full px-3 py-2 border border-gray-800"
                required
                placeholder="Password"
            />

            <div className="w-full flex justify-between text-sm -mt-2">
                <p className="cursor-pointer">Forgot your password?</p>
                <p
                    onClick={() => setCurrentState(isSignUp ? 'Login' : 'Sign Up')}
                    className="cursor-pointer"
                >
                    {isSignUp ? 'Login Here' : 'Create account'}
                </p>
            </div>

            <button
                type="submit"
                className="cursor-pointer bg-black text-white font-light px-8 py-2 mt-4"
            >
                {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
        </form>
    );
}

export default Login;
