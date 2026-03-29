import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import React, { memo } from "react";
import Html from "react-pdf-html";
import type { ResumeData } from "../../types/ResumeData";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#000",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1px solid #000",
    paddingBottom: 10,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    objectFit: "cover",
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 4,
  },
  contact: {
    marginTop: 4,
    fontSize: 9,
  },
  section: {
    marginTop: 15,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    borderBottom: "1px solid #000",
    marginBottom: 8,
  },
  experienceItem: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontWeight: 700,
  },
  orgName: {
    fontWeight: 700,
    fontStyle: "normal",
  },
  skillGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
});

const htmlProps = {
  style: { fontSize: 10 },
  stylesheet: {
    p: { margin: 0 },
    ul: { marginTop: 4, marginLeft: -15 },
    li: { marginBottom: 2, marginLeft: 0 },
  },
};

interface Props {
  data: ResumeData;
}

const ATSPDF: React.FC<Props> = ({ data }) => {
  const {
    personal,
    professionalExperiences,
    techSkills,
    softSkills,
    educations,
    languages,
    otherSkills = [],
  } = data;
  const fullName = `${personal.firstName} ${personal.lastName}`;

  return (
    <Document title={`ATS Resume - ${fullName}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {personal.photoUrl && (
            <Image
              src={personal.photoUrl}
              style={styles.photo}
            />
          )}
          <View style={styles.headerText}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.title}>{personal.title}</Text>
            <Text style={styles.contact}>
              {personal.location} | {personal.email} | {personal.mobile}
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Professional Summary</Text>
          <Html {...htmlProps}>{personal.summary}</Html>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Professional Experience</Text>
          {professionalExperiences.map((exp) => (
            <View key={exp.id} style={styles.experienceItem}>
              <View style={styles.itemHeader}>
                <Text style={{ fontWeight: 700 }}>{exp.title}</Text>
                <Text>
                  {exp.startDate}
                  {exp.startDate && (exp.endDate || "Present") ? " - " : ""}
                  {exp.endDate || (exp.startDate ? "Present" : "")}
                </Text>
              </View>
              <Text style={styles.orgName}>{exp.organization}</Text>
              <Html {...htmlProps}>{exp.body}</Html>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Technical Skills</Text>
          <Text>{techSkills.map((s) => s.name).join(", ")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Soft Skills</Text>
          <Text>{softSkills.map((s) => s.name).join(", ")}</Text>
        </View>

        {otherSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Other Skills</Text>
            {otherSkills.map((skill) => (
              <View key={skill.id} style={styles.experienceItem}>
                <Html {...htmlProps}>{skill.body}</Html>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Education</Text>
          {educations.map((edu) => (
            <View key={edu.id} style={{ marginBottom: 5 }}>
              <View style={styles.itemHeader}>
                <Text style={{ fontWeight: 700 }}>{edu.degree}</Text>
                <Text>
                  {edu.startYear}
                  {edu.startYear && edu.endYear ? " - " : ""}
                  {edu.endYear}
                </Text>
              </View>
              <Text>{edu.organization}</Text>
            </View>
          ))}
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Languages</Text>
          <Text>
            {languages
              .map((l) => `${l.language} (Level ${l.level}/5)`)
              .join(", ")}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default memo(ATSPDF);

