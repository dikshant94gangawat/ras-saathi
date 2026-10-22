import type { Paper, Bi } from "@/lib/types";

// Illustrative structure: verify against the latest official RPSC RAS notification before publishing.
type RawSubject = [string, string[]];
type RawUnit = [string, RawSubject[]];

const bi = (s: string): Bi => {
  const [en, hi] = s.split("|").map((x) => x.trim());
  return { en, hi: hi ?? en };
};

function build(id: string, paper: string, title: string, units: RawUnit[]): Paper {
  return {
    _id: id,
    paper,
    title: bi(title),
    units: units.map(([ut, subs], ui) => ({
      unitId: `${id}-U${ui + 1}`,
      title: bi(ut),
      subjects: subs.map(([st, topics], si) => ({
        subjectId: `${id}-U${ui + 1}-S${si + 1}`,
        title: bi(st),
        topics: topics.map((t, ti) => ({ topicId: `${id}-U${ui + 1}-S${si + 1}-T${ti + 1}`, title: bi(t) })),
      })),
    })),
  };
}

export const SYLLABUS: Paper[] = [
  build("GS1", "GS-1", "History, Art, Culture & Geography | इतिहास, कला, संस्कृति एवं भूगोल", [
    ["History of India | भारत का इतिहास", [
      ["Ancient & Medieval India | प्राचीन एवं मध्यकालीन भारत", [
        "Indus Valley Civilization | सिंधु घाटी सभ्यता", "Mauryan & Gupta Empires | मौर्य एवं गुप्त साम्राज्य",
        "Delhi Sultanate | दिल्ली सल्तनत", "Mughal Administration | मुगल प्रशासन"]],
      ["Modern India | आधुनिक भारत", [
        "Revolt of 1857 | 1857 की क्रांति", "Socio-Religious Reform Movements | सामाजिक-धार्मिक सुधार आंदोलन",
        "Gandhian Era | गांधी युग", "Independence & Partition | स्वतंत्रता एवं विभाजन"]],
    ]],
    ["History & Culture of Rajasthan | राजस्थान का इतिहास एवं संस्कृति", [
      ["Rajasthan History | राजस्थान का इतिहास", [
        "Prehistoric Sites (Kalibangan, Ahar) | प्रागैतिहासिक स्थल", "Rajput Dynasties | राजपूत राजवंश",
        "Praja Mandal Movements | प्रजामंडल आंदोलन", "Integration of Rajasthan | राजस्थान का एकीकरण"]],
      ["Art, Literature & Heritage | कला, साहित्य एवं विरासत", [
        "Forts & Palaces | दुर्ग एवं महल", "Painting Schools | चित्रकला शैलियाँ",
        "Folk Music, Dance & Fairs | लोक संगीत, नृत्य एवं मेले", "Saints & Folk Deities | संत एवं लोक देवता"]],
    ]],
    ["Geography | भूगोल", [
      ["Geography of Rajasthan | राजस्थान का भूगोल", [
        "Physiographic Divisions | भौतिक विभाग", "Drainage & Lakes | अपवाह तंत्र एवं झीलें",
        "Soils & Agriculture | मृदा एवं कृषि", "Minerals & Industries | खनिज एवं उद्योग"]],
      ["Geography of India & World | भारत एवं विश्व का भूगोल", [
        "Monsoon & Climate | मानसून एवं जलवायु", "Rivers & Resources of India | भारत की नदियाँ एवं संसाधन",
        "Economic Geography | आर्थिक भूगोल"]],
    ]],
  ]),
  build("GS2", "GS-2", "Polity, Governance & Administration | राजव्यवस्था, शासन एवं प्रशासन", [
    ["Indian Constitution | भारतीय संविधान", [
      ["Constitutional Framework | संवैधानिक ढाँचा", [
        "Preamble & Basic Structure | प्रस्तावना एवं मूल ढाँचा", "Fundamental Rights & Duties | मूल अधिकार एवं कर्तव्य",
        "DPSP | नीति निदेशक तत्व", "Amendment Procedure | संशोधन प्रक्रिया"]],
      ["Union & State Government | संघ एवं राज्य सरकार", [
        "Parliament & Legislature | संसद एवं विधायिका", "Executive: President, Governor | कार्यपालिका",
        "Judiciary | न्यायपालिका", "Centre-State Relations | केंद्र-राज्य संबंध"]],
    ]],
    ["Rajasthan Polity & Administration | राजस्थान की राजव्यवस्था", [
      ["State Institutions | राज्य संस्थाएँ", [
        "Rajasthan Legislative Assembly | राजस्थान विधानसभा", "RPSC, Lokayukta, RHRC | आयोग एवं लोकायुक्त",
        "High Court of Rajasthan | राजस्थान उच्च न्यायालय"]],
      ["Local Governance | स्थानीय शासन", [
        "Panchayati Raj in Rajasthan | राजस्थान में पंचायती राज", "Urban Local Bodies | नगरीय निकाय",
        "73rd & 74th Amendments | 73वाँ एवं 74वाँ संशोधन"]],
    ]],
    ["Public Administration | लोक प्रशासन", [
      ["Administrative Theory | प्रशासनिक सिद्धांत", [
        "Weber, Taylor, Fayol | वेबर, टेलर, फेयोल", "Organization & Management | संगठन एवं प्रबंधन",
        "Public Policy | लोक नीति"]],
      ["Governance & Reforms | शासन एवं सुधार", [
        "E-Governance | ई-गवर्नेंस", "RTI & Citizen Charter | सूचना का अधिकार एवं नागरिक चार्टर",
        "Administrative Reforms | प्रशासनिक सुधार"]],
    ]],
  ]),
  build("GS3", "GS-3", "Economy, Science & Environment | अर्थव्यवस्था, विज्ञान एवं पर्यावरण", [
    ["Indian Economy | भारतीय अर्थव्यवस्था", [
      ["Macroeconomics | समष्टि अर्थशास्त्र", [
        "National Income | राष्ट्रीय आय", "Inflation & Monetary Policy | मुद्रास्फीति एवं मौद्रिक नीति",
        "Budget & Fiscal Policy | बजट एवं राजकोषीय नीति", "Banking & Financial Markets | बैंकिंग एवं वित्तीय बाज़ार"]],
      ["Planning & Development | नियोजन एवं विकास", [
        "Five Year Plans & NITI Aayog | पंचवर्षीय योजनाएँ एवं नीति आयोग", "Poverty & Unemployment | गरीबी एवं बेरोज़गारी",
        "Economic Survey Highlights | आर्थिक समीक्षा"]],
    ]],
    ["Rajasthan Economy | राजस्थान की अर्थव्यवस्था", [
      ["Sectoral Overview | क्षेत्रीय अवलोकन", [
        "Agriculture & Allied Sectors | कृषि एवं संबद्ध क्षेत्र", "Industry & MSME | उद्योग एवं MSME",
        "Rajasthan Budget & Schemes | राजस्थान बजट एवं योजनाएँ", "Energy & Infrastructure | ऊर्जा एवं आधारभूत ढाँचा"]],
    ]],
    ["Science, Technology & Environment | विज्ञान, प्रौद्योगिकी एवं पर्यावरण", [
      ["Science & Technology | विज्ञान एवं प्रौद्योगिकी", [
        "Space & Defence Technology | अंतरिक्ष एवं रक्षा प्रौद्योगिकी", "IT, AI & Biotechnology | सूचना प्रौद्योगिकी, AI, जैव प्रौद्योगिकी",
        "Health & Diseases | स्वास्थ्य एवं रोग"]],
      ["Environment & Ecology | पर्यावरण एवं पारिस्थितिकी", [
        "Biodiversity & Protected Areas | जैव विविधता एवं संरक्षित क्षेत्र", "Climate Change | जलवायु परिवर्तन",
        "Water Resources of Rajasthan | राजस्थान के जल संसाधन"]],
    ]],
  ]),
  build("GS4", "GS-4", "Ethics, Integrity & Aptitude | नीतिशास्त्र, सत्यनिष्ठा एवं अभिवृत्ति", [
    ["Ethics & Human Interface | नीतिशास्त्र एवं मानवीय सरोकार", [
      ["Foundations of Ethics | नीतिशास्त्र के आधार", [
        "Essence & Determinants of Ethics | नीति का सार एवं निर्धारक", "Human Values & Moral Thinkers | मानवीय मूल्य एवं चिंतक",
        "Attitude & Persuasion | अभिवृत्ति एवं अनुनयन"]],
    ]],
    ["Aptitude & Emotional Intelligence | अभिरुचि एवं भावनात्मक बुद्धि", [
      ["Civil Service Values | सिविल सेवा मूल्य", [
        "Integrity & Impartiality | सत्यनिष्ठा एवं निष्पक्षता", "Emotional Intelligence | भावनात्मक बुद्धि",
        "Probity in Governance | शासन में शुचिता"]],
    ]],
    ["Case Studies | केस स्टडी", [
      ["Applied Ethics | व्यावहारिक नीतिशास्त्र", [
        "Ethical Dilemmas in Administration | प्रशासन में नैतिक दुविधाएँ", "Conflict of Interest | हितों का टकराव",
        "Whistleblowing & Accountability | व्हिसलब्लोइंग एवं जवाबदेही"]],
    ]],
  ]),
];

export const ALL_TOPICS = SYLLABUS.flatMap((p) =>
  p.units.flatMap((u) =>
    u.subjects.flatMap((s) => s.topics.map((t) => ({ ...t, paperId: p._id, unitId: u.unitId, subjectId: s.subjectId })))
  )
);
export const TOPIC_ID_SET = new Set(ALL_TOPICS.map((t) => t.topicId));
export const TOTAL_TOPICS = ALL_TOPICS.length;
export const topicsOfPaper = (paperId: string) => ALL_TOPICS.filter((t) => t.paperId === paperId);
export const topicTitle = (id: string) => ALL_TOPICS.find((t) => t.topicId === id)?.title;
