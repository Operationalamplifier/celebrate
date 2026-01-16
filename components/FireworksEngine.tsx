import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Coordinate } from '../types';

export interface FireworksEngineRef {
  launch: (count?: number) => void;
  launchAt: (x: number, y: number) => void;
}

const FireworksEngine = forwardRef<FireworksEngineRef, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // State refs to avoid re-renders during animation loop
  const fireworksRef = useRef<any[]>([]);
  const particlesRef = useRef<any[]>([]);
  
  // Configuration
  const hueRef = useRef(120);
  const limiterTotalRef = useRef(5);
  const limiterTickRef = useRef(0);

  // Helper: Random number
  const random = (min: number, max: number) => Math.random() * (max - min) + min;

  // Helper: Calculate distance
  const calculateDistance = (p1x: number, p1y: number, p2x: number, p2y: number) => {
    const xDistance = p1x - p2x;
    const yDistance = p1y - p2y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  };

  // Class: Firework (The rocket going up)
  class Firework {
    x: number;
    y: number;
    sx: number;
    sy: number;
    tx: number;
    ty: number;
    distanceToTarget: number;
    distanceTraveled: number;
    coordinates: Coordinate[];
    coordinateCount: number;
    angle: number;
    speed: number;
    acceleration: number;
    brightness: number;
    targetRadius: number;
    hue: number;

    constructor(sx: number, sy: number, tx: number, ty: number) {
      this.x = sx;
      this.y = sy;
      this.sx = sx;
      this.sy = sy;
      this.tx = tx;
      this.ty = ty;
      this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
      this.distanceTraveled = 0;
      this.coordinates = [];
      this.coordinateCount = 3;
      while (this.coordinateCount--) {
        this.coordinates.push({ x: this.x, y: this.y });
      }
      this.angle = Math.atan2(ty - sy, tx - sx);
      this.speed = 2;
      this.acceleration = 1.05;
      this.brightness = random(50, 70);
      this.targetRadius = 1;
      this.hue = hueRef.current;
    }

    update(index: number) {
      this.coordinates.pop();
      this.coordinates.unshift({ x: this.x, y: this.y });

      if (this.targetRadius < 8) {
        this.targetRadius += 0.3;
      } else {
        this.targetRadius = 1;
      }

      this.speed *= this.acceleration;
      const vx = Math.cos(this.angle) * this.speed;
      const vy = Math.sin(this.angle) * this.speed;
      
      this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

      if (this.distanceTraveled >= this.distanceToTarget) {
        createParticles(this.tx, this.ty, this.hue);
        fireworksRef.current.splice(index, 1);
      } else {
        this.x += vx;
        this.y += vy;
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1].x, this.coordinates[this.coordinates.length - 1].y);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Class: Particle (The explosion)
  class Particle {
    x: number;
    y: number;
    coordinates: Coordinate[];
    coordinateCount: number;
    angle: number;
    speed: number;
    friction: number;
    gravity: number;
    hue: number;
    brightness: number;
    alpha: number;
    decay: number;

    constructor(x: number, y: number, hue: number) {
      this.x = x;
      this.y = y;
      this.coordinates = [];
      this.coordinateCount = 5;
      while (this.coordinateCount--) {
        this.coordinates.push({ x: this.x, y: this.y });
      }
      this.angle = random(0, Math.PI * 2);
      this.speed = random(1, 10);
      this.friction = 0.95;
      this.gravity = 1;
      this.hue = random(hue - 50, hue + 50);
      this.brightness = random(50, 80);
      this.alpha = 1;
      this.decay = random(0.015, 0.03);
    }

    update(index: number) {
      this.coordinates.pop();
      this.coordinates.unshift({ x: this.x, y: this.y });
      this.speed *= this.friction;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.alpha -= this.decay;

      if (this.alpha <= this.decay) {
        particlesRef.current.splice(index, 1);
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1].x, this.coordinates[this.coordinates.length - 1].y);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
      ctx.stroke();
    }
  }

  const createParticles = (x: number, y: number, hue: number) => {
    let particleCount = 30;
    while (particleCount--) {
      particlesRef.current.push(new Particle(x, y, hue));
    }
  };

  const createFirework = (sx: number, sy: number, tx: number, ty: number) => {
    fireworksRef.current.push(new Firework(sx, sy, tx, ty));
  };

  // The main loop
  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trail effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalCompositeOperation = 'lighter';

    // Loop fireworks
    let i = fireworksRef.current.length;
    while (i--) {
      fireworksRef.current[i].draw(ctx);
      fireworksRef.current[i].update(i);
    }

    // Loop particles
    let j = particlesRef.current.length;
    while (j--) {
      particlesRef.current[j].draw(ctx);
      particlesRef.current[j].update(j);
    }

    // Cycle hue
    hueRef.current += 0.5;

    animationRef.current = requestAnimationFrame(loop);
  };

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Start loop
    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External Control Methods
  useImperativeHandle(ref, () => ({
    launch: (count = 1) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      
      for(let i=0; i<count; i++) {
        setTimeout(() => {
            // Random start x (bottom), random target
            const startX = w / 2;
            const startY = h;
            const targetX = random(0, w);
            const targetY = random(0, h / 2);
            createFirework(startX, startY, targetX, targetY);
        }, i * 200);
      }
    },
    launchAt: (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const h = canvas.height;
        // Launch from bottom center to specific click point
        createFirework(canvas.width / 2, h, x, y);
    }
  }));

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if(!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      createFirework(canvas.width / 2, canvas.height, x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full cursor-crosshair block"
      onClick={handleCanvasClick}
    />
  );
});

FireworksEngine.displayName = "FireworksEngine";

export default FireworksEngine;