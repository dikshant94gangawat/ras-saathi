import type { MockTest } from "@/lib/types";

type Q = MockTest["questions"][number];
const q = (id: string, qs: string, opts: string[], answer: number, exp: string): Q => {
  const sp = (s: string) => { const [en, hi] = s.split("|").map((x) => x.trim()); return { en, hi: hi ?? en }; };
  return { id, q: sp(qs), options: opts.map(sp), answer, explanation: sp(exp) };
};

export const TESTS: MockTest[] = [
  {
    id: "mini-1", title: "RAS Pre Mini Mock 1: Rajasthan GK", durationMinutes: 10, negativeMarking: 1 / 3, marksPerQuestion: 2,
    questions: [
      q("a1", "Which is the largest district of Rajasthan by area?|क्षेत्रफल की दृष्टि से राजस्थान का सबसे बड़ा जिला कौन-सा है?",
        ["Barmer|बाड़मेर", "Jaisalmer|जैसलमेर", "Bikaner|बीकानेर", "Jodhpur|जोधपुर"], 1, "Jaisalmer is the largest district by area.|जैसलमेर क्षेत्रफल में सबसे बड़ा जिला है।"),
      q("a2", "Sambhar Lake is a:|सांभर झील है:",
        ["Freshwater lake|मीठे पानी की झील", "Saltwater lake|खारे पानी की झील", "Oxbow lake|चापाकार झील", "Crater lake|क्रेटर झील"], 1, "It is India's largest inland saltwater lake.|यह भारत की सबसे बड़ी अंतर्देशीय खारे पानी की झील है।"),
      q("a3", "Kalibangan is located in which district?|कालीबंगा किस जिले में है?",
        ["Sri Ganganagar|श्रीगंगानगर", "Hanumangarh|हनुमानगढ़", "Churu|चूरू", "Bikaner|बीकानेर"], 1, "Kalibangan is on the Ghaggar (Saraswati) bed in Hanumangarh.|कालीबंगा हनुमानगढ़ में घग्घर तट पर है।"),
      q("a4", "The Battle of Haldighati was fought in:|हल्दीघाटी का युद्ध कब हुआ?",
        ["1526", "1556", "1576", "1605"], 2, "Akbar's forces vs Maharana Pratap, 1576.|अकबर की सेना बनाम महाराणा प्रताप, 1576।"),
      q("a5", "Keoladeo National Park is in:|केवलादेव राष्ट्रीय उद्यान कहाँ है?",
        ["Alwar|अलवर", "Bharatpur|भरतपुर", "Sawai Madhopur|सवाई माधोपुर", "Kota|कोटा"], 1, "Bharatpur; a UNESCO World Heritage site.|भरतपुर; यूनेस्को विश्व धरोहर स्थल।"),
      q("a6", "Which river is perennial in Rajasthan?|राजस्थान की कौन-सी नदी सदानीरा है?",
        ["Luni|लूनी", "Banas|बनास", "Chambal|चंबल", "Ghaggar|घग्घर"], 2, "Chambal is the only major perennial river.|चंबल एकमात्र प्रमुख सदानीरा नदी है।"),
      q("a7", "Rajasthan is the largest Indian state by:|राजस्थान किसमें भारत का सबसे बड़ा राज्य है?",
        ["Population|जनसंख्या", "Area|क्षेत्रफल", "Literacy|साक्षरता", "Forest cover|वन आवरण"], 1, "Largest by area.|क्षेत्रफल में सबसे बड़ा।"),
      q("a8", "Capital of Rajasthan is:|राजस्थान की राजधानी है:",
        ["Jodhpur|जोधपुर", "Udaipur|उदयपुर", "Jaipur|जयपुर", "Ajmer|अजमेर"], 2, "Jaipur, the Pink City.|जयपुर, गुलाबी नगरी।"),
    ],
  },
  {
    id: "polity-eco-1", title: "Sectional Test: Polity and Economy", durationMinutes: 8, negativeMarking: 1 / 3, marksPerQuestion: 2,
    questions: [
      q("b1", "Basic Structure doctrine originated in:|मूल ढाँचा सिद्धांत किस वाद से आया?",
        ["Golaknath", "Kesavananda Bharati|केशवानंद भारती", "Minerva Mills|मिनर्वा मिल्स", "Maneka Gandhi|मेनका गांधी"], 1, "Kesavananda Bharati v. State of Kerala (1973).|केशवानंद भारती वाद (1973)।"),
      q("b2", "Article 280 deals with:|अनुच्छेद 280 किससे संबंधित है?",
        ["Election Commission|निर्वाचन आयोग", "Finance Commission|वित्त आयोग", "CAG|नियंत्रक महालेखा परीक्षक", "UPSC|संघ लोक सेवा आयोग"], 1, "Finance Commission.|वित्त आयोग।"),
      q("b3", "73rd Amendment relates to:|73वाँ संशोधन किससे संबंधित है?",
        ["Municipalities|नगरपालिकाएँ", "Panchayati Raj|पंचायती राज", "Anti-defection|दल-बदल", "GST"], 1, "Constitutionalised Panchayati Raj (1992).|पंचायती राज को संवैधानिक दर्जा (1992)।"),
      q("b4", "Which authority sets the repo rate?|रेपो दर कौन तय करता है?",
        ["Finance Ministry|वित्त मंत्रालय", "SEBI", "RBI MPC|RBI की MPC", "NITI Aayog|नीति आयोग"], 2, "The RBI's Monetary Policy Committee.|RBI की मौद्रिक नीति समिति।"),
      q("b5", "Preamble was amended by which Amendment?|प्रस्तावना किस संशोधन द्वारा बदली गई?",
        ["24th|24वाँ", "42nd|42वाँ", "44th|44वाँ", "52nd|52वाँ"], 1, "42nd Amendment (1976) added Socialist, Secular, Integrity.|42वें संशोधन (1976) ने समाजवादी, पंथनिरपेक्ष, अखंडता जोड़े।"),
      q("b6", "Lokayukta in Rajasthan was established in:|राजस्थान में लोकायुक्त की स्थापना हुई:",
        ["1973", "1985", "1995", "2005"], 0, "Under the Rajasthan Lokayukta and Up-Lokayuktas Act, 1973.|राजस्थान लोकायुक्त एवं उप-लोकायुक्त अधिनियम, 1973।"),
    ],
  },
];

export const getTest = (id: string) => TESTS.find((t) => t.id === id);
