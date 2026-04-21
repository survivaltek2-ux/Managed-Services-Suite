import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Pen, Type, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePanelProps {
  onSignature: (dataUrl: string, mode: "draw" | "type") => void;
  onClear?: () => void;
  className?: string;
}

const SCRIPT_FONTS = [
  { label: "Cursive", style: "italic 42px 'Dancing Script', Georgia, serif" },
  { label: "Formal", style: "italic 38px 'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { label: "Script", style: "italic bold 36px Georgia, serif" },
];

export function SignaturePanel({ onSignature, onClear, className }: SignaturePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [fontIdx, setFontIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  function getCtx() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return { canvas, ctx };
  }

  function clearCanvas() {
    const r = getCtx();
    if (!r) return;
    r.ctx.clearRect(0, 0, r.canvas.width, r.canvas.height);
    setHasSignature(false);
    onClear?.();
  }

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    const me = e as React.MouseEvent;
    return { x: (me.clientX - rect.left) * scaleX, y: (me.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (mode !== "draw") return;
    e.preventDefault();
    setIsDrawing(true);
    lastPoint.current = getPos(e);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || mode !== "draw") return;
    e.preventDefault();
    const r = getCtx();
    if (!r) return;
    const pos = getPos(e);
    const prev = lastPoint.current!;
    r.ctx.beginPath();
    r.ctx.moveTo(prev.x, prev.y);
    r.ctx.lineTo(pos.x, pos.y);
    r.ctx.strokeStyle = "#032d60";
    r.ctx.lineWidth = 2.5;
    r.ctx.lineCap = "round";
    r.ctx.lineJoin = "round";
    r.ctx.stroke();
    lastPoint.current = pos;
    if (!hasSignature) setHasSignature(true);
  }

  function endDraw() {
    setIsDrawing(false);
    lastPoint.current = null;
  }

  function renderTyped(name: string, fIdx: number) {
    const r = getCtx();
    if (!r) return;
    r.ctx.clearRect(0, 0, r.canvas.width, r.canvas.height);
    if (!name.trim()) { setHasSignature(false); return; }
    r.ctx.font = SCRIPT_FONTS[fIdx].style;
    r.ctx.fillStyle = "#032d60";
    r.ctx.textAlign = "center";
    r.ctx.textBaseline = "middle";
    r.ctx.fillText(name, r.canvas.width / 2, r.canvas.height / 2);
    setHasSignature(true);
  }

  useEffect(() => {
    if (mode === "type") renderTyped(typedName, fontIdx);
  }, [typedName, fontIdx, mode]);

  function handleModeSwitch(newMode: "draw" | "type") {
    setMode(newMode);
    setHasSignature(false);
    const r = getCtx();
    if (r) r.ctx.clearRect(0, 0, r.canvas.width, r.canvas.height);
    if (newMode === "type" && typedName) renderTyped(typedName, fontIdx);
  }

  function getSignatureDataUrl(): string | null {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return null;
    return canvas.toDataURL("image/png");
  }

  function handleConfirm() {
    const url = getSignatureDataUrl();
    if (url) onSignature(url, mode);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Mode Toggle */}
      <div className="flex gap-1 bg-muted rounded-md p-0.5 w-fit">
        <button onClick={() => handleModeSwitch("draw")}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all",
            mode === "draw" ? "bg-white shadow-sm text-[#032d60]" : "text-muted-foreground hover:text-foreground")}>
          <Pen className="w-3.5 h-3.5" /> Draw
        </button>
        <button onClick={() => handleModeSwitch("type")}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all",
            mode === "type" ? "bg-white shadow-sm text-[#032d60]" : "text-muted-foreground hover:text-foreground")}>
          <Type className="w-3.5 h-3.5" /> Type
        </button>
      </div>

      {/* Canvas */}
      <div className="relative border-2 border-border rounded-lg overflow-hidden bg-white" style={{ touchAction: "none" }}>
        <canvas
          ref={canvasRef}
          width={500}
          height={140}
          className="w-full block cursor-crosshair"
          style={{ touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-sm">
              {mode === "draw" ? "Draw your signature above" : "Type your name above to preview"}
            </p>
          </div>
        )}
        <div className="absolute bottom-0 left-6 right-6 h-px bg-muted-foreground/30" />
      </div>

      {/* Type mode controls */}
      {mode === "type" && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Your Name</Label>
            <Input
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              placeholder="Type your full name"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            {SCRIPT_FONTS.map((f, i) => (
              <button key={i} onClick={() => setFontIdx(i)}
                className={cn("px-3 py-1 text-xs rounded border transition-colors",
                  fontIdx === i ? "border-[#0176d3] bg-[#0176d3]/5 text-[#0176d3]" : "border-border text-muted-foreground hover:border-foreground")}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button onClick={handleConfirm} disabled={!hasSignature} className="bg-[#032d60] hover:bg-[#0176d3] text-white">
          Use This Signature
        </Button>
        <Button variant="ghost" size="sm" onClick={() => {
          clearCanvas();
          if (mode === "type") setTypedName("");
        }}>
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
        </Button>
      </div>
    </div>
  );
}
