import { PageHeader } from "@/components/PageHeader";
import { KanbanBoard } from "@/components/KanbanBoard";

export default function PipelinePage() {
  return (
    <div className="mx-auto max-w-[1700px]">
      <PageHeader
        eyebrow="CRM Kanban"
        title="Pipeline comercial"
        description="Arraste cards entre etapas, acompanhe SLA em tempo real e tome decisões com apoio do copiloto IA."
      />
      <KanbanBoard />
    </div>
  );
}
