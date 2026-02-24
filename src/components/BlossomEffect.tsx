import React, { useEffect, useState } from 'react';

const BlossomPetal = ({ delay, left, duration, size }: { delay: number; left: number; duration: number; size: number }) => {
  return (
    <div
      className="blossom-petal"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: `${size}px`,
        height: `${size}px`,
        background: 'radial-gradient(circle, #ffdeeb 0%, #fcc2d7 100%)',
        borderRadius: '50% 0 50% 50%',
        transform: 'rotate(45deg)',
      }}
    />
  );
};

export const BlossomEffect = () => {
  const [petals, setPetals] = useState<{ id: number; delay: number; left: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 10,
      left: Math.random() * 100,
      duration: 10 + Math.random() * 10,
      size: 10 + Math.random() * 15,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((petal) => (
        <BlossomPetal key={petal.id} {...petal} />
      ))}
    </div>
  );
};
