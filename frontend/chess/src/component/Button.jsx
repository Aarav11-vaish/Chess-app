import React from 'react';


function Button({ text, onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
        > play
            {text}
        </button>
    );
}

export default Button;