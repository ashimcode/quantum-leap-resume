# LinkedIn-only public claim audit

Reconciliation: v1.2.1, November 5, 2026.

## Sole factual authority

The candidate supplied the canonical LinkedIn specification in the v1.2.1 instruction. It is the only authority for career, education, projects, certifications and skills. Public URLs identify LinkedIn sections; this pass does not claim independently scraped or independently certified profile facts. All public factual copy, approved answers and the generated public PDF derive from src/data/verifiedSources.ts. Generic navigation, decorative visuals and the fictional CRT game are not career claims.

## Exact inventory and changes

- Six roles, three education entries, five credentials, three projects and five top skills.
- Headline: M.S Cybersecurity Risk & Management Compliance Student. About: Translating technical vulnerabilities into actionable business strategies and ethical AI deployment.
- Robotics dates now follow LinkedIn: Aug 2025 – Dec 2025. AI Training Evaluator dates: Sep 2026 – Present. Apex dates: Oct 2024 – Present.
- Master's entry is In-Progress, Aug 2026 – May 2028. Bachelor's entry is currently pursued, 2023 – 2027. No awarded graduate/undergraduate degree is inferred.
- Published grades 3.4 and 3.2 are explicitly authorized in the canonical specification. Phone, street address and personal email remain excluded.
- Credentials are precisely the five LinkedIn titles and issue dates. Fiber Optics is a high-school skill, not an extra certification.
- Project Hedgehog leads the three-project list. Goldman Sachs challenge lists both 1st Place and 2nd Place Creativity Awards, not employment. No HIA/Hedgehog award is inferred.
- Former resume/repository/candidate-confirmation sources, old projects, extra roles, extra credentials and standalone honors are removed as current career evidence. Negative regression questions keep their names solely to verify refusal.
- The public resume was regenerated as a three-page LinkedIn-aligned document and each rendered page was visually reviewed.
- Every factual field below maps to the canonical LinkedIn section ID. Original-source line numbers are not available and are not fabricated.

## Canonical field-to-source map

