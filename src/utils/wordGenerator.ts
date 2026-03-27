import {
	AlignmentType,
	Document,
	HeadingLevel,
	Packer,
	Paragraph,
	TextRun,
} from "docx";
import { saveAs } from "file-saver";
import type { ResumeData } from "../types/ResumeData";

export const generateWordResume = async (data: ResumeData) => {
	if (!data?.personal) {
		console.error("Invalid resume data provided to Word generator");
		return;
	}

	const {
		personal,
		labels,
		professionalExperiences = [],
		techSkills = [],
		educations = [],
		languages = [],
	} = data;

	// Local defaults for labels if missing
	const l = {
		workExperience: labels?.workExperience || "Work Experience",
		skills: labels?.skills || "Technical Skills",
		education: labels?.education || "Education",
		languages: labels?.languages || "Languages",
		present: labels?.present || "Present",
	};

	const doc = new Document({
		sections: [
			{
				properties: {},
				children: [
					// Header
					new Paragraph({
						children: [
							new TextRun({
								text: `${personal.firstName || ""} ${personal.lastName || ""}`,
								bold: true,
								size: 32,
							}),
						],
						alignment: AlignmentType.CENTER,
					}),
					new Paragraph({
						children: [
							new TextRun({
								text: personal.title || "",
								bold: true,
								size: 24,
							}),
						],
						alignment: AlignmentType.CENTER,
					}),
					new Paragraph({
						children: [
							new TextRun({
								text: `${personal.location || ""} | ${personal.email || ""} | ${personal.mobile || ""}`,
								size: 18,
							}),
						],
						alignment: AlignmentType.CENTER,
						spacing: { after: 400 },
					}),

					// Summary
					new Paragraph({
						text: "Professional Summary",
						heading: HeadingLevel.HEADING_1,
						spacing: { before: 200, after: 100 },
					}),
					new Paragraph({
						children: [
							new TextRun({
								text: (personal.summary || "").replace(/<[^>]*>/g, ""),
								size: 20,
							}),
						],
						spacing: { after: 300 },
					}),

					// Work Experience
					new Paragraph({
						text: l.workExperience.toUpperCase(),
						heading: HeadingLevel.HEADING_1,
						spacing: { before: 200, after: 100 },
					}),
					...professionalExperiences.flatMap((exp) => [
						new Paragraph({
							children: [
								new TextRun({ text: exp.title || "", bold: true, size: 22 }),
								new TextRun({
									text: `\t${exp.startDate || ""} - ${exp.endDate || l.present}`,
									size: 20,
								}),
							],
							tabStops: [{ type: "right", position: 9000 }],
						}),
						new Paragraph({
							children: [
								new TextRun({
									text: exp.organization || "",
									italics: true,
									size: 20,
								}),
							],
							spacing: { after: 100 },
						}),
						new Paragraph({
							children: [
								new TextRun({
									text: (exp.body || "").replace(/<[^>]*>/g, "").trim(),
									size: 20,
								}),
							],
							spacing: { after: 200 },
						}),
					]),

					// Skills
					new Paragraph({
						text: l.skills.toUpperCase(),
						heading: HeadingLevel.HEADING_1,
						spacing: { before: 200, after: 100 },
					}),
					new Paragraph({
						children: [
							new TextRun({
								text: techSkills.map((s) => s.name).join(", "),
								size: 20,
							}),
						],
						spacing: { after: 200 },
					}),

					// Education
					new Paragraph({
						text: l.education.toUpperCase(),
						heading: HeadingLevel.HEADING_1,
						spacing: { before: 200, after: 100 },
					}),
					...educations.flatMap((edu) => [
						new Paragraph({
							children: [
								new TextRun({ text: edu.degree || "", bold: true, size: 22 }),
								new TextRun({
									text: `\t${edu.startYear || ""} - ${edu.endYear || ""}`,
									size: 20,
								}),
							],
							tabStops: [{ type: "right", position: 9000 }],
						}),
						new Paragraph({
							children: [
								new TextRun({ text: edu.organization || "", size: 20 }),
							],
							spacing: { after: 200 },
						}),
					]),

					// Languages
					new Paragraph({
						text: l.languages.toUpperCase(),
						heading: HeadingLevel.HEADING_1,
						spacing: { before: 200, after: 100 },
					}),
					new Paragraph({
						children: [
							new TextRun({
								text: languages
									.map((l) => `${l.language} (Level ${l.level}/5)`)
									.join(", "),
								size: 20,
							}),
						],
					}),
				],
			},
		],
	});

	const blob = await Packer.toBlob(doc);
	saveAs(
		blob,
		`${personal.firstName || "Resume"}_${personal.lastName || ""}.docx`,
	);
};
