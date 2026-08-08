import fs from "fs/promises";
import path from "path";

/**
 * Call Groq Llama model to draft legal facts and prayer in structured JSON
 * @param {object} metadata - Case parameters (petitioner, respondent, subject, etc.)
 * @param {string} transcript - Speech transcription text
 * @returns {Promise<{facts: string[], grounds: string[], prayer: string, subject: string, questionsOfLaw?: string[], extraMetadata?: object}>}
 */
export async function draftLegalContentWithGroq(metadata, transcript) {
  const systemPrompt = `You are an expert senior legal draftsman specializing in drafting pleadings for the Supreme Court of Pakistan and provincial High Courts (Lahore High Court, Islamabad High Court).
Your task is to analyze the case details and the transcription of the user's dispute, and write a structured legal draft.
You must respond with ONLY a JSON object in this format:
{
  "subject": "A short, concise, formal one-sentence legal subject summary, e.g. Seeking declaration against arbitrary sealing of commercial property without prior warning.",
  "facts": [
    "That the petitioner is a law-abiding citizen of Pakistan and is entitled to the protection of law under the Constitution.",
    "That on [Date], the respondent did..."
  ],
  "grounds": [
    "That the impugned action of the respondents is illegal, arbitrary, and violates Article 10A of the Constitution."
  ],
  "prayer": "The formal request clause asking the Court to declare the action illegal and grant relief.",
  "questionsOfLaw": [
    "Whether the respondents acted in a colorable exercise of power..."
  ],
  "extraMetadata": {
    "firNo": "Extract FIR No (e.g. 142/2026) if criminal case",
    "firDate": "Extract FIR registration date if criminal case",
    "offense": "Extract offenses (e.g. Section 324/34 PPC) if criminal case",
    "policeStation": "Extract police station name if criminal case",
    "suitValue": "Extract suit value if civil suit",
    "courtFee": "Extract calculated court fee if civil suit",
    "principalAmount": "Extract principal recovery amount if banking suit",
    "interestMarkup": "Extract markup/interest if banking suit",
    "totalClaim": "Extract total claim amount if banking suit",
    "companyName": "Extract company name if corporate case",
    "cuin": "Extract corporate CUIN if corporate case",
    "authorizedCapital": "Extract authorized capital if corporate case",
    "paidUpCapital": "Extract paid-up capital if corporate case",
    "registeredAddress": "Extract registered office address if corporate case",
    "taxYear": "Extract tax year if tax dispute",
    "assessedIncome": "Extract assessed income if tax dispute",
    "disputedTax": "Extract disputed tax demand if tax dispute",
    "tribunalOrderDate": "Extract Date of Tribunal Order if tax reference",
    "impugnedOrderDate": "Extract Date of impugned lower order/judgment",
    "impugnedCourt": "Extract Name of the impugned lower court/tribunal"
  }
}

Rules:
1. Write in formal legal English typical of Pakistan's superior courts.
2. Numbered paragraphs under 'facts' and 'grounds' must start with "That ...".
3. Extract and fill in the "extraMetadata" fields using dates, names, or values from the transcription. If not mentioned, omit the fields or use reasonable estimates.
4. Extract abstract "questionsOfLaw" if the dispute is a tax, appellate revision, or corporate matter. Otherwise, return an empty array.
5. Return ONLY the JSON object. No extra explanations outside of the JSON block.`;

  const userPrompt = `Target Court ID: ${metadata.courtId || "supreme_court"}
Case Document Type: ${metadata.documentTypeId || "petition"}
Petitioner: ${metadata.petitioner}
Respondent: ${metadata.respondent}
Case/Writ Number: ${metadata.caseNumber || "W.P. No. ____ / 2026"}
Advocate: ${metadata.advocate}
Speech Transcription: "${transcript}"`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        signal: AbortSignal.timeout(10000), // Timeout after 10 seconds
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error drafting document: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response returned from Groq drafting model.");
    }

    const parsed = JSON.parse(content);
    if (!parsed.facts || !Array.isArray(parsed.facts)) {
      throw new Error("Invalid structure returned from Groq: 'facts' is missing or not an array.");
    }

    return parsed;
  } catch (err) {
    console.warn("Groq drafting service failed or timed out. Falling back to structured heuristic draft generator:", err.message);

    const facts = [
      `That the petitioner is a law-abiding citizen of Pakistan and is entitled to the protection of law under the Constitution.`,
      `That the petitioner is aggrieved by the high-handed, illegal, and arbitrary actions of the respondents.`,
      `That the facts of the dispute are: ${transcript || metadata.subject || "No facts summary was provided."}`,
      `That the action of the respondents has been taken in a colorable exercise of power, without legal notice, and without giving the petitioner a fair opportunity of being heard.`
    ];

    const grounds = [
      `That the impugned action of the respondents is illegal, arbitrary, discriminative, and violates Articles 4, 10A, and 25 of the Constitution of Pakistan.`,
      `That the respondents have failed to perform their statutory duties in accordance with the law.`,
      `That the action is in complete violation of the principles of natural justice and fair play.`
    ];

    const questionsOfLaw = [
      `Whether the respondents acted in a colorable exercise of power and without lawful authority.`,
      `Whether the impugned action is in violation of the petitioner's fundamental constitutional rights.`
    ];

    const prayer = `It is most respectfully prayed that this Honorable Court may be pleased to accept this Petition, set aside the impugned actions of the respondents, and grant suitable relief as requested.`;

    return {
      subject: metadata.subject || "Constitutional challenge against arbitrary administrative actions",
      facts,
      grounds,
      questionsOfLaw,
      prayer,
      extraMetadata: metadata.extraMetadata || {}
    };
  }
}

