
import { useEffect, useRef } from 'react';

const INITIAL_OBJECTS = [
  {
    id: 'react',
    label: 'React',
    x: 0.1,
    y: 0.22,
    width: 104,
    height: 104,
    className: 'text-cyan-300',
    content: '⚛️',
    subtitle: 'React',
  },
  {
    id: 'bug',
    label: 'Bug',
    x: 0.78,
    y: 0.16,
    width: 92,
    height: 92,
    className: 'text-orange-300',
    content: '🐛',
    subtitle: 'Bug hunter',
  },
  {
    id: 'code',
    label: 'Code',
    x: 0.08,
    y: 0.48,
    width: 132,
    height: 78,
    className: 'text-violet-300',
    content: '</>',
    subtitle: 'Ship it',
  },
  {
    id: 'coffee',
    label: 'Coffee',
    x: 0.76,
    y: 0.66,
    width: 100,
    height: 100,
    className: 'text-amber-300',
    content: '☕',
    subtitle: 'Refuel',
  },
  {
    id: 'php',
    label: 'PHP',
    x: 0.12,
    y: 0.74,
    width: 116,
    height: 72,
    className: 'text-indigo-300',
    content: 'PHP',
    subtitle: 'Backend',
  },
];

const GRAVITY = 0;
const FRICTION = 0.997;
const BOUNCE = 0.82;
const MAX_SPEED = 2400;

export default function PhysicsPlayground() {
  const objectRefs = useRef(new Map());
  const bodiesRef = useRef(new Map());
  const frameRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const bodies = new Map();

    INITIAL_OBJECTS.forEach((item) => {
      const element = objectRefs.current.get(item.id);

      if (!element) return;

      const width = item.width;
      const height = item.height;

      bodies.set(item.id, {
        ...item,
        x: Math.max(
          0,
          Math.min(
            window.innerWidth - width,
            item.x * window.innerWidth
          )
        ),
        y: Math.max(
          0,
          Math.min(
            window.innerHeight - height,
            item.y * window.innerHeight
          )
        ),
        vx: 0,
        vy: 0,
        width,
        height,
        dragging: false,
        offsetX: 0,
        offsetY: 0,
        lastPointerX: 0,
        lastPointerY: 0,
        lastPointerTime: 0,
      });
    });

    bodiesRef.current = bodies;

    const renderBody = (body) => {
      const element = objectRefs.current.get(body.id);

      if (!element) return;

      element.style.transform =
        `translate3d(${body.x}px, ${body.y}px, 0)`;
    };

    bodies.forEach(renderBody);

    let previousTime = 0;

    const animate = (time) => {
      if (!previousTime) previousTime = time;

      // Limit large time steps after a background-tab pause.
      const dt = Math.min((time - previousTime) / 1000, 0.032);
      previousTime = time;

      bodies.forEach((body) => {
        if (body.dragging) return;

        if (prefersReducedMotion) {
          body.vx = 0;
          body.vy = 0;
          return;
        }

        body.vy += GRAVITY * dt;

        body.x += body.vx * dt;
        body.y += body.vy * dt;

        const maxX = Math.max(0, window.innerWidth - body.width);
        const maxY = Math.max(0, window.innerHeight - body.height);

        if (body.x < 0) {
          body.x = 0;
          body.vx = Math.abs(body.vx) * BOUNCE;
        } else if (body.x > maxX) {
          body.x = maxX;
          body.vx = -Math.abs(body.vx) * BOUNCE;
        }

        if (body.y < 0) {
          body.y = 0;
          body.vy = Math.abs(body.vy) * BOUNCE;
        } else if (body.y > maxY) {
          body.y = maxY;
          body.vy = -Math.abs(body.vy) * BOUNCE;
        }

        // Slow objects down naturally.
        const damping = Math.pow(FRICTION, dt * 60);

        body.vx *= damping;
        body.vy *= damping;

        if (Math.abs(body.vx) < 2) body.vx = 0;
        if (Math.abs(body.vy) < 2) body.vy = 0;

        renderBody(body);
      });

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      bodiesRef.current.clear();
    };
  }, []);

  const handlePointerDown = (event, id) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;

    const body = bodiesRef.current.get(id);

    if (!body) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    body.dragging = true;
    body.offsetX = event.clientX - body.x;
    body.offsetY = event.clientY - body.y;
    body.lastPointerX = event.clientX;
    body.lastPointerY = event.clientY;
    body.lastPointerTime = event.timeStamp;
    body.vx = 0;
    body.vy = 0;
  };

  const handlePointerMove = (event, id) => {
    const body = bodiesRef.current.get(id);

    if (!body?.dragging) return;

    const elapsed = Math.max(
      (event.timeStamp - body.lastPointerTime) / 1000,
      0.001
    );

    const dx = event.clientX - body.lastPointerX;
    const dy = event.clientY - body.lastPointerY;

    body.vx = Math.max(
      -MAX_SPEED,
      Math.min(MAX_SPEED, (dx / elapsed) * 0.85)
    );

    body.vy = Math.max(
      -MAX_SPEED,
      Math.min(MAX_SPEED, (dy / elapsed) * 0.85)
    );

    body.x = Math.max(
      0,
      Math.min(window.innerWidth - body.width, event.clientX - body.offsetX)
    );

    body.y = Math.max(
      0,
      Math.min(window.innerHeight - body.height, event.clientY - body.offsetY)
    );

    body.lastPointerX = event.clientX;
    body.lastPointerY = event.clientY;
    body.lastPointerTime = event.timeStamp;

    const element = objectRefs.current.get(id);

    if (element) {
      element.style.transform =
        `translate3d(${body.x}px, ${body.y}px, 0)`;
    }
  };

  const handlePointerUp = (id) => {
    const body = bodiesRef.current.get(id);

    if (body) body.dragging = false;
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 hidden overflow-hidden lg:block"
      aria-label="Interactive physics playground"
    >
      {INITIAL_OBJECTS.map((item) => (
        <div
          key={item.id}
          ref={(element) => {
            if (element) {
              objectRefs.current.set(item.id, element);
            } else {
              objectRefs.current.delete(item.id);
            }
          }}
          role="img"
          aria-label={`${item.label}. Drag to move and throw.`}
          title="Drag me and throw me!"
          onPointerDown={(event) => handlePointerDown(event, item.id)}
          onPointerMove={(event) => handlePointerMove(event, item.id)}
          onPointerUp={() => handlePointerUp(item.id)}
          onPointerCancel={() => handlePointerUp(item.id)}
          className={[
            'pointer-events-auto absolute left-0 top-0',
            'flex cursor-grab touch-none select-none flex-col',
            'items-center justify-center gap-1',
            'active:cursor-grabbing',
            item.className,
          ].join(' ')}
          style={{
            width: item.width,
            height: item.height,
            willChange: 'transform',
          }}
        >
          <span className="text-2xl font-bold">{item.content}</span>
          <span className="text-xs font-medium">{item.subtitle}</span>
        </div>
      ))}
    </div>
  );
}
