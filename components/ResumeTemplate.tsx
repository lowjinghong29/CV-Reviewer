
import React from 'react';
import { ImprovedCv } from '../types';

interface ResumeTemplateProps {
  cv: ImprovedCv;
  innerRef: React.RefObject<HTMLDivElement>;
}

// This component is designed to be rendered off-screen for PDF generation.
// It uses basic inline styles for a clean, professional PDF layout.
const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ cv, innerRef }) => {
  const styles = {
    page: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      color: '#333',
      lineHeight: '1.4',
      fontSize: '10pt',
      width: '210mm',
      minHeight: '297mm',
      padding: '12mm',
      backgroundColor: 'white',
    },
    header: {
      textAlign: 'center' as const,
      borderBottom: '2px solid #ccc',
      paddingBottom: '10px',
      marginBottom: '10px',
    },
    fullName: {
      fontSize: '24pt',
      fontWeight: 'bold' as const,
      color: '#000',
    },
    contactInfo: {
      fontSize: '9pt',
      color: '#555',
    },
    section: {
      marginBottom: '12px',
    },
    sectionTitle: {
      fontSize: '14pt',
      fontWeight: 'bold' as const,
      color: '#000',
      borderBottom: '1px solid #ddd',
      paddingBottom: '4px',
      marginBottom: '6px',
    },
    content: {
      
    },
    skillsList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      display: 'flex',
      flexWrap: 'wrap' as const,
    },
    skillItem: {
      backgroundColor: '#f0f0f0',
      padding: '2px 8px',
      borderRadius: '4px',
      margin: '2px',
      fontSize: '9pt',
    },
    entry: {
      marginBottom: '8px',
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between' as const,
      fontWeight: 'bold' as const,
    },
    entryTitle: {
    
    },
    entryDate: {
      color: '#555',
    },
    entrySubtitle: {
      fontStyle: 'italic' as const,
      color: '#444',
    },
    bulletList: {
      paddingLeft: '18px',
      margin: '4px 0 0 0',
    },
    bullet: {
      marginBottom: '3px',
    }
  };

  return (
    <div ref={innerRef} style={styles.page}>
      <header style={styles.header}>
        <div style={styles.fullName}>{cv.header.fullName}</div>
        <div style={styles.contactInfo}>
          {[cv.header.email, cv.header.phone, cv.header.location, cv.header.linkedin, cv.header.portfolio].filter(Boolean).join(' | ')}
        </div>
      </header>

      <main>
        {cv.summary && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Summary</div>
            <p style={{ margin: 0 }}>{cv.summary}</p>
          </section>
        )}

        {cv.skills?.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Skills</div>
            <ul style={styles.skillsList}>
              {cv.skills.map((skill, i) => <li key={i} style={styles.skillItem}>{skill}</li>)}
            </ul>
          </section>
        )}

        {cv.experience?.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Experience</div>
            {cv.experience.map((job, i) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryHeader}>
                  <span style={styles.entryTitle}>{job.title}</span>
                  <span style={styles.entryDate}>{job.startDate} - {job.endDate}</span>
                </div>
                <div style={styles.entrySubtitle}>{job.company}{job.location && `, ${job.location}`}</div>
                <ul style={styles.bulletList}>
                  {job.bullets.map((bullet, j) => <li key={j} style={styles.bullet}>{bullet}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        {cv.projects?.length > 0 && (
           <section style={styles.section}>
            <div style={styles.sectionTitle}>Projects</div>
            {cv.projects.map((proj, i) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryHeader}>
                  <span style={styles.entryTitle}>{proj.name} {proj.role && ` - ${proj.role}`}</span>
                </div>
                 {proj.technologies && <div style={styles.entrySubtitle}>{proj.technologies.join(', ')}</div>}
                <ul style={styles.bulletList}>
                  {proj.bullets.map((bullet, j) => <li key={j} style={styles.bullet}>{bullet}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        {cv.education?.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Education</div>
             {cv.education.map((edu, i) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryHeader}>
                  <span style={styles.entryTitle}>{edu.degree}</span>
                  <span style={styles.entryDate}>{edu.startDate} - {edu.endDate}</span>
                </div>
                <div style={styles.entrySubtitle}>{edu.institution}{edu.location && `, ${edu.location}`} {edu.gpa && `- GPA: ${edu.gpa}`}</div>
                {edu.bullets && edu.bullets.length > 0 && (
                    <ul style={styles.bulletList}>
                    {edu.bullets.map((bullet, j) => <li key={j} style={styles.bullet}>{bullet}</li>)}
                    </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {cv.extracurriculars?.length > 0 && (
           <section style={styles.section}>
            <div style={styles.sectionTitle}>Extracurricular Activities</div>
             {cv.extracurriculars.map((activity, i) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryHeader}>
                    <span style={styles.entryTitle}>{activity.name} {activity.role && ` - ${activity.role}`}</span>
                </div>
                <ul style={styles.bulletList}>
                  {activity.bullets?.map((bullet, j) => <li key={j} style={styles.bullet}>{bullet}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default ResumeTemplate;
