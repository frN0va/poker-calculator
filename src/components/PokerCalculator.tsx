'use client';

import React, { useState } from 'react';

const PokerCalculator = () => {
  const [selectedCards, setSelectedCards] = useState(Array(7).fill(null)); // 2 player cards + 5 community cards
  const [draggedCard, setDraggedCard] = useState(null);
  
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const calculateProbability = () => {
    const playerCards = selectedCards.slice(0, 2).filter(card => card !== null);
    if (playerCards.length === 2) {
      return {
        pair: 0.4,
        twoPair: 0.25,
        threeOfAKind: 0.15,
        straight: 0.10,
        flush: 0.08,
        fullHouse: 0.02,
      };
    }
    return null;
  };

  const handleDragStart = (card) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedCard) {
      const newSelectedCards = [...selectedCards];
      newSelectedCards[index] = draggedCard;
      setSelectedCards(newSelectedCards);
      setDraggedCard(null);
    }
  };

  const renderCard = (card, isDraggable = true) => {
    const color = card?.suit === '♥' || card?.suit === '♦' ? 'text-red-500' : 'text-black';
    return (
      <div 
        className={`${color} bg-white rounded-lg shadow-md w-16 h-24 flex items-center justify-center text-2xl border-2 border-gray-300 
          ${isDraggable ? 'cursor-move hover:border-blue-500' : ''} transition-colors`}
        draggable={isDraggable}
        onDragStart={() => isDraggable && handleDragStart(card)}
      >
        {card && (
          <div className="flex flex-col items-center">
            <span>{card.value}</span>
            <span>{card.suit}</span>
          </div>
        )}
      </div>
    );
  };

  const renderDropZone = (index) => {
    return (
      <div
        className="w-16 h-24 rounded-lg bg-green-600 border-2 border-green-500"
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(index)}
      >
        {selectedCards[index] && renderCard(selectedCards[index], false)}
      </div>
    );
  };

  const probabilities = calculateProbability();

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Poker Table */}
      <div className="bg-green-700 p-8 rounded-xl mb-8 shadow-lg">
        <div className="flex flex-col items-center space-y-8">
          {/* Community Cards */}
          <div className="flex space-x-2 mb-8">
            {[...Array(5)].map((_, i) => renderDropZone(i + 2))}
          </div>

          {/* Player Cards */}
          <div className="flex space-x-4">
            <div className="flex space-x-2">
              {[...Array(2)].map((_, i) => renderDropZone(i))}
            </div>
          </div>

          {/* Probabilities */}
          {probabilities && (
            <div className="bg-white/10 p-4 rounded-lg w-full mt-4">
              <h3 className="text-white text-lg font-semibold mb-2">Hand Probabilities</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(probabilities).map(([hand, prob]) => (
                  <div key={hand} className="flex justify-between text-white">
                    <span className="capitalize">{hand.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span>{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Grid */}
<div className="bg-gray-100 p-4 rounded-xl shadow-lg">
  <div className="grid grid-cols-1 gap-4">
    {suits.map((suit) => (
      <div key={suit}>
        <h4 className="text-lg font-semibold mb-2 text-center">{suit}</h4>
        <div className="flex justify-center space-x-2">
          {values.map((value) => (
            <div key={`${value}${suit}`}>
              {renderCard({ value, suit })}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
  <button
    onClick={() => setSelectedCards(Array(7).fill(null))}
    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
  >
    Reset
  </button>
</div>

    </div>
  );
};

export default PokerCalculator;