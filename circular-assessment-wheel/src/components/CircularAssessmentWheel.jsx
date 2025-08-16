import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CircularAssessmentWheel = () => {
  // State to track selected grades for each competency (0=F, 1=D, 2=C, 3=B, 4=A, null=unselected)
  const [selectedGrades, setSelectedGrades] = useState({
    research: null,
    concepts: null,
    failFix: null,
    communicate: null,
    evaluate: null
  });

  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [qualificationLevel, setQualificationLevel] = useState('Creative Thinking Qualification Level 5');
  const [isGeneratingWheel, setIsGeneratingWheel] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Competencies configuration - matching your image angles
  const competencies = [
    { key: 'research', label: 'Research', color: '#58D55E', startAngle: -36, endAngle: 36 },
    { key: 'concepts', label: 'Concepts', color: '#FFDC35', startAngle: 36, endAngle: 108 },
    { key: 'failFix', label: 'Fail & Fix', color: '#FF8E25', startAngle: 108, endAngle: 180 },
    { key: 'communicate', label: 'Communicate', color: '#44B2FF', startAngle: 180, endAngle: 252 },
    { key: 'evaluate', label: 'Evaluate', color: '#8B63FF', startAngle: 252, endAngle: 324 }
  ];

  // Grade levels with opacity values and radii
  const grades = [
    { level: 0, label: 'F', opacity: 0.15, innerRadius: 0, outerRadius: 100 },
    { level: 1, label: 'D', opacity: 0.35, innerRadius: 100, outerRadius: 200 },
    { level: 2, label: 'C', opacity: 0.50, innerRadius: 200, outerRadius: 300 },
    { level: 3, label: 'B', opacity: 0.70, innerRadius: 300, outerRadius: 400 },
    { level: 4, label: 'A', opacity: 1.0, innerRadius: 400, outerRadius: 500 }
  ];

  // Rubric descriptions for both qualification levels
  const rubricDescriptions = {
    "Creative Thinking Qualification Level 5": {
      research: {
        4: "Shows motivation and curiosity throughout the process. Analyses the brief to define the problem clearly. Investigates a wide range of reliable secondary sources, potentially primary too. Reflects critically on findings to develop original and relevant personal insights.",
        3: "Demonstrates a good understanding of the brief, identifying its key aspects. Gathers information from a variety of sources. Begins to draw thoughtful connections and summarise key findings.",
        2: "Engages with the brief and highlights important details. Uses a range of sources and makes basic comparisons. Starts to interpret and personalise findings, though connections may still be surface level.",
        1: "Explores a narrow selection of sources with limited questioning. Information gathered tends to reflect commonly known ideas. Limited evidence of deeper interpretation.",
        0: "Lacks purposeful research. Work is disconnected, incomplete, or shows little understanding of the brief or topic."
      },
      concepts: {
        4: "Demonstrates an ability to generate a wide range of original ideas. Uses creative warm-up techniques effectively to explore several directions. Concepts clearly respond to research and are focused on solving the identified problem in imaginative ways.",
        3: "Develops creative ideas through the use of warm-ups and brainstorming strategies. Builds thoughtfully on existing solutions while beginning to introduce original thinking. Ideas show a clear response to the challenge.",
        2: "Generates a small number of ideas based on familiar or existing themes. Uses some creative thinking tools to explore possibilities. Shows occasional imaginative thinking but may not move far beyond the obvious.",
        1: "Produces simple or predictable ideas. Requires support or prompting to explore alternatives or take creative risks. Limited use of creative thinking strategies.",
        0: "No meaningful ideas generated. No engagement with the brief."
      },
      failFix: {
        4: "Responds thoughtfully to feedback. Refines concepts with increasing confidence, showing an ability to stay aligned with the brief. Creative and effective concepts are developed through iteration.",
        3: "Ideas develop in a few directions and there is a willingness to adapt concepts. Some feedback is used to shape changes, and there is evidence of thinking about user needs or purpose.",
        2: "Shows awareness that concepts can develop in different directions. Attempts to make changes but may rely on support to move beyond basic / superficial changes.",
        1: "Makes only minor or surface-level changes. Needs prompting to adjust or improve ideas. Limited evidence of reflection or deeper iteration.",
        0: "No evidence of iteration. Ideas remain unchanged or undeveloped."
      },
      communicate: {
        4: "Communicates ideas clearly and confidently through well-executed work. Uses appropriate visual, verbal, or written methods to present concepts. Demonstrates strong storytelling, a clear link to the original brief and creative intention.",
        3: "Presents work effectively with appropriate use of communication methods. Storytelling is developing and mostly supports the concept. There is a clear effort to engage the audience of their presentation.",
        2: "Process is communicated with some clarity, though delivery may be underdeveloped. Presentation methods are basic and ideas lack clarity, it may need further refinement to aid understanding.",
        1: "Communication is unclear or incomplete. Relies heavily on support to present work. The message is difficult to follow.",
        0: "Lack of communication throughout, work is missing, incomplete, or lacks any meaning."
      },
      evaluate: {
        4: "Reflects thoughtfully on the creative process. Identifies and evaluates the skills used and how choices shaped the outcome. Feedback is considered and used to develop thinking. Clear links are made between decision making and the brief.",
        3: "Considers how well the project meets the brief. Reflects on key decisions. Shows some awareness of how work could be improved or developed further.",
        2: "Reflects on key stages of the process. Comments on strengths and weaknesses, though may lack depth. Shows some awareness of their learning journey.",
        1: "Reflection is vague or superficial. Comments focus on describing what was done, with little or no explanation of decisions or learning.",
        0: "No reflection throughout the process."
      }
    },
    "Creative Thinking Qualification Level 6": {
      research: {
        4: "Demonstrates an independent and highly investigative approach. Confidently explores both primary and secondary sources, identifying unexpected insights that challenge or reshape the initial understanding of the brief. These insights clearly guide and strengthen creative direction.",
        3: "Shows consistent curiosity and ownership of the research process. Selects relevant primary and secondary sources with care. Compares and connects findings to inform early creative choices. Research is purposeful and clearly learner-led.",
        2: "Research is based on primary and secondary sources aided by guided prompts. Begins to make links between research and the brief, though interpretations may lack depth. Shows emerging independence in how research is applied.",
        1: "Relies mainly on secondary sources and surface level findings from primary research with limited to no analysis. Insight is vague or undeveloped, and needs support to begin connecting research to the brief.",
        0: "Research is minimal and incomplete. No meaningful insight is drawn due to gaps in the research process."
      },
      concepts: {
        4: "Generates a range of bold, original ideas that push creative boundaries. Uses insight and research evidence to shape and strengthen concepts. Comfortable navigating uncertainty and taking creative risks. A clear 'golden thread' links the concept to deeper meaning and purpose.",
        3: "Develops a range of creative ideas, which challenge familiar thinking. Willing to take creative risks in parts. Insights meaningfully influence the direction of the concept, showing emerging depth and purpose.",
        2: "Begins to move beyond obvious or conventional ideas. Creative risk-taking is limited or cautious. Needs guidance to develop ideas further or explore less familiar directions. Insight is present but not fully integrated into concept development.",
        1: "Presents one main idea that feels safe or predictable. Shows hesitance to explore new or unfamiliar possibilities. Limited evidence of creative development or deeper thinking.",
        0: "No real meaningful ideas generated or explored. Lacks engagement with the creative process."
      },
      failFix: {
        4: "Independently tests, reflects, and refines ideas. Uses both peer / external feedback and self reflection to make purposeful improvements. Actively embraces failure as part of the process and adjusts concepts in line with the brief. Iteration is purposeful and meaningful.",
        3: "Confident testing and refining of ideas. Reflection on peer / external feedback leading to a growing understanding of iteration. Makes considered changes in response to the brief. Has an ability to explore uncertainty with purpose.",
        2: "Shows a willingness to change direction. Makes some adjustments, but changes may be minimal or cautious. Feedback is acknowledged but not always integrated meaningfully. Tends to stay within safe or familiar territory during testing.",
        1: "Avoids change unless directly prompted. Revisions lack depth or purpose. Iteration feels uncertain or directionless.",
        0: "Ideas remain largely unchanged. No reflection or adaptation is evident in the process."
      },
      communicate: {
        4: "Communicates with clarity, confidence, and creativity throughout. Uses a range of appropriate and engaging methods to prepare and deliver a compelling story. Final presentation shows a strong personal voice and attention to detail. It is memorable and makes the audience \"feel\" something.",
        3: "Communicates ideas clearly with effective storytelling and appropriate presentation methods. Final presentation demonstrates a personal and motivated approach.",
        2: "Presents work with clarity. Communication may lack impact and have gaps in the story. Message is understandable but not yet refined. Needs further development to become engaging or persuasive.",
        1: "Ideas are poorly communicated. Presentation lacks structure or clarity. Needs considerable guidance to articulate creative intention.",
        0: "No meaningful communication is present. Work fails to convey the concept or creative process."
      },
      evaluate: {
        4: "Evaluates every stage of the process with depth and clarity. Reflects critically on what worked, what didn't, and why. Feedback and self-awareness are used to shape outcomes. Shows ownership of personal growth and learning throughout.",
        3: "Offers thoughtful reflection across the project. Analyses key decisions and begins to justify them. Feedback is considered. Shows emerging understanding of how choices contributed to development and outcome.",
        2: "Provides basic reflection on the process. Aware of stages and decisions made but may not fully explain reasoning. Reflection tends to respond to prompting rather than being independently driven.",
        1: "Reflection is limited and mostly descriptive. Decisions are acknowledged but not evaluated. Shows minimal engagement with learning or growth.",
        0: "No meaningful reflection offered. Lacks insight into process, learning, or outcomes."
      }
    }
  };

  // Handle segment click
  const handleSegmentClick = (competencyKey, gradeLevel) => {
    setSelectedGrades(prev => ({
      ...prev,
      [competencyKey]: gradeLevel
    }));
  };

  // Handle clear all
  const handleClearAll = () => {
    setSelectedGrades({
      research: null,
      concepts: null,
      failFix: null,
      communicate: null,
      evaluate: null
    });
    setStudentName('');
    setProjectName('');
    setQualificationLevel('Creative Thinking Qualification Level 5');
    setFeedback('');
  };

  // Generate path for a segment
  const generateSegmentPath = (innerRadius, outerRadius, startAngle, endAngle) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = innerRadius * Math.cos(startAngleRad);
    const y1 = innerRadius * Math.sin(startAngleRad);
    const x2 = outerRadius * Math.cos(startAngleRad);
    const y2 = outerRadius * Math.sin(startAngleRad);
    
    const x3 = outerRadius * Math.cos(endAngleRad);
    const y3 = outerRadius * Math.sin(endAngleRad);
    const x4 = innerRadius * Math.cos(endAngleRad);
    const y4 = innerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    if (innerRadius === 0) {
      // For the center circle (F grade)
      return `M 0 0 L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} Z`;
    }
    
    return `M ${x1} ${y1} 
            L ${x2} ${y2} 
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
            L ${x4} ${y4} 
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`;
  };

  // Get segment opacity
  const getSegmentOpacity = (competencyKey, gradeLevel) => {
    const selectedGrade = selectedGrades[competencyKey];
    
    if (selectedGrade === null) {
      // No grade selected - show hover if applicable
      if (hoveredSegment && hoveredSegment.competency === competencyKey && hoveredSegment.grade === gradeLevel) {
        return grades[gradeLevel].opacity;
      }
      return 0;
    }
    
    if (gradeLevel <= selectedGrade) {
      // This grade and lower grades are filled
      return grades[gradeLevel].opacity;
    }
    
    // Higher grades show hover if applicable
    if (hoveredSegment && hoveredSegment.competency === competencyKey && hoveredSegment.grade === gradeLevel) {
      return grades[gradeLevel].opacity;
    }
    
    return 0;
  };

  // Check if segment should show hover
  const shouldShowHover = (competencyKey, gradeLevel) => {
    const selectedGrade = selectedGrades[competencyKey];
    return selectedGrade === null || gradeLevel > selectedGrade;
  };

  // Get rubric description for a competency and grade
  const getRubricDescription = (competencyKey, gradeLevel) => {
    if (gradeLevel === null) return "Not assessed";
    return rubricDescriptions[qualificationLevel][competencyKey][gradeLevel];
  };

  // Check if all competencies are assessed
  const isFullyAssessed = () => {
    return Object.values(selectedGrades).every(grade => grade !== null);
  };

  // Generate filename for exports
  const generateFilename = (extension) => {
    const student = studentName || 'Student';
    const project = projectName || 'Project';
    const cleanStudent = student.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanProject = project.replace(/[^a-zA-Z0-9]/g, '_');
    return `${cleanStudent}_${cleanProject}_Assessment.${extension}`;
  };

  // Helper functions for input replacement during export
  const replaceInputsForExport = () => {
    document.querySelectorAll('input, select, textarea').forEach((el) => {
      const wrapper = document.createElement('div');
      wrapper.textContent = el.value || el.placeholder || '';
      
      // Copy computed styles
      const computedStyle = window.getComputedStyle(el);
      wrapper.style.fontSize = computedStyle.fontSize;
      wrapper.style.padding = computedStyle.padding;
      wrapper.style.border = 'none'; // Remove borders for clean text
      wrapper.style.borderRadius = computedStyle.borderRadius;
      wrapper.style.width = `${el.offsetWidth}px`;
      wrapper.style.height = `${el.offsetHeight}px`;
      wrapper.style.display = 'block';
      wrapper.style.whiteSpace = 'pre-wrap';  // Preserve line breaks
      wrapper.style.wordWrap = 'break-word';  // Handle long words
      wrapper.style.color = '#171729';
      wrapper.style.backgroundColor = 'transparent'; // No background
      wrapper.style.boxSizing = 'border-box';
      wrapper.style.fontFamily = 'Arial, sans-serif';
      wrapper.style.fontWeight = 'normal';
      
      // Insert replacement and hide original
      el.parentNode.insertBefore(wrapper, el);
      el.style.display = 'none';
      el.setAttribute('data-hidden-temp', 'true');
    });
  };

  const restoreInputsAfterExport = () => {
    document.querySelectorAll('[data-hidden-temp]').forEach((el) => {
      el.style.display = '';
      el.removeAttribute('data-hidden-temp');
      // Remove the temporary wrapper
      if (el.previousSibling && el.previousSibling.tagName === 'DIV') {
        el.previousSibling.remove();
      }
    });
  };

  // Save wheel only (1000x1000px)
  const saveWheelOnly = async () => {
    if (!isFullyAssessed()) return;
    
    setIsGeneratingWheel(true);
    
    try {
      // Create a temporary container for the wheel with labels
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '1000px';
      tempContainer.style.height = '1000px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.display = 'flex';
      tempContainer.style.flexDirection = 'column';
      tempContainer.style.alignItems = 'center';
      tempContainer.style.padding = '40px';
      tempContainer.style.boxSizing = 'border-box';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Add student and project name
      const nameContainer = document.createElement('div');
      nameContainer.style.textAlign = 'center';
      nameContainer.style.marginBottom = '20px';
      
      const studentNameEl = document.createElement('div');
      studentNameEl.textContent = studentName || 'Student Name';
      studentNameEl.style.fontSize = '28px';
      studentNameEl.style.fontWeight = 'bold';
      studentNameEl.style.marginBottom = '10px';
      studentNameEl.style.color = '#171729';
      studentNameEl.style.fontFamily = 'Arial, sans-serif';
      
      const projectNameEl = document.createElement('div');
      projectNameEl.textContent = projectName || 'Project Name';
      projectNameEl.style.fontSize = '20px';
      projectNameEl.style.color = '#171729';
      projectNameEl.style.marginBottom = '10px';
      projectNameEl.style.fontFamily = 'Arial, sans-serif';
      
      const levelEl = document.createElement('div');
      levelEl.textContent = qualificationLevel;
      levelEl.style.fontSize = '14px';
      levelEl.style.color = '#666';
      levelEl.style.fontFamily = 'Arial, sans-serif';
      
      nameContainer.appendChild(studentNameEl);
      nameContainer.appendChild(projectNameEl);
      nameContainer.appendChild(levelEl);
      
      // Clone the SVG wheel
      const originalSvg = document.querySelector('svg');
      const clonedSvg = originalSvg.cloneNode(true);
      clonedSvg.style.width = '750px';
      clonedSvg.style.height = '750px';
      clonedSvg.style.maxWidth = '750px';

// Add simple text legend with color names
const legendField = document.createElement('div');
legendField.textContent = 'Green: Research  |  Yellow: Concepts  |  Orange: Fail & Fix  |  Blue: Communicate  |  Purple: Evaluate';
legendField.style.fontSize = '14px';
legendField.style.color = '#171729';
legendField.style.marginTop = '15px';
legendField.style.textAlign = 'center';
legendField.style.fontFamily = 'Arial, sans-serif';

      // Debug logging
      console.log('Legend container created:', legendContainer);
      console.log('Legend container innerHTML:', legendContainer.innerHTML);

      
      // Add date field at bottom
      const dateField = document.createElement('div');
      dateField.textContent = 'Date: ________________________';
      dateField.style.fontSize = '18px';
      dateField.style.color = '#171729';
      dateField.style.marginTop = '20px';
      dateField.style.textAlign = 'center';
      dateField.style.fontFamily = 'Arial, sans-serif';
      
      tempContainer.appendChild(nameContainer);
      tempContainer.appendChild(clonedSvg);
      tempContainer.appendChild(dateField);
      document.body.appendChild(tempContainer);
      
      // Wait for fonts and styles to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the container
      const canvas = await html2canvas(tempContainer, {
        width: 1000,
        height: 1000,
        backgroundColor: 'white',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        // Force consistent font rendering
        foreignObjectRendering: false
      });
      
      // Download as PNG
      const link = document.createElement('a');
      link.download = generateFilename('png');
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      // Clean up
      document.body.removeChild(tempContainer);
      
    } catch (error) {
      console.error('Error generating wheel image:', error);
      alert('Error generating wheel image. Please try again.');
    } finally {
      setIsGeneratingWheel(false);
    }
  };

  // Save full page as PDF
  const saveFullPagePDF = async () => {
    if (!isFullyAssessed()) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Replace inputs with styled divs for better rendering
      replaceInputsForExport();
      
      // Hide buttons temporarily
      const buttons = document.querySelectorAll('button');
      const originalDisplays = Array.from(buttons).map(btn => btn.style.display);
      buttons.forEach(btn => btn.style.display = 'none');
      
      // Apply consistent font family for better rendering
      const fontStyleEl = document.createElement('style');
      fontStyleEl.textContent = `
        * {
          font-family: 'Arial', sans-serif !important;
        }
      `;
      document.head.appendChild(fontStyleEl);
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture the entire document body
      const canvas = await html2canvas(document.body, {
        height: document.body.scrollHeight,
        width: document.body.scrollWidth,
        backgroundColor: 'white',
        scale: 1.5, // Good quality for PDF
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false, // Better compatibility
        onclone: (clonedDoc) => {
          // Ensure consistent styling in cloned document
          const clonedStyle = clonedDoc.createElement('style');
          clonedStyle.textContent = `
            * {
              font-family: 'Arial', sans-serif !important;
            }
          `;
          clonedDoc.head.appendChild(clonedStyle);
        }
      });
      
      // Clean up style element
      document.head.removeChild(fontStyleEl);
      
      // Restore buttons
      buttons.forEach((btn, index) => {
        btn.style.display = originalDisplays[index];
      });
      
      // Restore original inputs
      restoreInputsAfterExport();
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20; // 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20); // Account for margins
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }
      
      pdf.save(generateFilename('pdf'));
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      
      // Restore everything on error
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => btn.style.display = '');
      restoreInputsAfterExport();
      
      // Remove style element if it exists
      const fontStyleEl = document.querySelector('style[data-temp-export]');
      if (fontStyleEl) {
        fontStyleEl.remove();
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 md:p-8">
      {/* Header with form fields and clear button */}
      <div className="w-full max-w-4xl mb-6 md:mb-8">
        {/* Mobile layout - IMPROVED SPACING */}
        <div className="block md:hidden space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="studentName-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Name of the student
              </label>
              <input
                type="text"
                id="studentName-mobile"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Jane"
                maxLength="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="projectName-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Name of the project
              </label>
              <input
                type="text"
                id="projectName-mobile"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Campaign for Kindness"
                maxLength="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="qualificationLevel-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Select Qualification Level
              </label>
              <select
                id="qualificationLevel-mobile"
                value={qualificationLevel}
                onChange={(e) => setQualificationLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="Creative Thinking Qualification Level 5">Level 5</option>
                <option value="Creative Thinking Qualification Level 6">Level 6</option>
              </select>
            </div>
          </div>
          
          <div>
  <label htmlFor="feedback-mobile" className="block text-sm font-medium text-gray-700 mb-2">
    Add your feedback
  </label>
  <textarea
    id="feedback-mobile"
    value={feedback}
    onChange={(e) => setFeedback(e.target.value)}
    placeholder="Enter your formative assessment feedback here..."
    maxLength="500"
    rows="3"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
  />
</div>
          
          <div className="flex justify-center">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200 text-gray-700"
            >
              Clear All
            </button>
          </div>
          
          {/* Save buttons for mobile */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={saveWheelOnly}
              disabled={!isFullyAssessed() || isGeneratingWheel}
              className={`w-full px-4 py-2 text-sm rounded transition-colors duration-200 flex items-center justify-center space-x-2 ${
                isFullyAssessed() && !isGeneratingWheel
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGeneratingWheel ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving Wheel...</span>
                </>
              ) : (
                <span>Save Wheel</span>
              )}
            </button>
            
            <button
              onClick={saveFullPagePDF}
              disabled={!isFullyAssessed() || isGeneratingPDF}
              className={`w-full px-4 py-2 text-sm rounded transition-colors duration-200 flex items-center justify-center space-x-2 ${
                isFullyAssessed() && !isGeneratingPDF
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving PDF...</span>
                </>
              ) : (
                <span>Save Full PDF</span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop layout - IMPROVED SPACING */}
        <div className="hidden md:flex justify-between items-start">
          {/* Left side - Form fields and Clear button */}
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Name of the student
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Jane"
                  maxLength="50"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
                />
              </div>
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Name of the project
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Campaign for Kindness"
                  maxLength="50"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                />
              </div>
            </div>
            <div>
              <label htmlFor="qualificationLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Select Qualification Level
              </label>
              <select
                id="qualificationLevel"
                value={qualificationLevel}
                onChange={(e) => setQualificationLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-0 w-80"
              >
                <option value="Creative Thinking Qualification Level 5">Creative Thinking Qualification Level 5</option>
                <option value="Creative Thinking Qualification Level 6">Creative Thinking Qualification Level 6</option>
              </select>
            </div>

            <div>
  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
    Add your feedback
  </label>
  <textarea
    id="feedback"
    value={feedback}
    onChange={(e) => setFeedback(e.target.value)}
    placeholder="Enter your formative assessment feedback here..."
    maxLength="500"
    rows="3"
    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-0 w-80 resize-vertical"
  />
</div>
            
            {/* Clear button under form fields */}
            <button
              onClick={handleClearAll}
              className="self-start px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200 text-gray-700 mt-4"
            >
              Clear All
            </button>
          </div>

          {/* Right side - Save buttons */}
          <div className="flex space-x-3">
            <button
              onClick={saveWheelOnly}
              disabled={!isFullyAssessed() || isGeneratingWheel}
              className={`px-4 py-2 text-sm rounded transition-colors duration-200 flex items-center space-x-2 ${
                isFullyAssessed() && !isGeneratingWheel
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGeneratingWheel ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Wheel</span>
              )}
            </button>
            
            <button
              onClick={saveFullPagePDF}
              disabled={!isFullyAssessed() || isGeneratingPDF}
              className={`px-4 py-2 text-sm rounded transition-colors duration-200 flex items-center space-x-2 ${
                isFullyAssessed() && !isGeneratingPDF
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save PDF</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Circular assessment wheel */}
      <div className="w-full max-w-2xl lg:max-w-3xl px-4">
        <svg width="100%" viewBox="0 0 1130 1130" className="max-w-full">
          {/* Interactive segments */}
          {competencies.map((competency) => {
            return grades.map((grade) => {
              const startAngleRad = ((competency.startAngle - 90) * Math.PI) / 180;
              const endAngleRad = ((competency.endAngle - 90) * Math.PI) / 180;
              
              const x1 = 565 + grade.innerRadius * Math.cos(startAngleRad);
              const y1 = 565 + grade.innerRadius * Math.sin(startAngleRad);
              const x2 = 565 + grade.outerRadius * Math.cos(startAngleRad);
              const y2 = 565 + grade.outerRadius * Math.sin(startAngleRad);
              
              const x3 = 565 + grade.outerRadius * Math.cos(endAngleRad);
              const y3 = 565 + grade.outerRadius * Math.sin(endAngleRad);
              const x4 = 565 + grade.innerRadius * Math.cos(endAngleRad);
              const y4 = 565 + grade.innerRadius * Math.sin(endAngleRad);
              
              const largeArcFlag = competency.endAngle - competency.startAngle <= 180 ? "0" : "1";
              
              let segmentPath;
              if (grade.innerRadius === 0) {
                // For the center circle (F grade)
                segmentPath = `M 565 565 L ${x2} ${y2} A ${grade.outerRadius} ${grade.outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} Z`;
              } else {
                segmentPath = `M ${x1} ${y1} 
                        L ${x2} ${y2} 
                        A ${grade.outerRadius} ${grade.outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
                        L ${x4} ${y4} 
                        A ${grade.innerRadius} ${grade.innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`;
              }
              
              const opacity = getSegmentOpacity(competency.key, grade.level);
              
              return (
                <path
                  key={`${competency.key}-${grade.level}`}
                  d={segmentPath}
                  fill={competency.color}
                  fillOpacity={opacity}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleSegmentClick(competency.key, grade.level)}
                  onMouseEnter={() => {
                    if (shouldShowHover(competency.key, grade.level)) {
                      setHoveredSegment({ competency: competency.key, grade: grade.level });
                    }
                  }}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              );
            });
          })}

          {/* Grade Labels (A to F inside Research area) */}
          <g className="pointer-events-none select-none">
            <text x="565" y="115" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#171729">A</text>
            <text x="565" y="215" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#171729">B</text>
            <text x="565" y="315" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#171729">C</text>
            <text x="565" y="415" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#171729">D</text>
            <text x="565" y="515" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#171729">F</text>
          </g>
        </svg>
      </div>

      {/* Status display - UPDATED LAYOUT */}
      <div className="mt-6 md:mt-8 w-full max-w-6xl px-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">Assessment Status</h3>
        <div className="space-y-4">
          {competencies.map((competency) => {
            const selectedGrade = selectedGrades[competency.key];
            const gradeLabel = selectedGrade !== null ? grades[selectedGrade].label : 'Not assessed';
            const rubricDescription = getRubricDescription(competency.key, selectedGrade);
            
            return (
              <div key={competency.key} className="bg-white rounded-lg shadow-md p-4 md:p-6">
                {/* Top row - Competency name, dot, and grade on same line */}
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: competency.color }}
                  ></div>
                  <div className="text-lg font-semibold text-gray-900">{competency.label}</div>
                  <div className="text-2xl font-bold text-gray-900 ml-auto">{gradeLabel}</div>
                </div>
                
                {/* Bottom row - Description takes full width */}
                <div className="mt-3">
                  <p className={`text-sm leading-relaxed ${selectedGrade !== null ? 'text-gray-700' : 'text-gray-500 italic'}`}>
                    {rubricDescription}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CircularAssessmentWheel;
