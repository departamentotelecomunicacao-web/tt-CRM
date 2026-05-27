"use client";
import { useEffect, useMemo, useState } from "react";
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
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, Filter, Sparkles, Loader2 } from "lucide-react";
import { useApi, api } from "@/lib/swr";
import { useEventBus } from "@/components/providers/EventBus";
import { useToast } from "@/components/ui/Toast";
import { DealCard, type DealData } from "./DealCard";
import { DealDrawer } from "./DealDrawer";
import { NewDealModal } from "./NewDealModal";
import { brl, cn } from "@/lib/cn";

interface Stage { id: string; name: string; accent: string; hint?: string | null; order: number; isWon?: boolean; isLost?: boolean; }
interface Pipeline { id: string; name: string; stages: Stage[]; }

function Column({
  stage,
  deals,
  onOpen,
  onAdd,
}: {
  stage: Stage;
  deals: DealData[];
  onOpen: (id: string) => void;
  onAdd: (stageId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={cn("h-2.5 w-2.5 rounded-full bg-gradient-to-br", stage.accent)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-[13px] font-semibold uppercase tracking-wider text-primary">
              {stage.name}
            </h3>
            <span className="rounded-md border border-[rgb(var(--border-strong))] surface px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
              {deals.length}
            </span>
          </div>
          <div className="text-[11px] text-tertiary">{brl(total)}{stage.hint ? ` · ${stage.hint}` : ""}</div>
        </div>
        <button className="grid h-7 w-7 place-items-center rounded-md text-tertiary hover:surface hover:text-primary">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-2xl border border-[rgb(var(--border))] surface p-2 transition-colors",
          isOver && "border-[rgb(var(--accent)/0.50)] bg-[rgb(var(--accent)/0.05)]"
        )}
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} onOpen={onOpen} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-[rgb(var(--border-strong))] p-6 text-center">
            <div>
              <div className="text-xs text-tertiary">Solte cards aqui</div>
              <div className="mt-1 text-[10px] text-muted">ou arraste para mover</div>
            </div>
          </div>
        )}
        <button
          onClick={() => onAdd(stage.id)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[rgb(var(--border-strong))] py-2 text-xs text-tertiary hover:border-[rgb(var(--accent)/0.50)] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar negócio
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { data: pipelinesData } = useApi<{ pipelines: Pipeline[] }>("/api/pipelines");
  const pipeline = pipelinesData?.pipelines?.[0];
  const { data: dealsData, mutate, isLoading } = useApi<{ deals: DealData[] & { stageId: string; status: string }[] }>(
    pipeline ? `/api/deals?pipeline=${pipeline.id}` : null
  );
  const { subscribe } = useEventBus();
  const { push } = useToast();

  useEffect(() => {
    return subscribe((evt) => {
      if (evt.type?.startsWith("deal.")) mutate();
    });
  }, [subscribe, mutate]);

  // Optimistic state mirrors server data
  const [localDeals, setLocalDeals] = useState<any[] | null>(null);
  useEffect(() => {
    if (dealsData?.deals) setLocalDeals(dealsData.deals);
  }, [dealsData]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newDealStage, setNewDealStage] = useState<string | undefined>();
  const [newOpen, setNewOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const byStage = useMemo(() => {
    const map: Record<string, DealData[]> = {};
    if (!pipeline) return map;
    for (const s of pipeline.stages) map[s.id] = [];
    for (const d of (localDeals ?? []) as any[]) {
      if (d.status !== "open" && d.status !== "won") continue;
      if (!map[d.stageId]) map[d.stageId] = [];
      map[d.stageId].push(d);
    }
    return map;
  }, [localDeals, pipeline]);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || !localDeals || !pipeline) return;
    const activeDeal = localDeals.find((d: any) => d.id === active.id);
    if (!activeDeal) return;

    let toStageId: string | null = null;
    if (pipeline.stages.find((s) => s.id === over.id)) {
      toStageId = String(over.id);
    } else {
      const overDeal = localDeals.find((d: any) => d.id === over.id);
      if (overDeal) toStageId = overDeal.stageId;
    }
    if (!toStageId || toStageId === activeDeal.stageId) return;

    // Optimistic update
    setLocalDeals((cur) =>
      (cur ?? []).map((d) => (d.id === activeDeal.id ? { ...d, stageId: toStageId!, inStageAt: new Date().toISOString() } : d))
    );

    try {
      await api(`/api/deals/${activeDeal.id}`, {
        method: "PATCH",
        json: { stageId: toStageId },
      });
      const targetStage = pipeline.stages.find((s) => s.id === toStageId);
      push({ tone: "success", title: "Negócio movido", description: `→ ${targetStage?.name ?? "novo estágio"}` });
    } catch {
      push({ tone: "error", title: "Falha ao mover" });
      mutate();
    }
  }

  const active = (localDeals ?? []).find((d: any) => d.id === activeId) ?? null;

  const openDeals = (localDeals ?? []).filter((d: any) => d.status === "open");
  const totalPipeline = openDeals.reduce((a: number, d: any) => a + d.value, 0);
  const weighted = openDeals.reduce((a: number, d: any) => a + d.value * (d.probability / 100), 0);

  if (!pipeline) {
    return (
      <div className="grid h-60 place-items-center text-secondary">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium mb-4 flex flex-wrap items-center justify-between gap-3 p-3"
      >
        <div className="flex items-center gap-2">
          <select className="input !py-2 !text-xs" defaultValue={pipeline.id}>
            <option value={pipeline.id}>{pipeline.name}</option>
          </select>
          <button className="btn btn-ghost !py-2 text-xs">
            <Filter className="h-3.5 w-3.5" /> Filtros
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <div className="label">Pipeline total</div>
            <div className="font-display text-sm font-bold text-primary">{brl(totalPipeline)}</div>
          </div>
          <div className="hidden text-right md:block">
            <div className="label">Ponderado</div>
            <div className="font-display text-sm font-bold text-[rgb(var(--accent))]">{brl(weighted)}</div>
          </div>
          <button
            onClick={() => { setNewDealStage(undefined); setNewOpen(true); }}
            className="btn btn-primary text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Novo negócio
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
          <div className="flex gap-4 pb-4" style={{ minHeight: "calc(100vh - 300px)" }}>
            {pipeline.stages.filter((s) => !s.isLost).map((s) => (
              <Column
                key={s.id}
                stage={s}
                deals={byStage[s.id] ?? []}
                onOpen={setOpenId}
                onAdd={(stageId) => { setNewDealStage(stageId); setNewOpen(true); }}
              />
            ))}
          </div>
          <DragOverlay>
            {active && (
              <div className="w-[300px] rotate-2 opacity-95">
                <DealCard deal={active as any} onOpen={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {isLoading && (
        <div className="mt-2 flex items-center gap-2 text-xs text-tertiary">
          <Loader2 className="h-3 w-3 animate-spin" /> Carregando pipeline...
        </div>
      )}

      <DealDrawer dealId={openId} onClose={() => setOpenId(null)} onChange={() => mutate()} />
      <NewDealModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        pipelineId={pipeline.id}
        stageId={newDealStage}
        onCreated={() => mutate()}
      />
    </div>
  );
}
