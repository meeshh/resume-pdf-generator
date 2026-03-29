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
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.4,
    color: "#333",
  },
  sidebar: {
    width: "32%",
    padding: 25,
    color: "#fff",
    height: "100%",
  },
  main: {
    width: "68%",
    padding: 30,
    backgroundColor: "#fff",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#fff",
    objectFit: "cover",
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
  },
  title: {
    fontSize: 10,
    fontWeight: 400,
    marginBottom: 20,
    opacity: 0.9,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarHeading: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.3)",
    marginBottom: 10,
    paddingBottom: 3,
  },
  contactItem: {
    marginBottom: 6,
    fontSize: 8,
  },
  skillItem: {
    marginBottom: 8,
  },
  skillLabel: {
    fontSize: 8,
    marginBottom: 2,
  },
  skillBarBg: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 1.5,
  },
  skillBarFg: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 1.5,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 12,
    paddingBottom: 4,
    borderBottom: "1.5px solid #eee",
  },
  experienceItem: {
    marginBottom: 15,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 700,
  },
  itemDate: {
    fontSize: 8,
    color: "#666",
  },
  itemOrg: {
    fontSize: 9,
    fontWeight: 700,
    color: "#444",
    marginBottom: 4,
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

const VerticalTemplate: React.FC<Props> = ({
  data,
  accentColor = "#334155",
}) => {
  const {
    personal,
    labels,
    professionalExperiences = [],
    techSkills = [],
    educations = [],
    languages = [],
  } = data;
  const fullName = `${personal?.firstName || ""} ${personal?.lastName || ""}`;

  return (
    <Document title={fullName}>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={{ ...styles.sidebar, backgroundColor: accentColor }}>
          {personal?.photoUrl && (
            <Image
              src={personal.photoUrl}
              style={styles.photo}
            />
          )}
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.title}>{personal?.title || ""}</Text>

          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarHeading}>Contact</Text>
            <Text style={styles.contactItem}>{personal?.location || ""}</Text>
            <Text style={styles.contactItem}>{personal?.email || ""}</Text>
            <Text style={styles.contactItem}>{personal?.mobile || ""}</Text>
          </View>

          {techSkills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeading}>
                {labels?.skills || "Skills"}
              </Text>
              {techSkills.map((skill) => (
                <View key={skill.id} style={styles.skillItem}>
                  <Text style={styles.skillLabel}>{skill.name}</Text>
                  <View style={styles.skillBarBg}>
                    <View
                      style={{
                        ...styles.skillBarFg,
                        width: `${skill.knowledge}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {languages.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeading}>
                {labels?.languages || "Languages"}
              </Text>
              {languages.map((lang) => (
                <Text key={lang.id} style={styles.contactItem}>
                  {lang.language} - Level {lang.level}/5
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <View style={{ marginBottom: 20 }}>
            <Html {...htmlProps}>{personal?.summary || ""}</Html>
          </View>

          {professionalExperiences.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  ...styles.sectionHeading,
                  color: accentColor,
                  borderBottomColor: `${accentColor}22`,
                }}
              >
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

          {educations.length > 0 && (
            <View>
              <Text
                style={{
                  ...styles.sectionHeading,
                  color: accentColor,
                  borderBottomColor: `${accentColor}22`,
                }}
              >
                {labels?.education || "Education"}
              </Text>
              {educations.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 10 }}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.itemDate}>
                      {edu.startYear}
                      {edu.startYear && edu.endYear ? " - " : ""}
                      {edu.endYear}
                    </Text>
                  </View>
                  <Text style={styles.itemOrg}>{edu.organization}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default memo(VerticalTemplate);

