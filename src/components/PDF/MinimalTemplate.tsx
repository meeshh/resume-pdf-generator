import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type React from "react";
import { memo } from "react";
import Html from "react-pdf-html";
import type { ResumeData } from "../../types/ResumeData";

const fontSizes = {
  name: 24,
  title: 12,
  sectionHeading: 12,
  itemHeading: 10,
  text: 9,
  small: 8,
  tiny: 7,
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: fontSizes.text,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
    alignItems: "center",
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    objectFit: "cover",
  },
  name: {
    fontSize: fontSizes.name,
    fontWeight: 700,
    color: "#000",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  personTitle: {
    fontSize: fontSizes.title,
    fontWeight: 700,
    color: "#4b5563",
    marginBottom: 10,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    fontSize: fontSizes.small,
    color: "#6b7280",
  },
  section: {
    marginTop: 12,
  },
  sectionHeading: {
    fontSize: fontSizes.sectionHeading,
    fontWeight: 700,
    color: "#000",
    borderBottom: "2px solid #000",
    marginBottom: 6,
    paddingBottom: 2,
    textTransform: "uppercase",
  },
  summary: {
    marginBottom: 5,
    textAlign: "justify",
  },
  experienceItem: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontWeight: 700,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: fontSizes.itemHeading,
    fontWeight: 700,
    color: "#000",
  },
  itemOrg: {
    fontSize: fontSizes.text,
    fontWeight: 700,
    fontStyle: "italic",
    marginBottom: 4,
  },
  skillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillItem: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
});

const htmlProps = {
  style: { fontSize: fontSizes.text },
  stylesheet: {
    p: { margin: 0 },
    ul: { marginTop: 4, marginLeft: -15 },
    li: { marginBottom: 2, marginLeft: 0 },
  },
};

interface Props {
  data: ResumeData;
  accentColor?: string;
}

const MinimalTemplate: React.FC<Props> = ({ data, accentColor = "#000" }) => {
  if (!data?.personal) return null;

  const {
    personal,
    labels,
    professionalExperiences = [],
    techSkills = [],
    otherSkills = [],
    educations = [],
    languages = [],
  } = data;
  const fullName = `${personal.firstName || ""} ${personal.lastName || ""}`;

  return (
    <Document author={fullName} title={fullName}>
      <Page size="A4" style={styles.page}>
        {/* Centered Header */}
        <View style={styles.header}>
          {personal.photoUrl && (
            <Image src={personal.photoUrl} style={styles.photo} />
          )}
          <Text style={{ ...styles.name, color: accentColor }}>{fullName}</Text>
          <Text style={styles.personTitle}>{personal.title}</Text>
          <View style={styles.contactInfo}>
            <Text>{personal.location}</Text>
            <Text>|</Text>
            <Text>{personal.email}</Text>
            <Text>|</Text>
            <Text>{personal.mobile}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Html {...htmlProps}>{personal.summary || ""}</Html>
        </View>

        {/* Experience */}
        {professionalExperiences.length > 0 && (
          <View style={styles.section}>
            <Text
              style={{
                ...styles.sectionHeading,
                color: accentColor,
                borderBottomColor: accentColor,
              }}
            >
              {labels?.workExperience || "Experience"}
            </Text>
            {professionalExperiences.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.title}</Text>
                  <Text style={{ fontSize: fontSizes.tiny }}>
                    {exp.startDate}
                    {exp.startDate && (exp.endDate || labels?.present)
                      ? " - "
                      : ""}
                    {exp.endDate ||
                      (exp.startDate ? labels?.present || "Present" : "")}
                  </Text>
                </View>
                <Text style={styles.itemOrg}>{exp.organization}</Text>
                <Html {...htmlProps}>{exp.body || ""}</Html>
              </View>
            ))}
          </View>
        )}

        {/* Education & Skills Grid */}
        <View style={{ flexDirection: "row", gap: 30 }}>
          <View style={{ flex: 1 }}>
            {educations.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={{
                    ...styles.sectionHeading,
                    color: accentColor,
                    borderBottomColor: accentColor,
                  }}
                >
                  {labels?.education || "Education"}
                </Text>
                {educations.map((edu) => (
                  <View key={edu.id} style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: 700 }}>{edu.degree}</Text>
                    <Text>{edu.organization}</Text>
                    <Text
                      style={{ fontSize: fontSizes.tiny, color: "#6b7280" }}
                    >
                      {edu.startYear}
                      {edu.startYear && edu.endYear ? " - " : ""}
                      {edu.endYear}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            {techSkills.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={{
                    ...styles.sectionHeading,
                    color: accentColor,
                    borderBottomColor: accentColor,
                  }}
                >
                  {labels?.skills || "Skills"}
                </Text>
                <View style={styles.skillGrid}>
                  {techSkills.map((skill) => (
                    <View key={skill.id} style={styles.skillItem}>
                      <Text style={{ fontSize: fontSizes.tiny }}>
                        {skill.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Languages & Other */}
        <View style={{ flexDirection: "row", gap: 30 }}>
          {languages.length > 0 && (
            <View style={{ flex: 1 }}>
              <View style={styles.section}>
                <Text
                  style={{
                    ...styles.sectionHeading,
                    color: accentColor,
                    borderBottomColor: accentColor,
                  }}
                >
                  {labels?.languages || "Languages"}
                </Text>
                {languages.map((lang) => (
                  <Text key={lang.id} style={{ fontSize: fontSizes.small }}>
                    {lang.language} - Level {lang.level}/5
                  </Text>
                ))}
              </View>
            </View>
          )}

          {otherSkills.length > 0 && (
            <View style={{ flex: 1 }}>
              <View style={styles.section}>
                <Text
                  style={{
                    ...styles.sectionHeading,
                    color: accentColor,
                    borderBottomColor: accentColor,
                  }}
                >
                  {labels?.otherSkills || "Other"}
                </Text>
                {otherSkills.map((skill) => (
                  <Html key={skill.id} {...htmlProps}>
                    {skill.body || ""}
                  </Html>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default memo(MinimalTemplate);
