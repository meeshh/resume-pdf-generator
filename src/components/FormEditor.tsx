import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useForm } from "@tanstack/react-form";
import {
  Briefcase,
  GraduationCap,
  GripVertical,
  Languages,
  Plus,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import { memo, useEffect } from "react";
import { useResumeStore } from "../store/useResumeStore";
import type { ResumeData } from "../types/ResumeData";

// Stable Sortable Item Component
interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
  className?: string;
}

function SortableItem({
  id,
  children,
  onRemove,
  className,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-surface-bg border border-border-base rounded p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700 ${isDragging ? "opacity-50 ring-2 ring-emerald-500/20 shadow-2xl z-50" : "opacity-100"} ${className}`}
    >
      <div className="flex gap-4">
        {/* Handle */}
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-main p-1 flex items-center touch-none transition-colors"
        >
          <GripVertical size={18} />
        </div>

        <div className="flex-1 space-y-4">{children}</div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          className="text-text-muted hover:text-red-500 transition-colors p-1 self-start cursor-pointer"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

function FormEditorComponent() {
  const { data, setData, reorderArray } = useResumeStore();

  const form = useForm({
    defaultValues: data,
    onSubmit: async ({ value }) => {
      setData(value);
    },
  });

  // Sync form when store data changes (e.g. from Source Code, AI, or Undo/Redo)
  useEffect(() => {
    // Check if form values actually differ from store data before resetting
    // to avoid unnecessary re-renders and potential cursor jumps
    const currentValues = JSON.stringify(form.state.values);
    const storeValues = JSON.stringify(data);

    if (currentValues !== storeValues) {
      form.reset(data);
    }
  }, [data, form.reset, form.state.values]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleUpdate = () => {
    setData(form.state.values);
  };

  const handleDragStart = (_event: DragStartEvent) => {
    // No-op
  };

  const handleDragEnd = (event: DragEndEvent, fieldName: keyof ResumeData) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      console.log(`Reordering ${fieldName}: ${active.id} -> ${over.id}`);
      reorderArray(fieldName, active.id as string, over.id as string);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-app-bg text-text-main p-6 space-y-8 custom-scrollbar pb-32 transition-colors duration-300">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        autoComplete="off"
      >
        {/* Personal Info Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 border-b border-border-base pb-2">
            <User size={18} />
            <h3 className="font-black text-xs uppercase tracking-widest">
              Personal Information
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="personal.firstName">
              {(field) => (
                <div className="space-y-1">
                  <label
                    htmlFor={field.name}
                    className="text-[10px] font-bold text-text-muted uppercase"
                  >
                    First Name
                  </label>
                  <input
                    id={field.name}
                    value={field.state.value ?? ""}
                    autoComplete="off"
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      handleUpdate();
                    }}
                    className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="personal.lastName">
              {(field) => (
                <div className="space-y-1">
                  <label
                    htmlFor={field.name}
                    className="text-[10px] font-bold text-text-muted uppercase"
                  >
                    Last Name
                  </label>
                  <input
                    id={field.name}
                    value={field.state.value ?? ""}
                    autoComplete="off"
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      handleUpdate();
                    }}
                    className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="personal.title">
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="text-[10px] font-bold text-text-muted uppercase"
                >
                  Professional Title
                </label>
                <input
                  id={field.name}
                  value={field.state.value ?? ""}
                  autoComplete="off"
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    handleUpdate();
                  }}
                  className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="personal.summary">
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor={field.name}
                  className="text-[10px] font-bold text-text-muted uppercase"
                >
                  Summary (HTML supported)
                </label>
                <textarea
                  id={field.name}
                  value={field.state.value ?? ""}
                  autoComplete="off"
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    handleUpdate();
                  }}
                  className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none transition-all min-h-[100px] resize-y"
                />
              </div>
            )}
          </form.Field>
        </section>

        {/* Experience Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-border-base pb-2">
            <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
              <Briefcase size={18} />
              <h3 className="font-black text-xs uppercase tracking-widest">
                Work Experience
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                const id = `exp-${Math.random().toString(36).substr(2, 9)}`;
                const newItems = [
                  ...data.professionalExperiences,
                  {
                    id,
                    title: "New Position",
                    organization: "Company",
                    startDate: "Jan 2024",
                    body: "Bullet points here",
                  },
                ];
                setData({ ...data, professionalExperiences: newItems });
              }}
              className="cursor-pointer flex items-center gap-1 bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded text-[10px] font-bold hover:bg-emerald-600/30 transition-colors"
            >
              <Plus size={12} /> ADD
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={(e) => handleDragEnd(e, "professionalExperiences")}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={data.professionalExperiences.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {data.professionalExperiences.map((exp, i) => (
                  <SortableItem
                    key={exp.id}
                    id={exp.id}
                    onRemove={() =>
                      setData({
                        ...data,
                        professionalExperiences:
                          data.professionalExperiences.filter(
                            (item) => item.id !== exp.id,
                          ),
                      })
                    }
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <form.Field name={`professionalExperiences[${i}].title`}>
                        {(field) => (
                          <div className="space-y-1">
                            <label
                              htmlFor={field.name}
                              className="text-[10px] font-bold text-text-muted uppercase"
                            >
                              Job Title
                            </label>
                            <input
                              id={field.name}
                              value={field.state.value ?? ""}
                              autoComplete="off"
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                                handleUpdate();
                              }}
                              className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none"
                            />
                          </div>
                        )}
                      </form.Field>
                      <form.Field
                        name={`professionalExperiences[${i}].organization`}
                      >
                        {(field) => (
                          <div className="space-y-1">
                            <label
                              htmlFor={field.name}
                              className="text-[10px] font-bold text-text-muted uppercase"
                            >
                              Organization
                            </label>
                            <input
                              id={field.name}
                              value={field.state.value ?? ""}
                              autoComplete="off"
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                                handleUpdate();
                              }}
                              className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none"
                            />
                          </div>
                        )}
                      </form.Field>
                    </div>
                    <form.Field name={`professionalExperiences[${i}].body`}>
                      {(field) => (
                        <div className="space-y-1">
                          <label
                            htmlFor={field.name}
                            className="text-[10px] font-bold text-text-muted uppercase"
                          >
                            Description (HTML)
                          </label>
                          <textarea
                            id={field.name}
                            value={field.state.value ?? ""}
                            autoComplete="off"
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              handleUpdate();
                            }}
                            className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none min-h-[80px]"
                          />
                        </div>
                      )}
                    </form.Field>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        {/* Skills Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-border-base pb-2">
            <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
              <Settings size={18} />
              <h3 className="font-black text-xs uppercase tracking-widest">
                Technical Skills
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                const id = `skill-${Math.random().toString(36).substr(2, 9)}`;
                const newItems = [
                  ...data.techSkills,
                  { id, name: "New Skill", knowledge: 80 },
                ];
                setData({ ...data, techSkills: newItems });
              }}
              className="cursor-pointer flex items-center gap-1 bg-purple-600/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-[10px] font-bold hover:bg-purple-600/30 transition-colors"
            >
              <Plus size={12} /> ADD
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={(e) => handleDragEnd(e, "techSkills")}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={data.techSkills.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-3">
                {data.techSkills.map((skill, i) => (
                  <SortableItem
                    key={skill.id}
                    id={skill.id}
                    onRemove={() =>
                      setData({
                        ...data,
                        techSkills: data.techSkills.filter(
                          (item) => item.id !== skill.id,
                        ),
                      })
                    }
                    className="p-2 border-border-base"
                  >
                    <div className="flex items-center gap-4">
                      <form.Field name={`techSkills[${i}].name`}>
                        {(field) => (
                          <input
                            aria-label="Skill Name"
                            value={field.state.value ?? ""}
                            autoComplete="off"
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              handleUpdate();
                            }}
                            className="flex-1 bg-transparent border-b border-transparent focus:border-emerald-500 outline-none text-sm font-bold"
                          />
                        )}
                      </form.Field>
                      <form.Field name={`techSkills[${i}].knowledge`}>
                        {(field) => (
                          <div className="flex items-center gap-3 w-1/2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              aria-label="Knowledge Level"
                              value={field.state.value ?? 0}
                              onChange={(e) => {
                                field.handleChange(Number(e.target.value));
                                handleUpdate();
                              }}
                              className="flex-1 accent-purple-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer"
                            />
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 w-6 text-right">
                              {field.state.value ?? 0}%
                            </span>
                          </div>
                        )}
                      </form.Field>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        {/* Education Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-border-base pb-2">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
              <GraduationCap size={18} />
              <h3 className="font-black text-xs uppercase tracking-widest">
                Education
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                const id = `edu-${Math.random().toString(36).substr(2, 9)}`;
                const newItems = [
                  ...data.educations,
                  {
                    id,
                    degree: "Degree",
                    organization: "University",
                    startYear: "2020",
                    endYear: "2024",
                  },
                ];
                setData({ ...data, educations: newItems });
              }}
              className="cursor-pointer flex items-center gap-1 bg-amber-600/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded text-[10px] font-bold hover:bg-amber-600/30 transition-colors"
            >
              <Plus size={12} /> ADD
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={(e) => handleDragEnd(e, "educations")}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={data.educations.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {data.educations.map((edu, i) => (
                  <SortableItem
                    key={edu.id}
                    id={edu.id}
                    onRemove={() =>
                      setData({
                        ...data,
                        educations: data.educations.filter(
                          (item) => item.id !== edu.id,
                        ),
                      })
                    }
                  >
                    <form.Field name={`educations[${i}].degree`}>
                      {(field) => (
                        <div className="space-y-1">
                          <label
                            htmlFor={field.name}
                            className="text-[10px] font-bold text-text-muted uppercase"
                          >
                            Degree
                          </label>
                          <input
                            id={field.name}
                            value={field.state.value ?? ""}
                            autoComplete="off"
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              handleUpdate();
                            }}
                            className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none"
                          />
                        </div>
                      )}
                    </form.Field>
                    <div className="grid grid-cols-2 gap-4">
                      <form.Field name={`educations[${i}].organization`}>
                        {(field) => (
                          <div className="space-y-1">
                            <label
                              htmlFor={field.name}
                              className="text-[10px] font-bold text-text-muted uppercase"
                            >
                              Organization
                            </label>
                            <input
                              id={field.name}
                              value={field.state.value ?? ""}
                              autoComplete="off"
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                                handleUpdate();
                              }}
                              className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none"
                            />
                          </div>
                        )}
                      </form.Field>
                      <div className="grid grid-cols-2 gap-2">
                        <form.Field name={`educations[${i}].startYear`}>
                          {(field) => (
                            <div className="space-y-1">
                              <label
                                htmlFor={field.name}
                                className="text-[10px] font-bold text-text-muted uppercase"
                              >
                                Start
                              </label>
                              <input
                                id={field.name}
                                value={field.state.value ?? ""}
                                autoComplete="off"
                                onChange={(e) => {
                                  field.handleChange(e.target.value);
                                  handleUpdate();
                                }}
                                className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none"
                              />
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`educations[${i}].endYear`}>
                          {(field) => (
                            <div className="space-y-1">
                              <label
                                htmlFor={field.name}
                                className="text-[10px] font-bold text-text-muted uppercase"
                              >
                                End
                              </label>
                              <input
                                id={field.name}
                                value={field.state.value ?? ""}
                                autoComplete="off"
                                onChange={(e) => {
                                  field.handleChange(e.target.value);
                                  handleUpdate();
                                }}
                                className="w-full bg-surface-bg border border-border-base rounded px-3 py-2 text-sm text-text-main focus:border-emerald-500 outline-none"
                              />
                            </div>
                          )}
                        </form.Field>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        {/* Languages Section */}
        <section className="space-y-4 pt-4 pb-8">
          <div className="flex items-center justify-between border-b border-border-base pb-2">
            <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-300">
              <Languages size={18} />
              <h3 className="font-black text-xs uppercase tracking-widest">
                Languages
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                const id = `lang-${Math.random().toString(36).substr(2, 9)}`;
                const newItems = [
                  ...data.languages,
                  { id, language: "Language", level: 5 },
                ];
                setData({ ...data, languages: newItems });
              }}
              className="cursor-pointer flex items-center gap-1 bg-emerald-600/20 text-emerald-500 dark:text-emerald-300 px-2 py-1 rounded text-[10px] font-bold hover:bg-emerald-600/30 transition-colors"
            >
              <Plus size={12} /> ADD
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={(e) => handleDragEnd(e, "languages")}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={data.languages.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-3">
                {data.languages.map((lang, i) => (
                  <SortableItem
                    key={lang.id}
                    id={lang.id}
                    onRemove={() =>
                      setData({
                        ...data,
                        languages: data.languages.filter(
                          (item) => item.id !== lang.id,
                        ),
                      })
                    }
                    className="p-2 border-border-base"
                  >
                    <div className="flex items-center gap-4">
                      <form.Field name={`languages[${i}].language`}>
                        {(field) => (
                          <input
                            aria-label="Language Name"
                            value={field.state.value ?? ""}
                            autoComplete="off"
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              handleUpdate();
                            }}
                            className="flex-1 bg-transparent border-b border-transparent focus:border-emerald-500 outline-none text-sm font-bold"
                          />
                        )}
                      </form.Field>
                      <form.Field name={`languages[${i}].level`}>
                        {(field) => (
                          <div className="flex items-center gap-3 w-1/3">
                            <select
                              aria-label="Language Level"
                              value={field.state.value ?? 1}
                              onChange={(e) => {
                                field.handleChange(Number(e.target.value));
                                handleUpdate();
                              }}
                              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-900 dark:text-slate-200 outline-none"
                            >
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <option key={lvl} value={lvl}>
                                  Level {lvl}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </form.Field>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      </form>
    </div>
  );
}

const FormEditor = memo(FormEditorComponent);
export default FormEditor;
