"use client";
import { useRef, useCallback, useEffect } from "react";

const WORDS_PER_TICK = 3;

export function useTokenBuffer(onUpdate: (content: string) => void) {
  const bufferRef = useRef("");
  const accRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const drain = useCallback(() => {
    rafRef.current = null;

    if (bufferRef.current.length === 0) return;

    const buf = bufferRef.current;
    let end = 0;
    let spaces = 0;

    for (let i = 0; i < buf.length; i++) {
      if (buf[i] === " " || buf[i] === "\n") {
        spaces++;
        if (spaces >= WORDS_PER_TICK) {
          end = i + 1;
          break;
        }
      }
      end = i + 1;
    }

    const chunk = buf.slice(0, end);
    bufferRef.current = buf.slice(end);
    accRef.current += chunk;
    onUpdateRef.current(accRef.current);

    if (bufferRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(drain);
    }
  }, []);

  const push = useCallback(
    (token: string) => {
      bufferRef.current += token;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(drain);
      }
    },
    [drain],
  );

  const flush = useCallback((): string => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (bufferRef.current.length > 0) {
      accRef.current += bufferRef.current;
      bufferRef.current = "";
      onUpdateRef.current(accRef.current);
    }
    return accRef.current;
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    bufferRef.current = "";
    accRef.current = "";
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { push, flush, reset };
}