/**
 * Loads the local court template and replaces variables to generate the final HTML
 * @param {object} metadata - Case parameters
 * @param {object} draftData - Generated legal facts/prayer/metadata from LLM
 * @returns {Promise<string>} - Complete compiled HTML string
 */
export async function compileTemplate(metadata, draftData) {
  // Resolve target court directory folder
  const courtId = metadata.courtId || "supreme_court";
  let folderName = "supreme_court";
  if (courtId === "islamabad_hc") {
    folderName = "islamabad_hc";
  } else if (courtId === "lahore_hc") {
    folderName = "lahore_hc";
  }

  // Determine template file based on document type (default to petition if invalid)
  const docType = metadata.documentTypeId || "petition";
  const templateFilename = `${docType}.html`;
  
  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    folderName,
    templateFilename
  );

  // Read template HTML file
  const rawHtml = await fs.readFile(templatePath, "utf-8");

  // Format facts array into HTML list item strings
  const factsListHtml = draftData.facts
    .map(fact => `    <li>${fact}</li>`)
    .join("\n");

  // Format grounds into a list
  const groundsListHtml = draftData.grounds
    ? draftData.grounds.map(ground => `    <li>${ground}</li>`).join("\n")
    : "";

  // Combine facts and grounds into single list if needed for standard templates
  const mergedStatementsHtml = groundsListHtml 
    ? `${factsListHtml}\n    <hr style="border-top: 1px dashed #cccccc; margin: 15px 0;"/>\n${groundsListHtml}` 
    : factsListHtml;

  // Format questions of law if present
  const questionsListHtml = draftData.questionsOfLaw && draftData.questionsOfLaw.length > 0
    ? draftData.questionsOfLaw.map(q => `    <li>${q}</li>`).join("\n")
    : "    <li>Whether the actions of the respondents are without lawful authority and of no legal effect.</li>";

  // Extra metadata block parsing
  const extra = {
    ...(draftData.extraMetadata || {}),
    ...(metadata.extraMetadata || {})
  };

  // Replace placeholders inside the template
  const compiledHtml = rawHtml
    .replace(/\{\{petitioner\}\}/g, metadata.petitioner || "")
    .replace(/\{\{respondent\}\}/g, metadata.respondent || "")
    .replace(/\{\{caseNumber\}\}/g, metadata.caseNumber || "W.P. No. _______ / 2026")
    .replace(/\{\{subject\}\}/g, draftData.subject || metadata.subject || "")
    .replace(/\{\{advocate\}\}/g, metadata.advocate || "[Advocate Name]")
    .replace(/\{\{draftDate\}\}/g, metadata.draftDate || new Date().toISOString().split("T")[0])
    .replace(/\{\{caseId\}\}/g, String(metadata.caseId || 1))
    .replace(/\{\{facts\}\}/g, mergedStatementsHtml)
    .replace(/\{\{grounds\}\}/g, groundsListHtml || "<li>That the impugned action violates fundamental rights under the Constitution.</li>")
    .replace(/\{\{prayer\}\}/g, draftData.prayer || "")
    .replace(/\{\{questionsOfLaw\}\}/g, questionsListHtml)
    // Extra Metadata Box replacements
    .replace(/\{\{firNo\}\}/g, extra.firNo || "_______")
    .replace(/\{\{firDate\}\}/g, extra.firDate || "_______")
    .replace(/\{\{offense\}\}/g, extra.offense || "_______")
    .replace(/\{\{policeStation\}\}/g, extra.policeStation || "_______")
    .replace(/\{\{suitValue\}\}/g, extra.suitValue || "_______")
    .replace(/\{\{courtFee\}\}/g, extra.courtFee || "_______")
    .replace(/\{\{principalAmount\}\}/g, extra.principalAmount || "_______")
    .replace(/\{\{interestMarkup\}\}/g, extra.interestMarkup || "_______")
    .replace(/\{\{totalClaim\}\}/g, extra.totalClaim || "_______")
    .replace(/\{\{companyName\}\}/g, extra.companyName || "_______")
    .replace(/\{\{cuin\}\}/g, extra.cuin || "_______")
    .replace(/\{\{authorizedCapital\}\}/g, extra.authorizedCapital || "_______")
    .replace(/\{\{paidUpCapital\}\}/g, extra.paidUpCapital || "_______")
    .replace(/\{\{registeredAddress\}\}/g, extra.registeredAddress || "_______")
    .replace(/\{\{taxYear\}\}/g, extra.taxYear || "_______")
    .replace(/\{\{assessedIncome\}\}/g, extra.assessedIncome || "_______")
    .replace(/\{\{disputedTax\}\}/g, extra.disputedTax || "_______")
    .replace(/\{\{tribunalOrderDate\}\}/g, extra.tribunalOrderDate || "_______")
    .replace(/\{\{impugnedOrderDate\}\}/g, extra.impugnedOrderDate || metadata.draftDate || "_______")
    .replace(/\{\{impugnedCourt\}\}/g, extra.impugnedCourt || "_______");

  return compiledHtml;
}
