import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type React from "react";
import Html from "react-pdf-html";
import type { ResumeData } from "../../types/ResumeData";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.4,
    color: "#222",
    backgroundColor: "#fff",
  },
  header: {
    padding: 30,
    color: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 12,
    fontWeight: 400,
    marginTop: 10,
    opacity: 0.9,
  },
  contactText: {
    fontSize: 8,
    opacity: 0.9,
  },
  content: {
    padding: 30,
    flexDirection: "row",
    gap: 25,
  },
  mainColumn: {
    flex: 2,
  },
  sideColumn: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: "1px solid #ddd",
    marginBottom: 10,
    paddingBottom: 4,
  },
  experienceItem: {
    marginBottom: 15,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#000",
  },
  itemDate: {
    fontSize: 8,
    color: "#666",
  },
  itemOrg: {
    fontSize: 9,
    fontWeight: 700,
    fontStyle: "italic",
    marginBottom: 4,
  },
  skillGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    fontSize: 7,
  },
});

const htmlProps = {
  style: { fontSize: 9 },
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

const ExecutiveTemplate: React.FC<Props> = ({
  data,
  accentColor = "#1f2937",
}) => {
  const {
    personal,
    labels,
    professionalExperiences = [],
    techSkills = [],
    educations = [],
    languages = [],
    otherSkills = [],
  } = data;
  const fullName = `${personal.firstName} ${personal.lastName}`;

  return (
    <Document title={fullName}>
      <Page size="A4" style={styles.page}>
        {/* Full Width Header */}
        <View style={{ ...styles.header, backgroundColor: accentColor }}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.title}>{personal.title}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.contactText}>{personal.location}</Text>
            <Text style={styles.contactText}>{personal.email}</Text>
            <Text style={styles.contactText}>{personal.mobile}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.mainColumn}>
            {/* Summary */}
            <View style={styles.section}>
              <Html {...htmlProps}>{personal.summary}</Html>
            </View>

            {/* Experience */}
            {professionalExperiences.length > 0 && (
              <View style={styles.section}>
                <Text style={{ ...styles.sectionHeading, color: accentColor }}>
                  {labels?.workExperience || "Experience"}
                </Text>
                {professionalExperiences.map((exp) => (
                  <View key={exp.id} style={styles.experienceItem}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{exp.title}</Text>
                      <Text style={styles.itemDate}>
                        {exp.startDate}
                        {exp.startDate && (exp.endDate || labels?.present)
                          ? " - "
                          : ""}
                        {exp.endDate ||
                          (exp.startDate ? labels?.present || "Present" : "")}
                      </Text>
                    </View>
                    <Text style={styles.itemOrg}>{exp.organization}</Text>
                    <Html {...htmlProps}>{exp.body}</Html>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.sideColumn}>
            {/* Education */}
            {educations.length > 0 && (
              <View style={styles.section}>
                <Text style={{ ...styles.sectionHeading, color: accentColor }}>
                  {labels?.education || "Education"}
                </Text>
                {educations.map((edu) => (
                  <View key={edu.id} style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 9, fontWeight: 700 }}>
                      {edu.degree}
                    </Text>
                    <Text style={{ fontSize: 8 }}>{edu.organization}</Text>
                    <Text style={{ fontSize: 7, color: "#666" }}>
                      {edu.startYear}
                      {edu.startYear && edu.endYear ? " - " : ""}
                      {edu.endYear}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Skills */}
            {techSkills.length > 0 && (
              <View style={styles.section}>
                <Text style={{ ...styles.sectionHeading, color: accentColor }}>
                  {labels?.skills || "Skills"}
                </Text>
                <View style={styles.skillGroup}>
                  {techSkills.map((skill) => (
                    <View key={skill.id} style={styles.skillTag}>
                      <Text>{skill.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <View style={styles.section}>
                <Text style={{ ...styles.sectionHeading, color: accentColor }}>
                  {labels?.languages || "Languages"}
                </Text>
                {languages.map((lang) => (
                  <View
                    key={lang.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <Text style={{ fontSize: 8 }}>{lang.language}</Text>
                    <Text style={{ fontSize: 8, color: "#666" }}>
                      {lang.level}/5
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Other Skills */}
            {otherSkills.length > 0 && (
              <View style={styles.section}>
                <Text style={{ ...styles.sectionHeading, color: accentColor }}>
                  {labels?.otherSkills || "Other"}
                </Text>
                {otherSkills.map((skill) => (
                  <View
                    key={skill.id}
                    style={{ ...styles.experienceItem, marginBottom: 10 }}
                  >
                    <Html {...htmlProps}>{skill.body}</Html>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ExecutiveTemplate;
