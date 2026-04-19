import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DraftFile {
  path: string;
  content: string;
  modified: boolean;
}

interface SkillFileTreeProps {
  files: Record<string, DraftFile>;
  activeFile: string;
  onSelectFile: (path: string) => void;
  onAddFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
}

export function SkillFileTree({ files, activeFile, onSelectFile, onAddFile, onDeleteFile }: SkillFileTreeProps) {
  const sortedPaths = useMemo(() => Object.keys(files).sort((a, b) => a.localeCompare(b)), [files]);

  const createNewFile = () => {
    const path = window.prompt("New file path (e.g. references/rubric.md)", "references/new.md");
    if (!path) return;
    onAddFile(path.trim());
  };

  return (
    <div className="border border-border rounded-md p-2 flex flex-col gap-2">
      <div className="text-xs font-medium text-muted-foreground px-1">Files</div>
      <div className="flex flex-col gap-1">
        {sortedPaths.map((filePath) => {
          const file = files[filePath];
          return (
            <div
              key={filePath}
              className={cn(
                "group flex items-center justify-between rounded px-2 py-1 text-xs cursor-pointer",
                activeFile === filePath ? "bg-accent text-foreground" : "hover:bg-accent/60 text-muted-foreground",
              )}
              onClick={() => onSelectFile(filePath)}
            >
              <span className="truncate">{filePath}</span>
              <div className="flex items-center gap-1">
                {file?.modified ? <span className="text-blue-500">*</span> : null}
                {filePath !== "SKILL.md" ? (
                  <button
                    className="opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteFile(filePath);
                    }}
                    title="Delete file"
                  >
                    x
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <Button variant="outline" size="sm" onClick={createNewFile}>+ New File</Button>
    </div>
  );
}
