"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  IconDotsVertical,
  IconLoader2,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

const MENU_WIDTH = 176;

export function AdminTableRowMenu({
  onEdit,
  onDelete,
  deleting,
  deleteLabel = "Delete",
}: {
  onEdit?: () => void;
  onDelete: () => void;
  deleting?: boolean;
  deleteLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const positionMenu = useCallback(() => {
    const wrap = anchorRef.current;
    const menu = menuRef.current;
    if (!wrap || !menu) return;
    const btn = wrap.querySelector("button");
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, r.right - MENU_WIDTH),
      typeof window !== "undefined"
        ? window.innerWidth - MENU_WIDTH - 8
        : r.right - MENU_WIDTH
    );
    menu.style.top = `${r.bottom + 6}px`;
    menu.style.left = `${left}px`;
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    positionMenu();
    window.addEventListener("scroll", positionMenu, true);
    window.addEventListener("resize", positionMenu);
    return () => {
      window.removeEventListener("scroll", positionMenu, true);
      window.removeEventListener("resize", positionMenu);
    };
  }, [open, positionMenu]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const portal =
    open && typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[80] cursor-default"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[90] w-44 rounded-lg border border-[#E5E2DC] bg-white py-1 shadow-lg"
              style={{ top: 0, left: 0 }}
            >
              {onEdit ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-[#F5F3F0]"
                >
                  <IconPencil size={16} stroke={1.5} />
                  Edit
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onDelete();
                }}
                disabled={deleting}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconTrash size={16} stroke={1.5} />
                )}
                {deleteLabel}
              </button>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <div
      ref={anchorRef}
      className="relative inline-block text-right"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded p-1.5 text-[#999] hover:bg-[#F5F3F0] hover:text-[#1A1A1A]"
        aria-label="Row actions"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <IconDotsVertical size={18} stroke={1.5} />
      </button>
      {portal}
    </div>
  );
}
