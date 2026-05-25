"use client";

import { KeyboardEvent, useState } from "react";
import { Plus, Terminal, Users, X, Brain } from "lucide-react";

import { useUserStore } from "@/lib/store";

function SkillTag({
  skill,
  onRemove,
}: {
  skill: string;
  onRemove: (skill: string) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[var(--sb-hairline-strong)] bg-[var(--sb-surface-2)] px-2.5 py-1 font-mono text-[11px] text-foreground">
      {skill}
      <button
        type="button"
        onClick={() => onRemove(skill)}
        className="transition-colors hover:text-[var(--sb-red)]"
        aria-label={`Remove ${skill}`}
      >
        <X size={12} />
      </button>
    </span>
  );
}

function SkillRow({
  label,
  placeholder,
  icon: Icon,
  iconColor,
  skills,
  addSkill,
  removeSkill,
  withTopBorder = false,
}: {
  label: string;
  placeholder: string;
  icon: React.ElementType;
  iconColor: string;
  skills: string[];
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  withTopBorder?: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    addSkill(trimmed);
    setValue("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className={withTopBorder ? "border-t border-[var(--sb-hairline)] pt-6" : ""}>
      <div className="mb-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon size={18} color={iconColor} />
          {label}
        </label>
        <span className="font-mono text-[10px] text-muted-foreground">
          {skills.length} TAGS
        </span>
      </div>

      <div className="relative mb-3">
        <Plus
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[var(--sb-hairline)] bg-[var(--sb-canvas)] py-1.5 pl-9 pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--sb-indigo)]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillTag key={skill} skill={skill} onRemove={removeSkill} />
        ))}
      </div>
    </div>
  );
}

export function SkillTagInput() {
  const {
    skills,
    addSkill,
    removeSkill,
    softSkills,
    addSoftSkill,
    removeSoftSkill,
  } = useUserStore();

  return (
    <section className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] p-4">
      <div className="mb-8 flex items-center gap-2 border-b border-[var(--sb-hairline)] pb-3">
        <Brain size={20} color="var(--sb-emerald)" />
        <h3 className="text-lg font-semibold text-foreground">
          Skills Intelligence
        </h3>
      </div>

      <div className="space-y-6">
        <SkillRow
          label="Hard Skills"
          placeholder="Inject hard skill (e.g. Accounting, Python)..."
          icon={Terminal}
          iconColor="var(--sb-indigo)"
          skills={skills}
          addSkill={addSkill}
          removeSkill={removeSkill}
        />

        <SkillRow
          label="Soft Skills"
          placeholder="Inject soft skill (e.g. Ketelitian, Integrity)..."
          icon={Users}
          iconColor="var(--sb-amber)"
          skills={softSkills}
          addSkill={addSoftSkill}
          removeSkill={removeSoftSkill}
          withTopBorder
        />
      </div>
    </section>
  );
}
