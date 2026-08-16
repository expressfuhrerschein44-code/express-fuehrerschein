"use client";

/**
 * Express-Führerschein
 * Native pointer-based signature canvas.
 *
 * No additional signature dependency is required.
 *
 * Fix:
 * - the "Löschen" button now really clears the current drawing;
 * - clearing no longer depends on a canvas resize;
 * - mouse, touch and pen drawing remain supported.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Eraser,
  Loader2,
  PenLine,
  Save,
} from "lucide-react";

export interface SignatureCanvasProps {
  busy:
    boolean;

  onSave:
    (
      blob:
        Blob,
    ) =>
      Promise<boolean>;
}

export function SignatureCanvas({
  busy,

  onSave,
}: SignatureCanvasProps) {
  const canvasRef =
    useRef<HTMLCanvasElement>(
      null,
    );

  const drawingRef =
    useRef(
      false,
    );

  const lastPointRef =
    useRef<{
      x:
        number;

      y:
        number;
    } | null>(
      null,
    );

  const [
    hasInk,
    setHasInk,
  ] =
    useState(
      false,
    );

  /**
   * Configure the physical canvas for the current CSS size.
   *
   * Setting canvas.width / canvas.height resets the canvas, therefore this
   * function only does that when the actual dimensions changed.
   */
  const prepareCanvas =
    useCallback(
      () => {
        const canvas =
          canvasRef.current;

        if (
          !canvas
        ) {
          return;
        }

        const rect =
          canvas.getBoundingClientRect();

        const dpr =
          Math.min(
            window.devicePixelRatio ||
              1,
            2,
          );

        const width =
          Math.max(
            1,
            Math.round(
              rect.width *
                dpr,
            ),
          );

        const height =
          Math.max(
            1,
            Math.round(
              rect.height *
                dpr,
            ),
          );

        if (
          canvas.width ===
            width &&
          canvas.height ===
            height
        ) {
          return;
        }

        canvas.width =
          width;

        canvas.height =
          height;

        const context =
          canvas.getContext(
            "2d",
          );

        if (
          !context
        ) {
          return;
        }

        context.setTransform(
          dpr,
          0,
          0,
          dpr,
          0,
          0,
        );

        context.fillStyle =
          "#FFFFFF";

        context.fillRect(
          0,
          0,
          rect.width,
          rect.height,
        );

        context.lineCap =
          "round";

        context.lineJoin =
          "round";

        context.strokeStyle =
          "#101828";

        context.lineWidth =
          2.1;

        drawingRef.current =
          false;

        lastPointRef.current =
          null;

        setHasInk(
          false,
        );
      },
      [],
    );

  /**
   * Clear the existing drawing without requiring a resize.
   *
   * The previous implementation called prepareCanvas(), but prepareCanvas()
   * intentionally returns early when the canvas size has not changed. That
   * made the "Löschen" button appear to do nothing.
   */
  const clearCanvas =
    useCallback(
      () => {
        const canvas =
          canvasRef.current;

        if (
          !canvas
        ) {
          return;
        }

        const context =
          canvas.getContext(
            "2d",
          );

        if (
          !context
        ) {
          return;
        }

        context.save();

        context.setTransform(
          1,
          0,
          0,
          1,
          0,
          0,
        );

        context.clearRect(
          0,
          0,
          canvas.width,
          canvas.height,
        );

        context.fillStyle =
          "#FFFFFF";

        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height,
        );

        context.restore();

        drawingRef.current =
          false;

        lastPointRef.current =
          null;

        setHasInk(
          false,
        );
      },
      [],
    );

  useEffect(
    () => {
      prepareCanvas();

      const observer =
        new ResizeObserver(
          () => {
            prepareCanvas();
          },
        );

      const canvas =
        canvasRef.current;

      if (
        canvas
      ) {
        observer.observe(
          canvas,
        );
      }

      return () => {
        observer.disconnect();
      };
    },
    [
      prepareCanvas,
    ],
  );

  function pointFromEvent(
    event:
      React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas =
      canvasRef.current;

    if (
      !canvas
    ) {
      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };
  }

  function handlePointerDown(
    event:
      React.PointerEvent<HTMLCanvasElement>,
  ) {
    event.preventDefault();

    const canvas =
      canvasRef.current;

    const point =
      pointFromEvent(
        event,
      );

    if (
      !canvas ||
      !point
    ) {
      return;
    }

    drawingRef.current =
      true;

    lastPointRef.current =
      point;

    canvas.setPointerCapture(
      event.pointerId,
    );
  }

  function handlePointerMove(
    event:
      React.PointerEvent<HTMLCanvasElement>,
  ) {
    if (
      !drawingRef.current
    ) {
      return;
    }

    event.preventDefault();

    const canvas =
      canvasRef.current;

    const previous =
      lastPointRef.current;

    const point =
      pointFromEvent(
        event,
      );

    if (
      !canvas ||
      !previous ||
      !point
    ) {
      return;
    }

    const context =
      canvas.getContext(
        "2d",
      );

    if (
      !context
    ) {
      return;
    }

    context.beginPath();

    context.moveTo(
      previous.x,
      previous.y,
    );

    context.lineTo(
      point.x,
      point.y,
    );

    context.stroke();

    lastPointRef.current =
      point;

    setHasInk(
      true,
    );
  }

  function endDrawing(
    event:
      React.PointerEvent<HTMLCanvasElement>,
  ) {
    drawingRef.current =
      false;

    lastPointRef.current =
      null;

    const canvas =
      canvasRef.current;

    if (
      canvas?.hasPointerCapture(
        event.pointerId,
      )
    ) {
      canvas.releasePointerCapture(
        event.pointerId,
      );
    }
  }

  async function save() {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !hasInk ||
      busy
    ) {
      return;
    }

    const blob =
      await new Promise<Blob | null>(
        (
          resolve,
        ) => {
          canvas.toBlob(
            resolve,
            "image/png",
            1,
          );
        },
      );

    if (
      !blob
    ) {
      return;
    }

    await onSave(
      blob,
    );
  }

  return (
    <div className="rounded-xl border border-[#BFD6FF] bg-[#F8FBFF] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B63F6] text-white">
          <PenLine className="h-3.5 w-3.5" />
        </span>

        <div>
          <div className="text-[11px] font-extrabold text-[#15243A]">
            Unterschrift zeichnen
          </div>

          <div className="text-[9px] text-[#6E7D91]">
            Mit Maus, Finger oder Stift zeichnen.
          </div>
        </div>
      </div>

      <canvas
        ref={
          canvasRef
        }
        className="h-[118px] w-full touch-none rounded-lg border border-[#E4E9F0] bg-white"
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          endDrawing
        }
        onPointerCancel={
          endDrawing
        }
        onPointerLeave={
          (
            event,
          ) => {
            if (
              drawingRef.current &&
              event.buttons ===
                0
            ) {
              endDrawing(
                event,
              );
            }
          }
        }
      />

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          disabled={
            busy ||
            !hasInk
          }
          onClick={
            clearCanvas
          }
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[9px] font-extrabold text-[#69798D] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Eraser className="h-3.5 w-3.5" />
          Löschen
        </button>

        <button
          type="button"
          disabled={
            busy ||
            !hasInk
          }
          onClick={
            () =>
              void save()
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B63F6] px-3 py-1.5 text-[9px] font-extrabold text-white transition hover:bg-[#0757D8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}

          Speichern
        </button>
      </div>
    </div>
  );
}
