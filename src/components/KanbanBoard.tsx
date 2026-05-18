"use client";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, Filter, Sparkles } from "lucide-react";
import { DEALS, STAGES, type Deal, type Stage } from "@/lib/data";
import { DealCard } from "./DealCard";
import { DealDrawer } from "./DealDrawer";
import { brl, cn } from "@/lib/cn";

function Column({
  stage,
  deals,
  onOpen,
}: {
  stage: (typeof STAGES)[number];
  deals: Deal[];
  onOpen: (d: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={cn("h-2.5 w-2.5 rounded-full bg-gradient-to-br", stage.accent)} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[13px] font-semibold uppercase tracking-wider text-white">
              {stage.label}
            </h3>
            <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
              {deals.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">{brl(total)} · {stage.hint}</div>
        </div>
        <button className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-2 transition-colors",
          isOver && "border-cyan-400/40 bg-cyan-400/[0.04]"
        )}
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} onOpen={onOpen} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-white/10 p-6 text-center">
            <div>
              <div className="text-xs text-slate-400">Solte negócios aqui</div>
              <div className="mt-1 text-[10px] text-slate-500">ou arraste para mover</div>
            </div>
          </div>
        )}
        <button className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 py-2 text-xs text-slate-400 hover:border-cyan-400/40 hover:text-cyan-300">
          <Plus className="h-3.5 w-3.5" /> Adicionar negócio
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>(DEALS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const byStage = useMemo(() => {
    const map: Record<Stage, Deal[]> = {
      novo: [],
      qualificado: [],
      proposta: [],
      negociacao: [],
      fechamento: [],
      ganho: [],
      perdido: [],
    };
    deals.forEach((d) => map[d.stage].push(d));
    return map;
  }, [deals]);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeDeal = deals.find((d) => d.id === active.id);
    if (!activeDeal) return;

    // Drop into a column
    if (STAGES.find((s) => s.id === over.id)) {
      if (activeDeal.stage === over.id) return;
      setDeals((prev) =>
        prev.map((d) =>
          d.id === active.id ? { ...d, stage: over.id as Stage, inStageHours: 0 } : d
        )
      );
      return;
    }

    // Drop onto another card
    const overDeal = deals.find((d) => d.id === over.id);
    if (!overDeal) return;
    if (activeDeal.stage !== overDeal.stage) {
      setDeals((prev) =>
        prev.map((d) => (d.id === active.id ? { ...d, stage: overDeal.stage, inStageHours: 0 } : d))
      );
    } else {
      const list = deals.filter((d) => d.stage === activeDeal.stage);
      const oldIdx = list.findIndex((d) => d.id === active.id);
      const newIdx = list.findIndex((d) => d.id === over.id);
      const reordered = arrayMove(list, oldIdx, newIdx);
      const others = deals.filter((d) => d.stage !== activeDeal.stage);
      setDeals([...others, ...reordered]);
    }
  }

  const active = deals.find((d) => d.id === activeId) ?? null;
  const opened = deals.find((d) => d.id === openId) ?? null;

  const totalPipeline = deals.reduce((a, d) => a + d.value, 0);
  const weighted = deals.reduce((a, d) => a + d.value * (d.probability / 100), 0);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium mb-4 flex flex-wrap items-center justify-between gap-3 p-3"
      >
        <div className="flex items-center gap-2">
          <select className="input w-auto !py-2 !text-xs">
            <option>Pipeline principal</option>
            <option>Pipeline de pós-venda</option>
            <option>Renovações</option>
          </select>
          <button className="btn-ghost !py-2 text-xs">
            <Filter className="h-3.5 w-3.5" /> Filtros
          </button>
          <div className="flex -space-x-2">
            {["MA", "RS", "CM", "DL"].map((i, idx) => (
              <div
                key={i}
                style={{ zIndex: 10 - idx }}
                className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink-900 bg-gradient-to-br from-cyan-400 to-royal-600 text-[10px] font-bold text-white"
              >
                {i}
              </div>
            ))}
            <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink-900 bg-white/10 text-[10px] font-bold text-slate-200">
              +5
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Pipeline total</div>
            <div className="font-display text-sm font-bold text-white">{brl(totalPipeline)}</div>
          </div>
          <div className="hidden text-right md:block">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Ponderado</div>
            <div className="font-display text-sm font-bold text-cyan-300">{brl(weighted)}</div>
          </div>
          <button className="btn-primary text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Analisar pipeline
          </button>
        </div>
      </motion.div>

      <div className="-mx-6 overflow-x-auto px-6 scroll-thin lg:-mx-8 lg:px-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 pb-4" style={{ minHeight: "calc(100vh - 280px)" }}>
            {STAGES.map((s) => (
              <Column key={s.id} stage={s} deals={byStage[s.id]} onOpen={(d) => setOpenId(d.id)} />
            ))}
          </div>
          <DragOverlay>
            {active && (
              <div className="w-[300px] rotate-2 opacity-95">
                <DealCard deal={active} onOpen={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <DealDrawer deal={opened} open={!!opened} onClose={() => setOpenId(null)} />
    </div>
  );
}
