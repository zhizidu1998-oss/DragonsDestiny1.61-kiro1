import React from 'react';
import Game from './components/Game';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex justify-center items-center overflow-hidden text-white">
      <Game />
    </div>
  );
};

export default App;