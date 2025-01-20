'use client';

import React, { useState } from 'react';
import { useEffect } from 'react';

interface Card {
  value: string;
  suit: string;
}

interface HandResult {
  pair: boolean;
  twoPair: boolean;
  threeOfAKind: boolean;
  straight: boolean;
  flush: boolean;
  fullHouse: boolean;
  fourOfAKind: boolean;
  straightFlush: boolean;
}

interface HandProbabilities {
  pair: number;
  twoPair: number;
  threeOfAKind: number;
  straight: number;
  flush: number;
  fullHouse: number;
  fourOfAKind: number;
  straightFlush: number;
}

const PokerCalculator = () => {
  useEffect(() => {
    document.body.classList.add('no-scroll');

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);
  
  const [selectedCards, setSelectedCards] = useState<(Card | null)[]>(Array(7).fill(null));
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const getNumericValue = (value: string): number => {
    const valueMap: Record<string, number> = {
      'A': 14, 'K': 13, 'Q': 12, 'J': 11,
      '10': 10, '9': 9, '8': 8, '7': 7,
      '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
    };
    return valueMap[value];
  };

  const calculateProbability = (): HandProbabilities | null => {
    const playerCards = selectedCards.slice(0, 2).filter((card): card is Card => card !== null);
    const communityCards = selectedCards.slice(2).filter((card): card is Card => card !== null);
    
    if (playerCards.length !== 2) return null;

    const usedCards = [...playerCards, ...communityCards].map(card => ({
      value: getNumericValue(card.value),
      suit: card.suit
    }));

    const remainingCards: { value: number; suit: string }[] = [];
    suits.forEach(suit => {
      values.forEach(value => {
        if (!usedCards.some(card => card.suit === suit && getNumericValue(value) === card.value)) {
          remainingCards.push({ value: getNumericValue(value), suit });
        }
      });
    });

    const cardsTocome = 5 - communityCards.length;
    if (cardsTocome === 0) {
      const finalHand = calculateFinalHand(usedCards);
      return {
        pair: finalHand.pair ? 1 : 0,
        twoPair: finalHand.twoPair ? 1 : 0,
        threeOfAKind: finalHand.threeOfAKind ? 1 : 0,
        straight: finalHand.straight ? 1 : 0,
        flush: finalHand.flush ? 1 : 0,
        fullHouse: finalHand.fullHouse ? 1 : 0,
        fourOfAKind: finalHand.fourOfAKind ? 1 : 0,
        straightFlush: finalHand.straightFlush ? 1 : 0
      };
    }

    const trials = 10000;
    const results: HandProbabilities = {
      pair: 0, twoPair: 0, threeOfAKind: 0, straight: 0,
      flush: 0, fullHouse: 0, fourOfAKind: 0, straightFlush: 0
    };

    for (let i = 0; i < trials; i++) {
      const shuffledRemaining = [...remainingCards].sort(() => Math.random() - 0.5);
      const simulatedCommunity = shuffledRemaining.slice(0, cardsTocome);
      const allCards = [...usedCards, ...simulatedCommunity];
      const handResult = calculateFinalHand(allCards);
      
      Object.entries(handResult).forEach(([hand, hasHand]) => {
        if (hasHand) {
          results[hand as keyof HandProbabilities]++;
        }
      });
    }

    // Calculate probabilities
    const probabilities: HandProbabilities = {
      pair: results.pair / trials,
      twoPair: results.twoPair / trials,
      threeOfAKind: results.threeOfAKind / trials,
      straight: results.straight / trials,
      flush: results.flush / trials,
      fullHouse: results.fullHouse / trials,
      fourOfAKind: results.fourOfAKind / trials,
      straightFlush: results.straightFlush / trials
    };

    return probabilities;
  };

  const calculateFinalHand = (cards: { value: number; suit: string }[]): HandResult => {
    const sortedCards = [...cards].sort((a, b) => b.value - a.value);
    const values = sortedCards.map(card => card.value);
    const suits = sortedCards.map(card => card.suit);

    const hasFlush = suits.some(suit => 
      suits.filter(s => s === suit).length >= 5
    );

    let hasStraight = false;
    for (let i = 0; i <= values.length - 5; i++) {
      if (values[i] - values[i + 4] === 4) {
        hasStraight = true;
        break;
      }
    }
    if (values.includes(14) && values.includes(2) && values.includes(3) && 
        values.includes(4) && values.includes(5)) {
      hasStraight = true;
    }

    const valueCounts: Record<number, number> = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const frequencies = Object.values(valueCounts).sort((a, b) => b - a);

    return {
      pair: frequencies[0] >= 2,
      twoPair: frequencies[0] >= 2 && frequencies[1] >= 2,
      threeOfAKind: frequencies[0] >= 3,
      straight: hasStraight,
      flush: hasFlush,
      fullHouse: frequencies[0] >= 3 && frequencies[1] >= 2,
      fourOfAKind: frequencies[0] >= 4,
      straightFlush: hasStraight && hasFlush
    };
  };

  const handleDragStart = (card: Card) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedCard) {
      const newSelectedCards = [...selectedCards];
      newSelectedCards[index] = draggedCard;
      setSelectedCards(newSelectedCards);
      setDraggedCard(null);
    }
  };

  const renderCard = (card: Card | null, isDraggable = true) => {
    const color = card?.suit === '♥' || card?.suit === '♦' ? 'text-red-500' : 'text-black';
    return (
      <div 
        className={`${color} bg-white rounded-lg shadow-md w-12 h-16 flex items-center justify-center text-lg border border-gray-300 
          ${isDraggable ? 'cursor-move hover:border-blue-500' : ''} transition-colors`}
        draggable={isDraggable}
        onDragStart={() => isDraggable && card && handleDragStart(card)}
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

  const renderDropZone = (index: number) => {
    return (
      <div
        className="w-12 h-16 rounded-lg bg-green-600 border border-green-500"
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(index)}
      >
        {selectedCards[index] && renderCard(selectedCards[index], false)}
      </div>
    );
  };

  const probabilities = calculateProbability();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto p-2">
        <div className="flex gap-4 h-full">
          <div className="flex-1">
            <div className="bg-green-700 p-4 rounded-xl mb-4 shadow-lg">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => renderDropZone(i + 2))}
                </div>

                <div className="flex space-x-4">
                  <div className="flex space-x-1">
                    {[...Array(2)].map((_, i) => renderDropZone(i))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 gap-2">
                {suits.map((suit) => (
                  <div key={suit}>
                    <h4 className="text-base font-semibold mb-1 text-center">{suit}</h4>
                    <div className="flex justify-center gap-1 flex-wrap">
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
                className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="w-80 shrink-0">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full overflow-y-auto max-h-[calc(100vh-2rem)]">
              <h3 className="text-white text-2xl font-semibold mb-6">Probabilities</h3>
              {probabilities ? (
                <div className="space-y-4">
                  {Object.entries(probabilities)
                    .sort(([, a], [, b]) => b - a)
                    .map(([hand, prob]) => (
                      <div key={hand} className="flex flex-col text-white">
                        <span className="capitalize text-gray-300 text-lg mb-1">
                          {hand.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${prob * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-right text-gray-300">
                          {(prob * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-400 text-lg">
                  Select your hole cards to see probabilities
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerCalculator;