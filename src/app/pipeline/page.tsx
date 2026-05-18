import { PageHeader } from "@/components/ui/PageHeader";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";

export default function PipelinePage() {
  return (
    <div className="mx-auto max-w-[1700px]">
      <PageHeader
        eyebrow="Pipeline Kanban"
        title="Operação comercial"
        description="Arraste cards entre estágios. Cada movimentação dispara automações, registra auditoria e atualiza o forecast."
      />
      <KanbanBoard />
    </div>
  );
}
