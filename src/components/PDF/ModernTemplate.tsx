import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type React from "react";
import Html from "react-pdf-html";
import type { ResumeData } from "../../types/ResumeData";

const fontSizes = {
  name: 18,
  title: 11,
  sectionHeading: 12,
  itemHeading: 10,
  text: 8,
  small: 7,
  tiny: 6,
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: fontSizes.text,
    color: "#334155",
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    marginBottom: 10,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 10,
    gap: 15,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
  },
  nameContainer: {
    flexDirection: "row",
    gap: 5,
  },
  firstName: {
    fontSize: fontSizes.name,
    fontWeight: 700,
    color: "#5350a2",
  },
  lastName: {
    fontSize: fontSizes.name,
    fontWeight: 700,
    color: "#94a3b8",
  },
  personTitle: {
    fontSize: fontSizes.title,
    fontWeight: 700,
    color: "#64748b",
    marginTop: 10,
  },
  contactInfo: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 2,
  },
  contactText: {
    fontSize: fontSizes.small,
    color: "#64748b",
  },
  container: {
    flexDirection: "row",
    gap: 20,
  },
  mainColumn: {
    flex: 2,
  },
  sidebar: {
    flex: 1,
    borderLeft: "1px solid #f1f5f9",
    paddingLeft: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionHeading: {
    fontSize: fontSizes.sectionHeading,
    fontWeight: 700,
    color: "#5350a2",
    borderBottom: "1px solid #e2e8f0",
    marginBottom: 12,
    paddingBottom: 2,
    textTransform: "uppercase",
  },
  experienceItem: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: fontSizes.itemHeading,
    fontWeight: 700,
    color: "#1e293b",
    flex: 1,
  },
  itemDate: {
    fontSize: fontSizes.tiny,
    color: "#94a3b8",
  },
  itemOrg: {
    fontSize: fontSizes.text,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 3,
  },
  skillRow: {
    marginBottom: 5,
  },
  skillLabel: {
    fontSize: fontSizes.small,
    marginBottom: 1,
  },
  skillBarContainer: {
    height: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 2,
  },
  skillBar: {
    height: "100%",
    backgroundColor: "#5350a2",
    borderRadius: 2,
  },
  educationItem: {
    marginBottom: 6,
  },
  educationDegree: {
    fontSize: fontSizes.text,
    fontWeight: 700,
  },
  educationOrg: {
    fontSize: fontSizes.small,
  },
  educationDate: {
    fontSize: fontSizes.tiny,
    color: "#94a3b8",
  },
});

const htmlProps = {
  style: { fontSize: fontSizes.text },
  stylesheet: {
    p: { margin: 0 },
    ul: { marginTop: 2, marginLeft: -15 },
    li: { marginBottom: 1, marginLeft: 0 },
  },
};

interface Props {
  data: ResumeData;
  accentColor?: string;
}

const ModernTemplate: React.FC<Props> = ({ data, accentColor = "#5350a2" }) => {
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
        {/* Modern Header */}
        <View style={styles.header}>
          {personal.photoUrl && (
            <Image src={personal.photoUrl} style={styles.photo} />
          )}
          <View style={styles.headerContent}>
            <View style={styles.nameContainer}>
              <Text style={{ ...styles.firstName, color: accentColor }}>
                {personal.firstName}
              </Text>
              <Text style={styles.lastName}>{personal.lastName}</Text>
            </View>
            <Text style={styles.personTitle}>{personal.title}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>{personal.location}</Text>
            <Text style={styles.contactText}>{personal.email}</Text>
            <Text style={styles.contactText}>{personal.mobile}</Text>
          </View>
        </View>

        <View style={styles.container}>
          {/* Main Column */}
          <View style={styles.mainColumn}>
            {professionalExperiences.length > 0 && (
              <View style={styles.section}>
                <Text style={{ ...styles.sectionHeading, color: accentColor }}>
                  {labels?.workExperience || "Work Experience"}
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
                    <Html {...htmlProps}>{exp.body || ""}</Html>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Sidebar Column */}
          <View style={styles.sidebar}>
            <View style={styles.section}>
              <Html {...htmlProps}>{personal.summary || ""}</Html>
            </View>

            {techSkills.length > 0 && (
              <View style={styles.section}>
                <Text style={{ ...styles.sectionHeading, color: accentColor }}>
                  {labels?.skills || "Technical Skills"}
                </Text>
                {techSkills.map((skill) => (
                  <View key={skill.id} style={styles.skillRow}>
                    <Text style={styles.skillLabel}>{skill.name}</Text>
                    <View style={styles.skillBarContainer}>
                      <View
                        style={{
                          ...styles.skillBar,
                          backgroundColor: accentColor,
                          width: `${skill.knowledge}%`,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {otherSkills.length > 0 && (
              <View style={styles.section}>
                <Text style={{ ...styles.sectionHeading, color: accentColor }}>
                  {labels?.otherSkills || "Other"}
                </Text>
                {otherSkills.map((skill) => (
                  <View key={skill.id} style={{ marginBottom: 4 }}>
                    <Html {...htmlProps}>{skill.body || ""}</Html>
                  </View>
                ))}
              </View>
            )}

            {educations.length > 0 && (
              <View style={styles.section}>
                <Text style={{ ...styles.sectionHeading, color: accentColor }}>
                  {labels?.education || "Education"}
                </Text>
                {educations.map((edu) => (
                  <View key={edu.id} style={styles.educationItem}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.educationDegree}>{edu.degree}</Text>
                      <Text style={styles.educationDate}>
                        {edu.startYear}
                        {edu.startYear && edu.endYear ? " - " : ""}
                        {edu.endYear}
                      </Text>
                    </View>
                    <Text style={styles.educationOrg}>{edu.organization}</Text>
                  </View>
                ))}
              </View>
            )}

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
                      marginBottom: 3,
                    }}
                  >
                    <Text style={{ fontSize: 7 }}>{lang.language}</Text>
                    <View style={{ flexDirection: "row", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <View
                          key={`dot-${lang.language}-${Math.random()}`}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 2.5,
                            backgroundColor:
                              i < lang.level ? accentColor : "#e2e8f0",
                          }}
                        />
                      ))}
                    </View>
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

export default ModernTemplate;
