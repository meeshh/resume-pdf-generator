import { Editor } from "@monaco-editor/react";
import { PDFViewer } from "@react-pdf/renderer";
import {
	Check,
	Copy,
	FileJson,
	FileText,
	RefreshCw,
	Sparkles,
	Upload,
	X,
} from "lucide-react";
import type React from "react";
import { useDeferredValue, useEffect, useState } from "react";
import OnboardingTour from "./components/OnboardingTour";
import ATSPDF from "./components/PDF/ATSPDF";
import ExecutiveTemplate from "./components/PDF/ExecutiveTemplate";
import MinimalTemplate from "./components/PDF/MinimalTemplate";
import ModernTemplate from "./components/PDF/ModernTemplate";
import VerticalTemplate from "./components/PDF/VerticalTemplate";
import type { ResumeData } from "./types/ResumeData";
import { generateWordResume } from "./utils/wordGenerator";

type TemplateType = "modern" | "minimal" | "vertical" | "executive" | "ats";

const initialData: ResumeData = {
	personal: {
		firstName: "JOHN",
		lastName: "DOE",
		title: "Senior Software Engineer",
		location: "City, Country",
		email: "john.doe@example.com",
		mobile: "+00 000 000 00 00",
		photoUrl: "",
		summary:
			"<p>A highly motivated and experienced <strong>Software Engineer</strong> with a proven track record of developing innovative solutions and leading successful teams.</p>",
	},
	labels: {
		workExperience: "Work Experience",
		skills: "Technical Skills",
		otherSkills: "Other Skills",
		education: "Education",
		certifications: "Certifications",
		languages: "Languages",
		present: "Present",
	},
	professionalExperiences: [
		{
			id: "1",
			title: "Senior Software Engineer",
			organization: "Global Tech Solutions",
			startDate: "Jan 2020",
			body: "<ul><li>Spearheaded the development of a cloud-based enterprise application.</li><li>Implemented scalable microservices architecture using modern frameworks.</li><li>Led a team of developers to deliver high-quality code within tight deadlines.</li></ul>",
		},
		{
			id: "2",
			title: "Software Developer",
			organization: "Innovative Startups Inc.",
			startDate: "Jun 2016",
			endDate: "Dec 2019",
			body: "<p>Contributed to the design and implementation of various web-based projects. Focused on optimizing performance and improving user experience.</p>",
		},
	],
	techSkills: [
		{ id: "1", name: "JavaScript / TypeScript", knowledge: 90 },
		{ id: "2", name: "React / Angular / Vue", knowledge: 85 },
		{ id: "3", name: "Node.js / Python / Go", knowledge: 80 },
		{ id: "4", name: "SQL / NoSQL Databases", knowledge: 75 },
	],
	softSkills: [
		{ id: "s1", name: "Leadership", knowledge: 85 },
		{ id: "s2", name: "Problem Solving", knowledge: 95 },
		{ id: "s3", name: "Communication", knowledge: 90 },
	],
	otherSkills: [
		{
			id: "o1",
			body: "<p>Docker, Kubernetes, AWS, CI/CD, Agile Methodologies</p>",
		},
	],
	educations: [
		{
			id: "e1",
			degree: "Bachelor of Science in Computer Science",
			organization: "State University",
			startYear: "2012",
			endYear: "2016",
		},
	],
	certifications: [],
	languages: [
		{ id: "l1", language: "English", level: 5 },
		{ id: "l2", language: "French", level: 3 },
	],
};

const JSON_SCHEMA = `
{
  "personal": {
    "firstName": "string",
    "lastName": "string",
    "title": "string",
    "location": "string",
    "email": "string",
    "mobile": "string",
    "photoUrl": "string (optional URL or base64)",
    "summary": "string (HTML supported)"
  },
  "labels": {
    "workExperience": "string",
    "skills": "string",
    "otherSkills": "string",
    "education": "string",
    "certifications": "string",
    "languages": "string",
    "present": "string"
  },
  "professionalExperiences": [
    {
      "id": "string",
      "title": "string",
      "organization": "string",
      "startDate": "string",
      "endDate": "string (optional)",
      "body": "string (HTML supported)"
    }
  ],
  "techSkills": [{ "id": "string", "name": "string", "knowledge": "number (0-100)" }],
  "softSkills": [{ "id": "string", "name": "string", "knowledge": "number (0-100)" }],
  "otherSkills": [{ "id": "string", "body": "string (HTML supported)" }],
  "educations": [
    {
      "id": "string",
      "degree": "string",
      "organization": "string",
      "startYear": "string",
      "endYear": "string"
    }
  ],
  "languages": [{ "id": "string", "language": "string", "level": "number (1-5)" }]
}
`;

