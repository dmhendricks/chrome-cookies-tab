import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

interface Props {
  widths: number[];
  onResize: (index: number, deltaPercent: number) => void;
}

export function Resizers({ widths, onResize }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById('content');
      if (el) setContainerWidth(el.clientWidth);
    };
    update();
    window.addEventListener('resize', update);
    const el = document.getElementById('content');
    const ro = el && 'ResizeObserver' in window ? new ResizeObserver(update) : null;
    if (ro && el) ro.observe(el);
    return () => {
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, []);

  // Lefts in pixels for each resizer (skip last column boundary).
  const lefts: number[] = [];
  let runningPercent = 0;
  for (let i = 0; i < widths.length - 1; i += 1) {
    runningPercent += widths[i] ?? 0;
    lefts.push((runningPercent / 100) * containerWidth);
  }

  const onPointerDown = useCallback(
    (index: number) => (e: PointerEvent) => {
      e.preventDefault();
      let lastX = e.clientX;
      const total = containerWidth || 1;

      const onMove = (ev: PointerEvent) => {
        const dxPx = ev.clientX - lastX;
        if (dxPx === 0) return;
        lastX = ev.clientX;
        const dxPercent = (dxPx / total) * 100;
        onResize(index, -dxPercent);
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [containerWidth, onResize],
  );

  return (
    <div ref={containerRef}>
      {lefts.map((left, i) => (
        <div
          key={i}
          className="resizer"
          style={{ left: `${left - 3}px` }}
          onPointerDown={onPointerDown(i)}
        />
      ))}
    </div>
  );
}
