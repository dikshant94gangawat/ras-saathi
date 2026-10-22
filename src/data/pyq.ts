import type { PYQ } from "@/lib/types";

// SAMPLE placeholders for UI and schema testing. Replace with verified RPSC PYQs via the seed script.
const mk = (
  id: string, examYear: number, examPhase: "pre" | "mains", paperName: string, marks: 2 | 5 | 10,
  subjectTag: string, topicIds: string[], q: [string, string], a: [string, string]
): PYQ => ({
  _id: id, examYear, examPhase, paperName, marks, subjectTag, topicIds,
  question: { en: q[0], hi: q[1] }, modelAnswer: { en: a[0], hi: a[1] },
});

export const PYQS: PYQ[] = [
  mk("SAMPLE-M-GS1-001", 2021, "mains", "GS-1", 10, "Rajasthan History", ["GS1-U2-S1-T4"],
    ["Discuss the process of integration of Rajasthan in seven stages.", "राजस्थान के एकीकरण की प्रक्रिया को सात चरणों में समझाइए।"],
    ["Integration ran from 1948 to 1956: Matsya Union (Mar 1948), Greater Rajasthan stages, Rajasthan Union, United Rajasthan (1949), Greater Rajasthan (Mar 1949), Sirohi merger and the States Reorganisation of 1956, which merged Ajmer-Merwara and Abu Road tehsil. Conclude with the role of V.P. Menon and Sardar Patel.",
     "एकीकरण 1948 से 1956 तक चला: मत्स्य संघ, राजस्थान संघ, संयुक्त राजस्थान, वृहद राजस्थान, सिरोही विलय और 1956 का राज्य पुनर्गठन। निष्कर्ष में वी.पी. मेनन एवं सरदार पटेल की भूमिका लिखें।"]),
  mk("SAMPLE-M-GS1-002", 2018, "mains", "GS-1", 5, "Art & Culture", ["GS1-U2-S2-T2"],
    ["Write a note on Mewar and Kishangarh schools of painting.", "मेवाड़ एवं किशनगढ़ चित्रकला शैली पर टिप्पणी लिखिए।"],
    ["Mewar: bold colours, religious themes, Rasikapriya. Kishangarh: Bani Thani, elongated features, patronage of Raja Sawant Singh (Nagari Das).",
     "मेवाड़: चटख रंग, धार्मिक विषय। किशनगढ़: बणी-ठणी, लंबी आकृतियाँ, राजा सावंत सिंह (नागरीदास) का संरक्षण।"]),
  mk("SAMPLE-P-GS1-003", 2021, "pre", "Pre-GS", 2, "Geography", ["GS1-U3-S1-T3"],
    ["Which is the largest inland saltwater lake of India?", "भारत की सबसे बड़ी अंतर्देशीय खारे पानी की झील कौन-सी है?"],
    ["Sambhar Lake, Rajasthan.", "सांभर झील, राजस्थान।"]),
  mk("SAMPLE-M-GS2-004", 2020, "mains", "GS-2", 10, "Polity", ["GS2-U1-S1-T1"],
    ["Explain the Basic Structure doctrine and its significance.", "मूल ढाँचा सिद्धांत एवं उसके महत्व को स्पष्ट कीजिए।"],
    ["Kesavananda Bharati (1973) held that Parliament cannot alter the basic structure. Significance: protects supremacy of the Constitution, judicial review, federalism, secularism. Mention Minerva Mills and S.R. Bommai.",
     "केशवानंद भारती (1973) में सर्वोच्च न्यायालय ने कहा कि संसद मूल ढाँचा नहीं बदल सकती। महत्व: संविधान की सर्वोच्चता, न्यायिक पुनरावलोकन, संघवाद, पंथनिरपेक्षता।"]),
  mk("SAMPLE-M-GS2-005", 2019, "mains", "GS-2", 5, "Local Governance", ["GS2-U2-S2-T1"],
    ["Evaluate the working of Panchayati Raj in Rajasthan.", "राजस्थान में पंचायती राज की कार्यप्रणाली का मूल्यांकन कीजिए।"],
    ["Rajasthan was the first state to launch Panchayati Raj (Nagaur, 1959). Strengths: reservation for women, devolution. Challenges: finances, capacity, proxy representation.",
     "राजस्थान में पंचायती राज की शुरुआत नागौर (1959) से हुई। सशक्त पक्ष: महिला आरक्षण, विकेंद्रीकरण। चुनौतियाँ: वित्त, क्षमता, प्रतिनिधि-पति प्रथा।"]),
  mk("SAMPLE-P-GS2-006", 2018, "pre", "Pre-GS", 2, "Polity", ["GS2-U1-S1-T2"],
    ["Right to life and personal liberty is guaranteed under which Article?", "प्राण एवं दैहिक स्वतंत्रता का अधिकार किस अनुच्छेद में है?"],
    ["Article 21.", "अनुच्छेद 21।"]),
  mk("SAMPLE-M-GS3-007", 2021, "mains", "GS-3", 10, "Economy", ["GS3-U1-S1-T2"],
    ["Discuss the tools of monetary policy used by RBI to control inflation.", "मुद्रास्फीति नियंत्रण हेतु RBI द्वारा प्रयुक्त मौद्रिक नीति के उपकरणों की चर्चा कीजिए।"],
    ["Quantitative: repo, reverse repo, CRR, SLR, OMOs. Qualitative: margin requirements, moral suasion. Mention the inflation-targeting framework (4% ± 2%).",
     "मात्रात्मक: रेपो, रिवर्स रेपो, CRR, SLR, OMO। गुणात्मक: मार्जिन आवश्यकता, नैतिक दबाव। मुद्रास्फीति लक्ष्य (4% ± 2%) का उल्लेख करें।"]),
  mk("SAMPLE-M-GS3-008", 2022, "mains", "GS-3", 5, "Environment", ["GS3-U3-S2-T3"],
    ["Describe the water scarcity challenges of Rajasthan and the major conservation schemes.", "राजस्थान की जल संकट चुनौतियों एवं प्रमुख संरक्षण योजनाओं का वर्णन कीजिए।"],
    ["Challenges: low rainfall, groundwater over-exploitation. Schemes: Mukhyamantri Jal Swavlamban Abhiyan, IGNP, traditional johads and tankas.",
     "चुनौतियाँ: कम वर्षा, भूजल का अतिदोहन। योजनाएँ: मुख्यमंत्री जल स्वावलंबन अभियान, IGNP, जोहड़ एवं टाँके।"]),
  mk("SAMPLE-M-GS4-009", 2021, "mains", "GS-4", 10, "Ethics", ["GS4-U2-S1-T2"],
    ["What is emotional intelligence? How does it help a civil servant?", "भावनात्मक बुद्धि क्या है? यह लोक सेवक के लिए कैसे सहायक है?"],
    ["Goleman's model: self-awareness, self-regulation, motivation, empathy, social skills. Helps in conflict resolution, citizen empathy and decision-making under pressure.",
     "गोलमैन मॉडल: आत्म-जागरूकता, आत्म-नियमन, प्रेरणा, सहानुभूति, सामाजिक कौशल। संघर्ष समाधान एवं दबाव में निर्णय में सहायक।"]),
  mk("SAMPLE-P-GS3-010", 2022, "pre", "Pre-GS", 2, "Environment", ["GS3-U3-S2-T1"],
    ["Keoladeo National Park is located in which district?", "केवलादेव राष्ट्रीय उद्यान किस जिले में स्थित है?"],
    ["Bharatpur.", "भरतपुर।"]),
];

export const PYQ_YEARS = Array.from(new Set(PYQS.map((p) => p.examYear))).sort((a, b) => b - a);
export const PYQ_TAGS = Array.from(new Set(PYQS.map((p) => p.subjectTag))).sort();