function App() {
	const [jsonData, setJsonData] = useState<string>(
		JSON.stringify(initialData, null, 2),
	);
	const [data, setData] = useState<ResumeData>(initialData);
	const [error, setError] = useState<string | null>(null);
	const [template, setTemplate] = useState<TemplateType>("modern");
	const [accentColor, setAccentColor] = useState<string>("#5350a2");
	const [showSchema, setShowSchema] = useState(false);

	// Debounce the update to the PDF engine
	const deferredData = useDeferredValue(data);

	useEffect(() => {
		try {
			const parsed = JSON.parse(jsonData);
			setData(parsed);
			setError(null);
		} catch (_e) {
			setError("Invalid JSON format");
		}
	}, [jsonData]);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => setJsonData(event.target?.result as string);
		reader.readAsText(file);
	};

	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			const updatedData = { ...data };
			updatedData.personal.photoUrl = event.target?.result as string;
			setJsonData(JSON.stringify(updatedData, null, 2));
		};
		reader.readAsDataURL(file);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		alert("Copied to clipboard!");
	};

	const renderTemplate = () => {
		switch (template) {
			case "modern":
				return <ModernTemplate data={deferredData} accentColor={accentColor} />;
			case "minimal":
				return (
					<MinimalTemplate data={deferredData} accentColor={accentColor} />
				);
			case "vertical":
				return (
					<VerticalTemplate data={deferredData} accentColor={accentColor} />
				);
			case "executive":
				return (
					<ExecutiveTemplate data={deferredData} accentColor={accentColor} />
				);
			case "ats":
				return <ATSPDF data={deferredData} />;
			default:
				return <ModernTemplate data={deferredData} accentColor={accentColor} />;
		}
	};

	return (
		<div className="flex flex-col h-screen overflow-hidden bg-slate-900 font-sans">
			{/* Header */}
			<header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex justify-between items-center z-10">
				<div className="flex items-center gap-3 text-blue-400">
					<FileJson
						size={28}
						className="drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
					/>
					<h1 className="text-lg font-bold tracking-tight text-white uppercase italic">
						ResuMint
					</h1>
				</div>

				<div className="flex gap-2">
					{template === "ats" && (
						<button
							type="button"
							onClick={() => generateWordResume(data)}
							className="cursor-pointer flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors shadow-lg mr-2"
						>
							<FileText size={14} />
							DOWNLOAD WORD
						</button>
					)}

					<button
						type="button"
						data-tour="tour-schema"
						onClick={() => setShowSchema(true)}
						className="cursor-pointer flex items-center gap-2 bg-slate-700 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-600 transition-colors border border-blue-500/30 mr-2"
					>
						<Sparkles size={14} />
						LLM SCHEMA
					</button>

					<label className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-500 transition-colors shadow-lg">
						<Upload size={14} />
						IMPORT JSON
						<input
							type="file"
							accept=".json"
							onChange={handleFileUpload}
							className="hidden"
						/>
					</label>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex flex-1 overflow-hidden">
				{/* Editor Pane */}
				<div className="w-[40%] flex flex-col border-r border-slate-700">
					<div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
						<span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
							Source Code
						</span>
						<div className="flex gap-4">
							<label className="text-[10px] font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
								ATTACH PHOTO
								<input
									type="file"
									accept="image/*"
									onChange={handlePhotoUpload}
									className="hidden"
								/>
							</label>
							{error && (
								<span className="text-[10px] font-bold text-red-500 animate-pulse">
									{error}
								</span>
							)}
						</div>
					</div>
					<div
						className="flex-1 overflow-hidden pt-2 bg-[#0d1117]"
						data-tour="tour-editor"
					>
						<Editor
							height="100%"
							defaultLanguage="json"
							theme="vs-dark"
							value={jsonData}
							onChange={(value) => setJsonData(value || "")}
							options={{
								minimap: { enabled: false },
								fontSize: 13,
								lineNumbers: "on",
								scrollBeyondLastLine: false,
								automaticLayout: true,
								padding: { top: 16, bottom: 16 },
								wordWrap: "on",
								formatOnPaste: true,
								formatOnType: true,
								backgroundColor: "#0d1117",
							}}
						/>
					</div>
				</div>

				{/* Preview Pane */}
				<div className="w-[60%] bg-slate-950 flex flex-col relative">
					{/* Template Selector Thumbnails */}
					<div
						className="absolute top-4 left-6 z-20 flex items-center gap-3"
						data-tour="tour-templates"
					>
						{[
							{
								id: "ats",
								name: "ATS",
								icon: (
									<div className="w-full h-full flex flex-col gap-0.5 p-1">
										<div className="h-1 bg-slate-400/20 w-full"></div>
										<div className="h-1 bg-slate-400/20 w-full"></div>
										<div className="h-1 bg-slate-400/20 w-full"></div>
										<div className="h-1 bg-slate-400/20 w-full"></div>
									</div>
								),
							},
						].map((tpl) => (
							<button
								type="button"
								key={tpl.id}
								onClick={() => setTemplate(tpl.id as TemplateType)}
								className={`cursor-pointer group relative w-16 h-20 rounded-lg border-2 transition-all flex flex-col overflow-hidden bg-slate-800 ${template === tpl.id ? "border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "border-slate-700 hover:border-slate-500"}`}
							>
								<div className="flex-1 bg-slate-900/50">{tpl.icon}</div>
								<div
									className={`py-1 text-[9px] font-bold text-center uppercase tracking-tighter ${template === tpl.id ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"}`}
								>
									{tpl.name}
								</div>
								{template === tpl.id && (
									<div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-lg">
										<Check size={8} strokeWidth={4} />
									</div>
								)}
							</button>
						))}

						<div className="h-12 w-px bg-slate-700 mx-1" />

						{[
							{
								id: "modern",
								name: "Modern",
								icon: (
									<div className="w-full h-full flex flex-col gap-1 p-1">
										<div className="h-2 bg-blue-500 w-full rounded-xs"></div>
										<div className="flex gap-1 h-full">
											<div className="w-3/5 bg-slate-400/20 rounded-xs"></div>
											<div className="w-2/5 bg-slate-400/20 rounded-xs"></div>
										</div>
									</div>
								),
							},
							{
								id: "minimal",
								name: "Minimal",
								icon: (
									<div className="w-full h-full flex flex-col gap-1 p-1 items-center">
										<div className="h-2 bg-slate-400/20 w-1/2 rounded-xs"></div>
										<div className="h-full bg-slate-400/20 w-full rounded-xs"></div>
									</div>
								),
							},
							{
								id: "vertical",
								name: "Vertical",
								icon: (
									<div className="w-full h-full flex p-1 gap-1">
										<div className="w-1/3 bg-slate-400/20 rounded-xs h-full"></div>
										<div className="w-2/3 bg-slate-400/20 rounded-xs h-full"></div>
									</div>
								),
							},
							{
								id: "executive",
								name: "Executive",
								icon: (
									<div className="w-full h-full flex flex-col gap-1 p-1">
										<div className="h-3 bg-slate-400/20 w-full rounded-xs"></div>
										<div className="h-1 bg-blue-500 w-full rounded-xs"></div>
										<div className="h-full bg-slate-400/20 w-full rounded-xs"></div>
									</div>
								),
							},
						].map((tpl) => (
							<button
								type="button"
								key={tpl.id}
								onClick={() => setTemplate(tpl.id as TemplateType)}
								className={`cursor-pointer group relative w-16 h-20 rounded-lg border-2 transition-all flex flex-col overflow-hidden bg-slate-800 ${template === tpl.id ? "border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "border-slate-700 hover:border-slate-500"}`}
							>
								<div className="flex-1 bg-slate-900/50">{tpl.icon}</div>
								<div
									className={`py-1 text-[9px] font-bold text-center uppercase tracking-tighter ${template === tpl.id ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"}`}
								>
									{tpl.name}
								</div>
								{template === tpl.id && (
									<div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-lg">
										<Check size={8} strokeWidth={4} />
									</div>
								)}
							</button>
						))}
					</div>

					<div className="absolute top-4 right-8 z-20 flex flex-col gap-3 items-center">
						<button
							type="button"
							onClick={() => setJsonData(JSON.stringify(data, null, 2))}
							className="cursor-pointer  p-2 bg-slate-800 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all border border-slate-700 hover:bg-slate-700"
							title="Refresh Preview"
						>
							<RefreshCw size={18} />
						</button>

						{/* Color Presets Dropdown - only for visual templates */}
						{template !== "ats" && (
							<div className="group flex flex-col items-center gap-2 p-[5px] bg-slate-800 rounded-full border border-slate-700 shadow-xl transition-all duration-300 w-9 h-9 hover:h-[196px] overflow-hidden cursor-pointer">
								{/* Current selected color at the top */}
								<div
									className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0"
									style={{ backgroundColor: accentColor }}
								/>

								{/* Remaining colors revealed on hover */}
								{[
									{ name: "Blue", value: "#3d5a80" },
									{ name: "Purple", value: "#5350a2" },
									{ name: "Dark Red", value: "#b91c1c" },
									{ name: "Brown", value: "#92400e" },
									{ name: "Dark Gray", value: "#334155" },
									{ name: "Black", value: "#000000" },
								]
									.filter((col) => col.value !== accentColor)
									.map((col) => (
										<button
											type="button"
											key={col.value}
											onClick={() => setAccentColor(col.value)}
											className="cursor-pointer w-6 h-6 rounded-full border border-transparent hover:border-white/30 transition-all hover:scale-110 active:scale-95 shrink-0"
											style={{ backgroundColor: col.value }}
											title={col.name}
										/>
									))}
							</div>
						)}
					</div>

					<div className="flex-1 p-6 pt-28">
						<div
							className="w-full h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden bg-white border border-slate-800"
							data-tour="tour-preview"
						>
							<PDFViewer
								key={`${template}-${JSON.stringify(deferredData).length}`}
								width="100%"
								height="100%"
								showToolbar={true}
								className="border-none"
							>
								{renderTemplate()}
							</PDFViewer>
						</div>
					</div>
				</div>
			</main>

			{/* Schema Modal */}
			{showSchema && (
				<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
					<div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
						<div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
							<div className="flex items-center gap-2">
								<Sparkles size={20} className="text-blue-400" />
								<h2 className="text-lg font-bold text-white tracking-tight">
									AI Resume Schema
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setShowSchema(false)}
								className="cursor-pointer text-slate-500 hover:text-white transition-colors"
							>
								<X size={24} />
							</button>
						</div>
						<div className="p-6 overflow-y-auto bg-[#0d1117]">
							<div className="mb-4 text-sm text-slate-400">
								Copy this schema and tell your LLM: <br />
								<span className="italic text-blue-300">
									"Convert my resume text into a JSON object that strictly
									follows this schema:"
								</span>
							</div>
							<pre className="p-4 bg-slate-900 rounded-lg text-blue-400 text-xs font-mono border border-blue-500/20 whitespace-pre-wrap">
								{JSON_SCHEMA}
							</pre>
						</div>
						<div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-900/50">
							<button
								type="button"
								onClick={() => copyToClipboard(JSON_SCHEMA)}
								className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors"
							>
								<Copy size={16} />
								COPY SCHEMA
							</button>
							<button
								type="button"
								onClick={() => setShowSchema(false)}
								className="cursor-pointer px-4 py-2 text-slate-400 font-bold hover:text-white transition-colors"
							>
								CLOSE
							</button>
						</div>
					</div>
				</div>
			)}
			<OnboardingTour />
		</div>
	);
}

export default App;