| Claim / approved answer | Exact field | LinkedIn source |
| --- | --- | --- |
| Ashim John | `verifiedSources.candidate.name` | linkedin-profile / linkedin-education |
| He/Him | `verifiedSources.candidate.pronouns` | linkedin-profile / linkedin-education |
| M.S Cybersecurity Risk & Management Compliance Student | `verifiedSources.candidate.target` | linkedin-profile / linkedin-education |
| M.S Cybersecurity Risk & Management Compliance Student | `verifiedSources.candidate.headline` | linkedin-profile / linkedin-education |
| University at Albany  /  ASIS&T | `verifiedSources.candidate.affiliation` | linkedin-profile / linkedin-education |
| Translating technical vulnerabilities into actionable business strategies and ethical AI deployment. | `verifiedSources.candidate.summary` | linkedin-profile / linkedin-education |
| Master of Science, Cyber Risk Management & Compliance — University at Albany | `verifiedSources.candidate.education` | linkedin-profile / linkedin-education |
| Aug 2026 – May 2028 · In-Progress · Combined 4+1 B.S./M.S. program | `verifiedSources.candidate.educationStatus` | linkedin-profile / linkedin-education |
| Albany, New York Metropolitan Area | `verifiedSources.candidate.location` | linkedin-profile / linkedin-education |
| https://www.linkedin.com/in/johnashim/ | `verifiedSources.candidate.links.linkedin` | linkedin-profile / linkedin-education |
| /resume-public.pdf | `verifiedSources.candidate.links.resume` | linkedin-profile / linkedin-education |
| Security Information and Event Management (SIEM) | `verifiedSources.candidate.skills.0` | linkedin-profile / linkedin-education |
| Identity and Access Management (IAM) | `verifiedSources.candidate.skills.1` | linkedin-profile / linkedin-education |
| Threat Modeling & Frameworks | `verifiedSources.candidate.skills.2` | linkedin-profile / linkedin-education |
| Linux | `verifiedSources.candidate.skills.3` | linkedin-profile / linkedin-education |
| Amazon Web Services (AWS) | `verifiedSources.candidate.skills.4` | linkedin-profile / linkedin-education |
| Graduate Secretary | `verifiedSources.experience.0.title` | linkedin-experience |
| ASIS&T | `verifiedSources.experience.0.organization` | linkedin-experience |
| Part-time | `verifiedSources.experience.0.employmentType` | linkedin-experience |
| Sep 2026 – Present | `verifiedSources.experience.0.dates` | linkedin-experience |
| Albany, New York, United States · Hybrid | `verifiedSources.experience.0.location` | linkedin-experience |
| Elected as Graduate Secretary for the 2026–2027 ASIS&T UAlbany Chapter E-Board, demonstrating leadership and commitment. | `verifiedSources.experience.0.bullets.0` | linkedin-experience |
| Prepared detailed meeting minutes to document discussions, decisions, and action items for effective communication. | `verifiedSources.experience.0.bullets.1` | linkedin-experience |
| Managed chapter records and tracked attendance using Google Forms, Google Drive, Microsoft Teams, and SharePoint. | `verifiedSources.experience.0.bullets.2` | linkedin-experience |
| Organized shared files and coordinated follow-up communication to ensure continuity of chapter operations. | `verifiedSources.experience.0.bullets.3` | linkedin-experience |
| Technical Writing | `verifiedSources.experience.0.skills.0` | linkedin-experience |
| Records Management | `verifiedSources.experience.0.skills.1` | linkedin-experience |
| AI Training Evaluator | `verifiedSources.experience.1.title` | linkedin-experience |
| Handshake AI | `verifiedSources.experience.1.organization` | linkedin-experience |
| Contract | `verifiedSources.experience.1.employmentType` | linkedin-experience |
| Sep 2026 – Present | `verifiedSources.experience.1.dates` | linkedin-experience |
| Remote | `verifiedSources.experience.1.location` | linkedin-experience |
| Evaluated frontier AI models by reviewing and benchmarking AI-generated content against specific user prompts. | `verifiedSources.experience.1.bullets.0` | linkedin-experience |
| Conducted quality assurance through entity tagging and product verification, identifying subtle AI artifacts. | `verifiedSources.experience.1.bullets.1` | linkedin-experience |
| Provided structured feedback to train next-generation large language models, enhancing their performance. | `verifiedSources.experience.1.bullets.2` | linkedin-experience |
| Quality Assurance | `verifiedSources.experience.1.skills.0` | linkedin-experience |
| Artificial Intelligence (AI) | `verifiedSources.experience.1.skills.1` | linkedin-experience |
| Attractions Attendant | `verifiedSources.experience.2.title` | linkedin-experience |
| Apex Entertainment | `verifiedSources.experience.2.organization` | linkedin-experience |
| Part-time | `verifiedSources.experience.2.employmentType` | linkedin-experience |
| Oct 2024 – Present | `verifiedSources.experience.2.dates` | linkedin-experience |
| Albany, New York, United States · On-site | `verifiedSources.experience.2.location` | linkedin-experience |
| Managed daily operations and guest experiences across various attractions including escape rooms and laser tag. | `verifiedSources.experience.2.bullets.0` | linkedin-experience |
| Operated POS systems, processed transactions, and provided assistance to guests to enhance their experience. | `verifiedSources.experience.2.bullets.1` | linkedin-experience |
| Maintained facility readiness through cleaning, restocking, and public-address announcements, ensuring a safe environment. | `verifiedSources.experience.2.bullets.2` | linkedin-experience |
| Event Coordination | `verifiedSources.experience.2.skills.0` | linkedin-experience |
| Customer Service | `verifiedSources.experience.2.skills.1` | linkedin-experience |
| CEHC Work-Study | `verifiedSources.experience.3.title` | linkedin-experience |
| University at Albany | `verifiedSources.experience.3.organization` | linkedin-experience |
| Part-time | `verifiedSources.experience.3.employmentType` | linkedin-experience |
| Sep 2023 – Present | `verifiedSources.experience.3.dates` | linkedin-experience |
| Albany, New York, United States · On-site | `verifiedSources.experience.3.location` | linkedin-experience |
| Developed custom designs using circuit-making tools and Blender, enhancing product innovation. | `verifiedSources.experience.3.bullets.0` | linkedin-experience |
| Operated 3D printers to prototype and fabricate a variety of products, ensuring high-quality outputs. | `verifiedSources.experience.3.bullets.1` | linkedin-experience |
| Transforming concepts into tangible products. | `verifiedSources.experience.3.bullets.2` | linkedin-experience |
| Prototyping | `verifiedSources.experience.3.skills.0` | linkedin-experience |
| 3D Printing | `verifiedSources.experience.3.skills.1` | linkedin-experience |
| Makerspace Intern | `verifiedSources.experience.4.title` | linkedin-experience |
| University at Albany | `verifiedSources.experience.4.organization` | linkedin-experience |
| Internship | `verifiedSources.experience.4.employmentType` | linkedin-experience |
| Jan 2026 – May 2026 | `verifiedSources.experience.4.dates` | linkedin-experience |
| United States · On-site | `verifiedSources.experience.4.location` | linkedin-experience |
| Assisted in the operation of the CEHC Makerspace, facilitating hands-on creative projects with peers. | `verifiedSources.experience.4.bullets.0` | linkedin-experience |
| Supported activities including 3D modeling, 3D printing, to enhance student learning. | `verifiedSources.experience.4.bullets.1` | linkedin-experience |
| Engaged in custom apparel printing and basic prototyping, fostering innovation and creativity. | `verifiedSources.experience.4.bullets.2` | linkedin-experience |
| Developed skills in electronics and creative design, contributing to a collaborative environment. | `verifiedSources.experience.4.bullets.3` | linkedin-experience |
| "Grad Danes" — 2026 Graduation Trinket Finale Product | `verifiedSources.experience.4.artifact` | linkedin-experience |
| Prototyping | `verifiedSources.experience.4.skills.0` | linkedin-experience |
| 3D Printing | `verifiedSources.experience.4.skills.1` | linkedin-experience |
| Drones Lab and Robotics Intern | `verifiedSources.experience.5.title` | linkedin-experience |
| University at Albany | `verifiedSources.experience.5.organization` | linkedin-experience |
| Internship | `verifiedSources.experience.5.employmentType` | linkedin-experience |
| Aug 2025 – Dec 2025 | `verifiedSources.experience.5.dates` | linkedin-experience |
| Albany, New York, United States · On-site | `verifiedSources.experience.5.location` | linkedin-experience |
| Diagnosed, repaired, and maintained drones and RoboMaster systems at the UAlbany Drone Lab. | `verifiedSources.experience.5.bullets.0` | linkedin-experience |
| Conducted routine maintenance and testing to ensure optimal performance of devices. | `verifiedSources.experience.5.bullets.1` | linkedin-experience |
| Assisted with outreach events, demonstrating drone technology and robotics to visitors. | `verifiedSources.experience.5.bullets.2` | linkedin-experience |
| Hardware Troubleshooting | `verifiedSources.experience.5.skills.0` | linkedin-experience |
| Drone Maintenance | `verifiedSources.experience.5.skills.1` | linkedin-experience |
| University at Albany | `verifiedSources.education.0.institution` | linkedin-education |
| Master of Science, Cyber Risk Management & Compliance | `verifiedSources.education.0.degree` | linkedin-education |
| Aug 2026 – May 2028 | `verifiedSources.education.0.dates` | linkedin-education |
| In-Progress | `verifiedSources.education.0.grade` | linkedin-education |
| Graduate component of the university's combined 4+1 B.S./M.S. program. | `verifiedSources.education.0.details` | linkedin-education |
| University at Albany | `verifiedSources.education.1.institution` | linkedin-education |
| Bachelor of Science - BS, Cybersecurity (Defense) | `verifiedSources.education.1.degree` | linkedin-education |
| 2023 – 2027 | `verifiedSources.education.1.dates` | linkedin-education |
| 3.4 | `verifiedSources.education.1.grade` | linkedin-education |
| Currently pursuing a Bachelor of Science in Cybersecurity (Defensive) as part of the combined 4+1 B.S./M.S. program. | `verifiedSources.education.1.details` | linkedin-education |
| Chelsea Career And Technical Education High School | `verifiedSources.education.2.institution` | linkedin-education |
| High School Diploma, C-Tech | `verifiedSources.education.2.degree` | linkedin-education |
| Sep 2019 – Jun 2023 | `verifiedSources.education.2.dates` | linkedin-education |
| 3.2 | `verifiedSources.education.2.grade` | linkedin-education |
| Completed hands-on C-Tech training in telecommunications. | `verifiedSources.education.2.details` | linkedin-education |
| Fiber Optics | `verifiedSources.education.2.skills.0` | linkedin-education |
| Telecommunications Systems | `verifiedSources.education.2.skills.1` | linkedin-education |
| Wireless Technician | `verifiedSources.certifications.0.title` | linkedin-certifications |
| C-Tech Associates Inc. | `verifiedSources.certifications.0.issuer` | linkedin-certifications |
| Jun 2023 | `verifiedSources.certifications.0.issued` | linkedin-certifications |
| Wireless Networking | `verifiedSources.certifications.0.skills.0` | linkedin-certifications |
| 5G | `verifiedSources.certifications.0.skills.1` | linkedin-certifications |
| Grounding and Bonding Technician | `verifiedSources.certifications.1.title` | linkedin-certifications |
| C-Tech Associates Inc. | `verifiedSources.certifications.1.issuer` | linkedin-certifications |
| Jun 2023 | `verifiedSources.certifications.1.issued` | linkedin-certifications |
| National Electrical Code | `verifiedSources.certifications.1.skills.0` | linkedin-certifications |
| Electrical Safety | `verifiedSources.certifications.1.skills.1` | linkedin-certifications |
| Network Cabling Specialist Copper Systems | `verifiedSources.certifications.2.title` | linkedin-certifications |
| C-Tech Associates Inc. | `verifiedSources.certifications.2.issuer` | linkedin-certifications |
| Jun 2023 | `verifiedSources.certifications.2.issued` | linkedin-certifications |
| Structured Cabling | `verifiedSources.certifications.2.skills.0` | linkedin-certifications |
| Copper Cabling | `verifiedSources.certifications.2.skills.1` | linkedin-certifications |
| Telecommunications Technologies | `verifiedSources.certifications.3.title` | linkedin-certifications |
| C-Tech Associates Inc. | `verifiedSources.certifications.3.issuer` | linkedin-certifications |
| Jun 2023 | `verifiedSources.certifications.3.issued` | linkedin-certifications |
| Telecommunications | `verifiedSources.certifications.3.skills.0` | linkedin-certifications |
| Home Networking | `verifiedSources.certifications.3.skills.1` | linkedin-certifications |
| sUAS Trust Certificate | `verifiedSources.certifications.4.title` | linkedin-certifications |
| Federal Aviation Administration | `verifiedSources.certifications.4.issuer` | linkedin-certifications |
| Aug 2026 | `verifiedSources.certifications.4.issued` | linkedin-certifications |
| Project Hedgehog | `verifiedSources.projects.0.title` | linkedin-projects |
| Oct 2026 – Present | `verifiedSources.projects.0.dates` | linkedin-projects |
| Handshake AI | `verifiedSources.projects.0.association` | linkedin-projects |
| LinkedIn-listed project | `verifiedSources.projects.0.status` | linkedin-projects |
| Multimodal generative AI data collection and evaluation. | `verifiedSources.projects.0.summary` | linkedin-projects |
| Test and refine advanced generative AI models, focusing on multimodal capabilities. | `verifiedSources.projects.0.problem` | linkedin-projects |
| Collaborated on a high-impact AI data collection and evaluation initiative (Project Hedgehog) to test and refine advanced generative AI models, focusing on multimodal capabilities. Acted as a quality inspector to analyze, grade, and optimize model performance based on strict instruction-following, technical accuracy, and visual/audio alignment. | `verifiedSources.projects.0.contribution` | linkedin-projects |
| Analyzed, graded, and optimized model performance based on strict instruction-following, technical accuracy, and visual/audio alignment. | `verifiedSources.projects.0.outcome` | linkedin-projects |
| Data Annotation | `verifiedSources.projects.0.tools.0` | linkedin-projects |
| Generative AI | `verifiedSources.projects.0.tools.1` | linkedin-projects |
| Only the LinkedIn-listed contribution is described. No additional deployment, adoption, or measured-performance result is claimed. | `verifiedSources.projects.0.boundary` | linkedin-projects |
| College Access AI Development Project: HIA AI | `verifiedSources.projects.1.title` | linkedin-projects |
| Feb 2023 – Jun 2023 | `verifiedSources.projects.1.dates` | linkedin-projects |
| Chelsea Career And Technical Education High School | `verifiedSources.projects.1.association` | linkedin-projects |
| LinkedIn-listed project | `verifiedSources.projects.1.status` | linkedin-projects |
| College selection and financial-aid access with privacy-aware AI design. | `verifiedSources.projects.1.summary` | linkedin-projects |
| Improve student access to financial aid and college selection. | `verifiedSources.projects.1.problem` | linkedin-projects |
| Collaborated with engineering teams to design and test an AI-based platform intended to improve student access to financial aid and college selection. Considered data privacy, ethical AI deployment, and risks affecting vulnerable users, translating those concerns into safer system design. | `verifiedSources.projects.1.contribution` | linkedin-projects |
| Translated data privacy, ethical AI deployment, and vulnerable-user risk concerns into safer system design. | `verifiedSources.projects.1.outcome` | linkedin-projects |
| Artificial Intelligence (AI) | `verifiedSources.projects.1.tools.0` | linkedin-projects |
| Data Privacy | `verifiedSources.projects.1.tools.1` | linkedin-projects |
| Only the LinkedIn-listed contribution is described. No additional deployment, adoption, or measured-performance result is claimed. | `verifiedSources.projects.1.boundary` | linkedin-projects |
| AI and VR Forecasting Challenge: Goldman Sachs | `verifiedSources.projects.2.title` | linkedin-projects |
| Jan 2023 – May 2023 | `verifiedSources.projects.2.dates` | linkedin-projects |
| Chelsea Career And Technical Education High School | `verifiedSources.projects.2.association` | linkedin-projects |
| 1st Place and 2nd Place Creativity Awards | `verifiedSources.projects.2.status` | linkedin-projects |
| Emerging industry trends, macroeconomic shifts, and emerging-market data. | `verifiedSources.projects.2.summary` | linkedin-projects |
| Forecast emerging industry trends by analyzing macroeconomic shifts and emerging-market data. | `verifiedSources.projects.2.problem` | linkedin-projects |
| Developed an AI and VR project to forecast emerging industry trends by analyzing macroeconomic shifts and emerging-market data. Evaluated how rapid technological and economic expansion can introduce new risk vectors before established security frameworks are in place. Received the 1st Place and 2nd Place Creativity Awards. | `verifiedSources.projects.2.contribution` | linkedin-projects |
| Received the 1st Place and 2nd Place Creativity Awards. | `verifiedSources.projects.2.outcome` | linkedin-projects |
| Virtual Reality (VR) | `verifiedSources.projects.2.tools.0` | linkedin-projects |
| Artificial Intelligence (AI) | `verifiedSources.projects.2.tools.1` | linkedin-projects |
| Only the LinkedIn-listed contribution is described. No additional deployment, adoption, or measured-performance result is claimed. | `verifiedSources.projects.2.boundary` | linkedin-projects |
| Cyber risk study & listed security skills | `verifiedSources.capabilities.0.title` | linkedin-education / linkedin-profile |
| M.S. Cyber Risk Management & Compliance study at University at Albany, with SIEM, IAM, threat modeling, Linux, and AWS listed as top skills. | `verifiedSources.capabilities.0.proof` | linkedin-education / linkedin-profile |
| Cyber risk | `verifiedSources.capabilities.0.tags.0` | linkedin-education / linkedin-profile |
| SIEM | `verifiedSources.capabilities.0.tags.1` | linkedin-education / linkedin-profile |
| IAM | `verifiedSources.capabilities.0.tags.2` | linkedin-education / linkedin-profile |
| AI evaluation & ethical deployment | `verifiedSources.capabilities.1.title` | linkedin-experience / linkedin-projects |
| AI Training Evaluator at Handshake AI; multimodal evaluation on Project Hedgehog and privacy-aware college-access design on HIA AI. | `verifiedSources.capabilities.1.proof` | linkedin-experience / linkedin-projects |
| Quality Assurance | `verifiedSources.capabilities.1.tags.0` | linkedin-experience / linkedin-projects |
| Generative AI | `verifiedSources.capabilities.1.tags.1` | linkedin-experience / linkedin-projects |
| Data Privacy | `verifiedSources.capabilities.1.tags.2` | linkedin-experience / linkedin-projects |
| Prototyping & technical operations | `verifiedSources.capabilities.2.title` | linkedin-experience |
| CEHC Work-Study and Makerspace prototyping, plus drone and RoboMaster diagnostics, maintenance, and outreach. | `verifiedSources.capabilities.2.proof` | linkedin-experience |
| Prototyping | `verifiedSources.capabilities.2.tags.0` | linkedin-experience |
| 3D Printing | `verifiedSources.capabilities.2.tags.1` | linkedin-experience |
| Hardware Troubleshooting | `verifiedSources.capabilities.2.tags.2` | linkedin-experience |
| Project Hedgehog — Oct 2026 – Present. Associated with Handshake AI. Collaborated on a high-impact AI data collection and evaluation initiative (Project Hedgehog) to test and refine advanced generative AI models, focusing on multimodal capabilities. Acted as a quality inspector to analyze, grade, and optimize model performance based on strict instruction-following, technical accuracy, and visual/audio alignment. | `verifiedSources.answers.0.text` | Canonical LinkedIn specification; linked page entry |
| Project Hedgehog — Oct 2026 – Present. Associated with Handshake AI. Collaborated on a high-impact AI data collection and evaluation initiative (Project Hedgehog) to test and refine advanced generative AI models, focusing on multimodal capabilities. Acted as a quality inspector to analyze, grade, and optimize model performance based on strict instruction-following, technical accuracy, and visual/audio alignment. Listed skills: Data Annotation, Generative AI. Only the LinkedIn-listed contribution is described. No additional deployment, adoption, or measured-performance result is claimed. | `verifiedSources.answers.0.detail` | Canonical LinkedIn specification; linked page entry |
| College Access AI Development Project: HIA AI — Feb 2023 – Jun 2023. Associated with Chelsea Career And Technical Education High School. Collaborated with engineering teams to design and test an AI-based platform intended to improve student access to financial aid and college selection. Considered data privacy, ethical AI deployment, and risks affecting vulnerable users, translating those concerns into safer system design. | `verifiedSources.answers.1.text` | Canonical LinkedIn specification; linked page entry |
| College Access AI Development Project: HIA AI — Feb 2023 – Jun 2023. Associated with Chelsea Career And Technical Education High School. Collaborated with engineering teams to design and test an AI-based platform intended to improve student access to financial aid and college selection. Considered data privacy, ethical AI deployment, and risks affecting vulnerable users, translating those concerns into safer system design. Listed skills: Artificial Intelligence (AI), Data Privacy. Only the LinkedIn-listed contribution is described. No additional deployment, adoption, or measured-performance result is claimed. | `verifiedSources.answers.1.detail` | Canonical LinkedIn specification; linked page entry |
| AI and VR Forecasting Challenge: Goldman Sachs — Jan 2023 – May 2023. Associated with Chelsea Career And Technical Education High School. Developed an AI and VR project to forecast emerging industry trends by analyzing macroeconomic shifts and emerging-market data. Evaluated how rapid technological and economic expansion can introduce new risk vectors before established security frameworks are in place. Received the 1st Place and 2nd Place Creativity Awards. | `verifiedSources.answers.2.text` | Canonical LinkedIn specification; linked page entry |
| AI and VR Forecasting Challenge: Goldman Sachs — Jan 2023 – May 2023. Associated with Chelsea Career And Technical Education High School. Developed an AI and VR project to forecast emerging industry trends by analyzing macroeconomic shifts and emerging-market data. Evaluated how rapid technological and economic expansion can introduce new risk vectors before established security frameworks are in place. Received the 1st Place and 2nd Place Creativity Awards. Listed skills: Virtual Reality (VR), Artificial Intelligence (AI). Only the LinkedIn-listed contribution is described. No additional deployment, adoption, or measured-performance result is claimed. | `verifiedSources.answers.2.detail` | Canonical LinkedIn specification; linked page entry |
| Graduate Secretary — ASIS&T (Part-time); Sep 2026 – Present; Albany, New York, United States · Hybrid. Elected as Graduate Secretary for the 2026–2027 ASIS&T UAlbany Chapter E-Board, demonstrating leadership and commitment. | `verifiedSources.answers.3.text` | Canonical LinkedIn specification; linked page entry |
| Graduate Secretary — ASIS&T (Part-time); Sep 2026 – Present; Albany, New York, United States · Hybrid. Elected as Graduate Secretary for the 2026–2027 ASIS&T UAlbany Chapter E-Board, demonstrating leadership and commitment. Prepared detailed meeting minutes to document discussions, decisions, and action items for effective communication. Managed chapter records and tracked attendance using Google Forms, Google Drive, Microsoft Teams, and SharePoint. Organized shared files and coordinated follow-up communication to ensure continuity of chapter operations. Listed skills: Technical Writing, Records Management. | `verifiedSources.answers.3.detail` | Canonical LinkedIn specification; linked page entry |
| AI Training Evaluator — Handshake AI (Contract); Sep 2026 – Present; Remote. Evaluated frontier AI models by reviewing and benchmarking AI-generated content against specific user prompts. | `verifiedSources.answers.4.text` | Canonical LinkedIn specification; linked page entry |
| AI Training Evaluator — Handshake AI (Contract); Sep 2026 – Present; Remote. Evaluated frontier AI models by reviewing and benchmarking AI-generated content against specific user prompts. Conducted quality assurance through entity tagging and product verification, identifying subtle AI artifacts. Provided structured feedback to train next-generation large language models, enhancing their performance. Listed skills: Quality Assurance, Artificial Intelligence (AI). | `verifiedSources.answers.4.detail` | Canonical LinkedIn specification; linked page entry |
| Attractions Attendant — Apex Entertainment (Part-time); Oct 2024 – Present; Albany, New York, United States · On-site. Managed daily operations and guest experiences across various attractions including escape rooms and laser tag. | `verifiedSources.answers.5.text` | Canonical LinkedIn specification; linked page entry |
| Attractions Attendant — Apex Entertainment (Part-time); Oct 2024 – Present; Albany, New York, United States · On-site. Managed daily operations and guest experiences across various attractions including escape rooms and laser tag. Operated POS systems, processed transactions, and provided assistance to guests to enhance their experience. Maintained facility readiness through cleaning, restocking, and public-address announcements, ensuring a safe environment. Listed skills: Event Coordination, Customer Service. | `verifiedSources.answers.5.detail` | Canonical LinkedIn specification; linked page entry |
| CEHC Work-Study — University at Albany (Part-time); Sep 2023 – Present; Albany, New York, United States · On-site. Developed custom designs using circuit-making tools and Blender, enhancing product innovation. | `verifiedSources.answers.6.text` | Canonical LinkedIn specification; linked page entry |
| CEHC Work-Study — University at Albany (Part-time); Sep 2023 – Present; Albany, New York, United States · On-site. Developed custom designs using circuit-making tools and Blender, enhancing product innovation. Operated 3D printers to prototype and fabricate a variety of products, ensuring high-quality outputs. Transforming concepts into tangible products. Listed skills: Prototyping, 3D Printing. | `verifiedSources.answers.6.detail` | Canonical LinkedIn specification; linked page entry |
| Makerspace Intern — University at Albany (Internship); Jan 2026 – May 2026; United States · On-site. Assisted in the operation of the CEHC Makerspace, facilitating hands-on creative projects with peers. | `verifiedSources.answers.7.text` | Canonical LinkedIn specification; linked page entry |
| Makerspace Intern — University at Albany (Internship); Jan 2026 – May 2026; United States · On-site. Assisted in the operation of the CEHC Makerspace, facilitating hands-on creative projects with peers. Supported activities including 3D modeling, 3D printing, to enhance student learning. Engaged in custom apparel printing and basic prototyping, fostering innovation and creativity. Developed skills in electronics and creative design, contributing to a collaborative environment. Featured artifact: "Grad Danes" — 2026 Graduation Trinket Finale Product. Listed skills: Prototyping, 3D Printing. | `verifiedSources.answers.7.detail` | Canonical LinkedIn specification; linked page entry |
| Drones Lab and Robotics Intern — University at Albany (Internship); Aug 2025 – Dec 2025; Albany, New York, United States · On-site. Diagnosed, repaired, and maintained drones and RoboMaster systems at the UAlbany Drone Lab. | `verifiedSources.answers.8.text` | Canonical LinkedIn specification; linked page entry |
| Drones Lab and Robotics Intern — University at Albany (Internship); Aug 2025 – Dec 2025; Albany, New York, United States · On-site. Diagnosed, repaired, and maintained drones and RoboMaster systems at the UAlbany Drone Lab. Conducted routine maintenance and testing to ensure optimal performance of devices. Assisted with outreach events, demonstrating drone technology and robotics to visitors. Listed skills: Hardware Troubleshooting, Drone Maintenance. | `verifiedSources.answers.8.detail` | Canonical LinkedIn specification; linked page entry |
| University at Albany — Master of Science, Cyber Risk Management & Compliance; Aug 2026 – May 2028. Grade: In-Progress. Graduate component of the university's combined 4+1 B.S./M.S. program. | `verifiedSources.answers.9.text` | Canonical LinkedIn specification; linked page entry |
| University at Albany — Master of Science, Cyber Risk Management & Compliance; Aug 2026 – May 2028. Grade: In-Progress. Graduate component of the university's combined 4+1 B.S./M.S. program. Dates and in-progress status do not establish an awarded degree. | `verifiedSources.answers.9.detail` | Canonical LinkedIn specification; linked page entry |
| University at Albany — Bachelor of Science - BS, Cybersecurity (Defense); 2023 – 2027. Grade: 3.4. Currently pursuing a Bachelor of Science in Cybersecurity (Defensive) as part of the combined 4+1 B.S./M.S. program. | `verifiedSources.answers.10.text` | Canonical LinkedIn specification; linked page entry |
| University at Albany — Bachelor of Science - BS, Cybersecurity (Defense); 2023 – 2027. Grade: 3.4. Currently pursuing a Bachelor of Science in Cybersecurity (Defensive) as part of the combined 4+1 B.S./M.S. program. Dates and in-progress status do not establish an awarded degree. | `verifiedSources.answers.10.detail` | Canonical LinkedIn specification; linked page entry |
| Chelsea Career And Technical Education High School — High School Diploma, C-Tech; Sep 2019 – Jun 2023. Grade: 3.2. Completed hands-on C-Tech training in telecommunications. | `verifiedSources.answers.11.text` | Canonical LinkedIn specification; linked page entry |
| Chelsea Career And Technical Education High School — High School Diploma, C-Tech; Sep 2019 – Jun 2023. Grade: 3.2. Completed hands-on C-Tech training in telecommunications. Listed skills: Fiber Optics, Telecommunications Systems. Dates and in-progress status do not establish an awarded degree. | `verifiedSources.answers.11.detail` | Canonical LinkedIn specification; linked page entry |
| Wireless Technician — C-Tech Associates Inc.; issued Jun 2023. | `verifiedSources.answers.12.text` | Canonical LinkedIn specification; linked page entry |
| Wireless Technician — C-Tech Associates Inc.; issued Jun 2023. Listed skills: Wireless Networking, 5G. Only this listed credential and its stated scope are supported. | `verifiedSources.answers.12.detail` | Canonical LinkedIn specification; linked page entry |
| Grounding and Bonding Technician — C-Tech Associates Inc.; issued Jun 2023. | `verifiedSources.answers.13.text` | Canonical LinkedIn specification; linked page entry |
| Grounding and Bonding Technician — C-Tech Associates Inc.; issued Jun 2023. Listed skills: National Electrical Code, Electrical Safety. Only this listed credential and its stated scope are supported. | `verifiedSources.answers.13.detail` | Canonical LinkedIn specification; linked page entry |
| Network Cabling Specialist Copper Systems — C-Tech Associates Inc.; issued Jun 2023. | `verifiedSources.answers.14.text` | Canonical LinkedIn specification; linked page entry |
| Network Cabling Specialist Copper Systems — C-Tech Associates Inc.; issued Jun 2023. Listed skills: Structured Cabling, Copper Cabling. Only this listed credential and its stated scope are supported. | `verifiedSources.answers.14.detail` | Canonical LinkedIn specification; linked page entry |
| Telecommunications Technologies — C-Tech Associates Inc.; issued Jun 2023. | `verifiedSources.answers.15.text` | Canonical LinkedIn specification; linked page entry |
| Telecommunications Technologies — C-Tech Associates Inc.; issued Jun 2023. Listed skills: Telecommunications, Home Networking. Only this listed credential and its stated scope are supported. | `verifiedSources.answers.15.detail` | Canonical LinkedIn specification; linked page entry |
| sUAS Trust Certificate — Federal Aviation Administration; issued Aug 2026. | `verifiedSources.answers.16.text` | Canonical LinkedIn specification; linked page entry |
| sUAS Trust Certificate — Federal Aviation Administration; issued Aug 2026. Only this listed credential and its stated scope are supported. | `verifiedSources.answers.16.detail` | Canonical LinkedIn specification; linked page entry |
| Ashim John lists the headline M.S Cybersecurity Risk & Management Compliance Student. Translating technical vulnerabilities into actionable business strategies and ethical AI deployment. | `verifiedSources.answers.17.text` | Canonical LinkedIn specification; linked page entry |
| Ashim John lists the headline M.S Cybersecurity Risk & Management Compliance Student, with University at Albany  /  ASIS&T affiliation. His LinkedIn specification includes cyber risk study, AI model evaluation at Handshake AI, and prototyping and drone maintenance roles. The top skills are Security Information and Event Management (SIEM), Identity and Access Management (IAM), Threat Modeling & Frameworks, Linux, Amazon Web Services (AWS). These are listed skills, not claims of a particular proficiency level or production implementation. | `verifiedSources.answers.17.detail` | Canonical LinkedIn specification; linked page entry |
| LinkedIn lists these top skills: Security Information and Event Management (SIEM); Identity and Access Management (IAM); Threat Modeling & Frameworks; Linux; Amazon Web Services (AWS). | `verifiedSources.answers.18.text` | Canonical LinkedIn specification; linked page entry |
| LinkedIn lists these five top skills: Security Information and Event Management (SIEM); Identity and Access Management (IAM); Threat Modeling & Frameworks; Linux; Amazon Web Services (AWS). A listed skill does not establish an additional certification, a deployment, a proficiency level, or a measured result. Role-specific and credential-specific skills are listed with their respective entries. | `verifiedSources.answers.18.detail` | Canonical LinkedIn specification; linked page entry |
| Elected as Graduate Secretary for the 2026–2027 ASIS&T UAlbany Chapter E-Board, demonstrating leadership and commitment. | `verifiedSources.answers.19.text` | Canonical LinkedIn specification; linked page entry |
| Elected as Graduate Secretary for the 2026–2027 ASIS&T UAlbany Chapter E-Board, demonstrating leadership and commitment. Prepared detailed meeting minutes to document discussions, decisions, and action items for effective communication. Managed chapter records and tracked attendance using Google Forms, Google Drive, Microsoft Teams, and SharePoint. Organized shared files and coordinated follow-up communication to ensure continuity of chapter operations. Listed skills: Technical Writing, Records Management. | `verifiedSources.answers.19.detail` | Canonical LinkedIn specification; linked page entry |
| LinkedIn-listed contributions include multimodal AI quality inspection on Project Hedgehog, privacy-aware college-access AI design, and an AI/VR forecasting project that received the 1st Place and 2nd Place Creativity Awards. | `verifiedSources.answers.20.text` | Canonical LinkedIn specification; linked page entry |
| Project Hedgehog involved instruction-following, technical accuracy, and visual/audio alignment evaluation. HIA AI translated privacy and vulnerable-user risk concerns into safer system design. The Goldman Sachs challenge received the 1st Place and 2nd Place Creativity Awards. No numeric performance improvement, cost saving, or deployment result is supplied. | `verifiedSources.answers.20.detail` | Canonical LinkedIn specification; linked page entry |
| The three LinkedIn projects are Project Hedgehog (Oct 2026 – Present), College Access AI Development Project: HIA AI (Feb 2023 – Jun 2023), and AI and VR Forecasting Challenge: Goldman Sachs (Jan 2023 – May 2023). | `verifiedSources.answers.21.text` | Canonical LinkedIn specification; linked page entry |
| Project Hedgehog is associated with Handshake AI and lists Data Annotation and Generative AI. HIA AI and the Goldman Sachs challenge are associated with Chelsea Career And Technical Education High School. HIA AI lists Artificial Intelligence (AI) and Data Privacy. The challenge lists Virtual Reality (VR) and Artificial Intelligence (AI) and received the 1st Place and 2nd Place Creativity Awards. | `verifiedSources.answers.21.detail` | Canonical LinkedIn specification; linked page entry |
| The six LinkedIn roles are Graduate Secretary at ASIS&T; AI Training Evaluator at Handshake AI; Attractions Attendant at Apex Entertainment; CEHC Work-Study at University at Albany; Makerspace Intern at University at Albany; Drones Lab and Robotics Intern at University at Albany. | `verifiedSources.answers.22.text` | Canonical LinkedIn specification; linked page entry |
| Graduate Secretary — ASIS&T (Part-time); Sep 2026 – Present; Albany, New York, United States · Hybrid. AI Training Evaluator — Handshake AI (Contract); Sep 2026 – Present; Remote. Attractions Attendant — Apex Entertainment (Part-time); Oct 2024 – Present; Albany, New York, United States · On-site. CEHC Work-Study — University at Albany (Part-time); Sep 2023 – Present; Albany, New York, United States · On-site. Makerspace Intern — University at Albany (Internship); Jan 2026 – May 2026; United States · On-site. Drones Lab and Robotics Intern — University at Albany (Internship); Aug 2025 – Dec 2025; Albany, New York, United States · On-site. | `verifiedSources.answers.22.detail` | Canonical LinkedIn specification; linked page entry |
| The three education entries are a Master of Science in Cyber Risk Management & Compliance and Bachelor of Science - BS, Cybersecurity (Defense) at University at Albany, plus a High School Diploma, C-Tech at Chelsea Career And Technical Education High School. | `verifiedSources.answers.23.text` | Canonical LinkedIn specification; linked page entry |
| University at Albany — Master of Science, Cyber Risk Management & Compliance; Aug 2026 – May 2028; grade: In-Progress. Graduate component of the university's combined 4+1 B.S./M.S. program. University at Albany — Bachelor of Science - BS, Cybersecurity (Defense); 2023 – 2027; grade: 3.4. Currently pursuing a Bachelor of Science in Cybersecurity (Defensive) as part of the combined 4+1 B.S./M.S. program. Chelsea Career And Technical Education High School — High School Diploma, C-Tech; Sep 2019 – Jun 2023; grade: 3.2. Completed hands-on C-Tech training in telecommunications. | `verifiedSources.answers.23.detail` | Canonical LinkedIn specification; linked page entry |
| The five LinkedIn credentials are Wireless Technician; Grounding and Bonding Technician; Network Cabling Specialist Copper Systems; Telecommunications Technologies; sUAS Trust Certificate. | `verifiedSources.answers.24.text` | Canonical LinkedIn specification; linked page entry |
| Wireless Technician — C-Tech Associates Inc.; issued Jun 2023. Grounding and Bonding Technician — C-Tech Associates Inc.; issued Jun 2023. Network Cabling Specialist Copper Systems — C-Tech Associates Inc.; issued Jun 2023. Telecommunications Technologies — C-Tech Associates Inc.; issued Jun 2023. sUAS Trust Certificate — Federal Aviation Administration; issued Aug 2026. | `verifiedSources.answers.24.detail` | Canonical LinkedIn specification; linked page entry |
| Connect with Ashim through his LinkedIn profile or download the redacted public resume. | `verifiedSources.answers.25.text` | Canonical LinkedIn specification; linked page entry |
| The contact section links to https://www.linkedin.com/in/johnashim/ and the public resume. Private phone numbers, street addresses, and personal email addresses are not supplied. | `verifiedSources.answers.25.detail` | Canonical LinkedIn specification; linked page entry |
| I answer only from the canonical LinkedIn specification. If it does not support a detail, I cannot verify it. Ask about Profile Alignment, Projects, Work Experience, Leadership, Top Skills, Education, or Certifications. | `verifiedSources.answers.26.text` | Canonical LinkedIn specification; linked page entry |
| Choose a listed role, project, education entry, certification, or top skill. I can expand an approved answer, but cannot infer new credentials, employment, metrics, completed degrees, or implementation experience. | `verifiedSources.answers.26.detail` | Canonical LinkedIn specification; linked page entry |
| Ashim John (He/Him) — M.S Cybersecurity Risk & Management Compliance Student. University at Albany  /  ASIS&T. Location: Albany, New York Metropolitan Area. | `verifiedSources.answers.27.text` | Canonical LinkedIn specification; linked page entry |
| Ashim John (He/Him) — M.S Cybersecurity Risk & Management Compliance Student. University at Albany  /  ASIS&T. Location: Albany, New York Metropolitan Area. About: Translating technical vulnerabilities into actionable business strategies and ethical AI deployment. | `verifiedSources.answers.27.detail` | Canonical LinkedIn specification; linked page entry |
